-- ============================================================================
-- MY MENU (by WebAtlass) — COMPLETE SUPABASE SCHEMA, RLS, RPCs, STORAGE & SEED
-- Run this entire script in one go inside the Supabase SQL Editor.
-- ============================================================================

create extension if not exists pgcrypto;

-- ============================================================================
-- 1. TABLES
-- ============================================================================

-- 1.1 Super Admins table
create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- 1.2 Businesses (Cafes & Restaurants)
create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete set null,
  slug text unique not null check (slug ~ '^[a-z0-9-]+$'),
  name text not null,
  tagline jsonb not null default '{"fr":"","ar":"","en":""}'::jsonb,
  logo_url text not null default '',
  cover_url text not null default '',
  colors jsonb not null default '{"primary":"#6BBF3A","accent":"#18181B","background":"#FAF8F5"}'::jsonb,
  whatsapp text not null default '',
  phone text not null default '',
  instagram text not null default '',
  city text not null default 'Agadir',
  address jsonb not null default '{"fr":"","ar":"","en":""}'::jsonb,
  maps_url text not null default '',
  languages text[] not null default array['ar','fr','en'],
  default_language text not null default 'ar',
  currency text not null default 'MAD',
  hours jsonb not null default '{
    "summary": {"fr":"Tous les jours de 08h00 à 23h30","ar":"يومياً من 08:00 صباحاً إلى 11:30 ليلاً","en":"Daily from 08:00 AM to 11:30 PM"},
    "weekly": {
      "monday": {"open":"08:00","close":"23:30","closed":false},
      "tuesday": {"open":"08:00","close":"23:30","closed":false},
      "wednesday": {"open":"08:00","close":"23:30","closed":false},
      "thursday": {"open":"08:00","close":"23:30","closed":false},
      "friday": {"open":"08:00","close":"23:59","closed":false},
      "saturday": {"open":"08:30","close":"23:59","closed":false},
      "sunday": {"open":"08:30","close":"23:30","closed":false}
    }
  }'::jsonb,
  order_types jsonb not null default '{"dineIn":true,"takeaway":true,"delivery":true}'::jsonb,
  delivery jsonb not null default '{"minimumOrder":50,"freeDeliveryThreshold":120,"zones":[]}'::jsonb,
  banner jsonb not null default '{"enabled":false,"badge":{"fr":"","ar":"","en":""},"title":{"fr":"","ar":"","en":""},"subtitle":{"fr":"","ar":"","en":""},"buttonText":{"fr":"","ar":"","en":""},"image":""}'::jsonb,
  table_count int not null default 10 check (table_count >= 0 and table_count <= 500),
  extra_tables text[] not null default '{}',
  is_active bool not null default true,
  accepting_orders bool not null default true,
  created_at timestamptz not null default now()
);

create index if not exists idx_businesses_slug on public.businesses(slug);
create index if not exists idx_businesses_owner on public.businesses(owner_id);

-- 1.3 Categories
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name jsonb not null default '{"fr":"","ar":"","en":""}'::jsonb,
  sort_order int not null default 0,
  is_visible bool not null default true,
  created_at timestamptz not null default now()
);

create index if not exists idx_categories_business on public.categories(business_id, sort_order);

-- 1.4 Menu Items
create table if not exists public.items (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  name jsonb not null default '{"fr":"","ar":"","en":""}'::jsonb,
  description jsonb not null default '{"fr":"","ar":"","en":""}'::jsonb,
  price numeric(10,2) not null default 0 check (price >= 0),
  image_url text not null default '',
  badges text[] not null default '{}',
  allergens jsonb not null default '{"fr":[],"ar":[],"en":[]}'::jsonb,
  options jsonb not null default '[]'::jsonb,
  is_available bool not null default true,
  is_popular bool not null default false,
  is_upsell bool not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_items_business on public.items(business_id, category_id, sort_order);

-- 1.5 Orders
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  code text not null,
  type text not null check (type in ('dineIn','takeaway','delivery')),
  table_label text,
  customer_name text not null default '',
  phone text not null default '',
  address text not null default '',
  delivery_zone jsonb,
  location_url text not null default '',
  items jsonb not null default '[]'::jsonb,
  subtotal numeric(10,2) not null default 0,
  delivery_fee numeric(10,2) not null default 0,
  total numeric(10,2) not null default 0,
  notes text not null default '',
  status text not null default 'new' check (status in ('new','confirmed','preparing','ready','delivered','cancelled')),
  created_at timestamptz not null default now()
);

create index if not exists idx_orders_business_created on public.orders(business_id, created_at desc);

-- 1.6 Customers (CRM per business)
create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null default '',
  phone text not null,
  orders_count int not null default 1,
  total_spent numeric(10,2) not null default 0,
  last_order_at timestamptz not null default now(),
  notes text not null default '',
  marketing_consent bool not null default false,
  created_at timestamptz not null default now(),
  unique (business_id, phone)
);

create index if not exists idx_customers_business_last on public.customers(business_id, last_order_at desc);

-- 1.7 Menu Events (Views, QR Scans, Orders)
create table if not exists public.menu_events (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  type text not null,
  table_label text,
  created_at timestamptz not null default now()
);

create index if not exists idx_menu_events_business_created on public.menu_events(business_id, created_at desc);

-- ============================================================================
-- 2. HELPER FUNCTIONS (Admin Check & Automatic Table Derivation)
-- ============================================================================

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.admins where user_id = auth.uid()
  );
$$;

-- Automatically derives table labels: "1" .. table_count + extra_tables
create or replace function public.get_business_tables(
  p_table_count int,
  p_extra_tables text[]
)
returns text[]
language sql
immutable
as $$
  select coalesce(
    array(
      select g::text
      from generate_series(1, greatest(coalesce(p_table_count, 0), 0)) as g
    ),
    array[]::text[]
  ) || coalesce(p_extra_tables, array[]::text[]);
$$;

-- ============================================================================
-- 3. ROW LEVEL SECURITY (RLS ON EVERYWHERE)
-- ============================================================================

alter table public.admins enable row level security;
alter table public.businesses enable row level security;
alter table public.categories enable row level security;
alter table public.items enable row level security;
alter table public.orders enable row level security;
alter table public.customers enable row level security;
alter table public.menu_events enable row level security;

-- 3.1 Admins policies
drop policy if exists "admins_select_self_or_admin" on public.admins;
create policy "admins_select_self_or_admin" on public.admins
  for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

drop policy if exists "admins_manage_by_admin" on public.admins;
create policy "admins_manage_by_admin" on public.admins
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- 3.2 Businesses policies
-- Anon can only read active businesses; owners read their own; admins read all
drop policy if exists "businesses_select_public_or_owner_or_admin" on public.businesses;
create policy "businesses_select_public_or_owner_or_admin" on public.businesses
  for select to anon, authenticated
  using (is_active = true or owner_id = auth.uid() or public.is_admin());

drop policy if exists "businesses_update_owner" on public.businesses;
create policy "businesses_update_owner" on public.businesses
  for update to authenticated
  using (owner_id = auth.uid() or public.is_admin())
  with check (owner_id = auth.uid() or public.is_admin());

drop policy if exists "businesses_admin_all" on public.businesses;
create policy "businesses_admin_all" on public.businesses
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- 3.3 Categories policies
-- Anon: read only visible categories of active businesses
drop policy if exists "categories_select_anon" on public.categories;
create policy "categories_select_anon" on public.categories
  for select to anon, authenticated
  using (
    (
      is_visible = true
      and exists (
        select 1 from public.businesses b
        where b.id = categories.business_id and b.is_active = true
      )
    )
    or exists (
      select 1 from public.businesses b
      where b.id = categories.business_id and b.owner_id = auth.uid()
    )
    or public.is_admin()
  );

drop policy if exists "categories_owner_or_admin_write" on public.categories;
create policy "categories_owner_or_admin_write" on public.categories
  for all to authenticated
  using (
    exists (
      select 1 from public.businesses b
      where b.id = categories.business_id and b.owner_id = auth.uid()
    )
    or public.is_admin()
  )
  with check (
    exists (
      select 1 from public.businesses b
      where b.id = categories.business_id and b.owner_id = auth.uid()
    )
    or public.is_admin()
  );

-- 3.4 Items policies
-- Anon: read only available items of visible categories on active businesses
drop policy if exists "items_select_anon_or_owner" on public.items;
create policy "items_select_anon_or_owner" on public.items
  for select to anon, authenticated
  using (
    (
      is_available = true
      and exists (
        select 1 from public.businesses b
        join public.categories c on c.business_id = b.id
        where b.id = items.business_id
          and c.id = items.category_id
          and b.is_active = true
          and c.is_visible = true
      )
    )
    or exists (
      select 1 from public.businesses b
      where b.id = items.business_id and b.owner_id = auth.uid()
    )
    or public.is_admin()
  );

drop policy if exists "items_owner_or_admin_write" on public.items;
create policy "items_owner_or_admin_write" on public.items
  for all to authenticated
  using (
    exists (
      select 1 from public.businesses b
      where b.id = items.business_id and b.owner_id = auth.uid()
    )
    or public.is_admin()
  )
  with check (
    exists (
      select 1 from public.businesses b
      where b.id = items.business_id and b.owner_id = auth.uid()
    )
    or public.is_admin()
  );

-- 3.5 Orders policies (NEVER accessible to anon; strictly isolated to owner or admin)
drop policy if exists "orders_owner_or_admin_all" on public.orders;
create policy "orders_owner_or_admin_all" on public.orders
  for all to authenticated
  using (
    exists (
      select 1 from public.businesses b
      where b.id = orders.business_id and b.owner_id = auth.uid()
    )
    or public.is_admin()
  )
  with check (
    exists (
      select 1 from public.businesses b
      where b.id = orders.business_id and b.owner_id = auth.uid()
    )
    or public.is_admin()
  );

-- 3.6 Customers policies (NEVER accessible to anon; strictly isolated to owner or admin)
drop policy if exists "customers_owner_or_admin_all" on public.customers;
create policy "customers_owner_or_admin_all" on public.customers
  for all to authenticated
  using (
    exists (
      select 1 from public.businesses b
      where b.id = customers.business_id and b.owner_id = auth.uid()
    )
    or public.is_admin()
  )
  with check (
    exists (
      select 1 from public.businesses b
      where b.id = customers.business_id and b.owner_id = auth.uid()
    )
    or public.is_admin()
  );

-- 3.7 Menu Events policies (Readable only by business owner or admin)
drop policy if exists "menu_events_owner_or_admin_select" on public.menu_events;
create policy "menu_events_owner_or_admin_select" on public.menu_events
  for select to authenticated
  using (
    exists (
      select 1 from public.businesses b
      where b.id = menu_events.business_id and b.owner_id = auth.uid()
    )
    or public.is_admin()
  );

-- ============================================================================
-- 4. SECURITY DEFINER RPC FUNCTIONS
-- ============================================================================

-- 4.1 get_menu(slug): Returns one complete JSON object for the public menu
create or replace function public.get_menu(p_slug text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_business public.businesses%rowtype;
  v_categories jsonb;
  v_upsell_ids jsonb;
begin
  select * into v_business
  from public.businesses
  where slug = lower(trim(p_slug))
  limit 1;

  if not found then
    return null;
  end if;

  -- If business is suspended/inactive, return minimal status so frontend displays
  -- the neutral "Menu temporarily unavailable" screen
  if not v_business.is_active then
    return jsonb_build_object(
      'id', v_business.id,
      'slug', v_business.slug,
      'name', v_business.name,
      'logo_url', v_business.logo_url,
      'colors', v_business.colors,
      'languages', v_business.languages,
      'default_language', v_business.default_language,
      'is_active', false
    );
  end if;

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'id', c.id,
        'name', c.name,
        'sort_order', c.sort_order,
        'items', coalesce(
          (
            select jsonb_agg(
              jsonb_build_object(
                'id', i.id,
                'name', i.name,
                'description', i.description,
                'price', i.price,
                'image', i.image_url,
                'popular', i.is_popular,
                'is_upsell', i.is_upsell,
                'is_available', i.is_available,
                'badges', case
                  when not i.is_available and not ('soldout' = any(i.badges))
                    then array_append(i.badges, 'soldout')
                  else i.badges
                end,
                'allergens', i.allergens,
                'options', i.options
              )
              order by i.sort_order asc, i.created_at asc
            )
            from public.items i
            where i.category_id = c.id
              and i.business_id = v_business.id
          ),
          '[]'::jsonb
        )
      )
      order by c.sort_order asc, c.created_at asc
    ),
    '[]'::jsonb
  )
  into v_categories
  from public.categories c
  where c.business_id = v_business.id
    and c.is_visible = true;

  select coalesce(jsonb_agg(i.id), '[]'::jsonb)
  into v_upsell_ids
  from public.items i
  where i.business_id = v_business.id
    and i.is_upsell = true
    and i.is_available = true;

  return jsonb_build_object(
    'id', v_business.id,
    'slug', v_business.slug,
    'name', v_business.name,
    'tagline', v_business.tagline,
    'logo', v_business.logo_url,
    'cover', v_business.cover_url,
    'colors', v_business.colors,
    'city', v_business.city,
    'languages', v_business.languages,
    'defaultLanguage', v_business.default_language,
    'currency', v_business.currency,
    'contact', jsonb_build_object(
      'whatsapp', v_business.whatsapp,
      'phone', v_business.phone,
      'instagram', v_business.instagram,
      'mapsLink', v_business.maps_url,
      'address', v_business.address
    ),
    'hours', coalesce(v_business.hours->'summary', '{"fr":"","ar":"","en":""}'::jsonb),
    'weeklyHours', coalesce(v_business.hours->'weekly', '{}'::jsonb),
    'promoBanner', v_business.banner,
    'upsellItemIds', v_upsell_ids,
    'orderTypes', v_business.order_types,
    'delivery', v_business.delivery,
    'tableCount', v_business.table_count,
    'extraTables', v_business.extra_tables,
    'tableLabels', to_jsonb(public.get_business_tables(v_business.table_count, v_business.extra_tables)),
    'isActive', v_business.is_active,
    'acceptingOrders', v_business.accepting_orders,
    'categories', v_categories
  );
end;
$$;

grant execute on function public.get_menu(text) to anon, authenticated;

-- 4.2 place_order(slug, payload): Validates input, recomputes prices from items table,
-- enforces minimum order, creates short order code, inserts order, upserts customer, returns code
create or replace function public.place_order(
  p_slug text,
  p_payload jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_business public.businesses%rowtype;
  v_type text;
  v_table_label text;
  v_valid_tables text[];
  v_customer_name text;
  v_phone text;
  v_address text;
  v_location_url text;
  v_notes text;
  v_marketing_consent boolean;
  v_zone_id text;
  v_zone jsonb;
  v_items_in jsonb;
  v_line jsonb;
  v_db_item public.items%rowtype;
  v_qty int;
  v_unit_price numeric(10,2);
  v_extra_price numeric(10,2);
  v_line_total numeric(10,2);
  v_subtotal numeric(10,2) := 0;
  v_delivery_fee numeric(10,2) := 0;
  v_min_order numeric(10,2) := 0;
  v_free_threshold numeric(10,2) := 0;
  v_total numeric(10,2) := 0;
  v_verified_items jsonb := '[]'::jsonb;
  v_opt_group jsonb;
  v_opt_choice jsonb;
  v_selected_ids jsonb;
  v_code text;
  v_order_id uuid;
begin
  select * into v_business
  from public.businesses
  where slug = lower(trim(p_slug))
  limit 1;

  if not found or not v_business.is_active then
    raise exception 'Business is not active or does not exist';
  end if;

  if not v_business.accepting_orders then
    raise exception 'This business is currently not accepting new orders';
  end if;

  v_type := coalesce(p_payload->>'type', 'dineIn');
  if v_type not in ('dineIn', 'takeaway', 'delivery') then
    raise exception 'Invalid order type';
  end if;

  if not coalesce((v_business.order_types->>v_type)::boolean, true) then
    raise exception 'Selected order type is disabled for this business';
  end if;

  -- Validate table label against business's derived table list
  v_table_label := nullif(trim(coalesce(p_payload->>'table_label', '')), '');
  if v_table_label is not null then
    v_valid_tables := public.get_business_tables(v_business.table_count, v_business.extra_tables);
    -- Keep canonical label if valid, otherwise allow manual table input for dineIn
    for i in 1 .. coalesce(array_length(v_valid_tables, 1), 0) loop
      if lower(v_valid_tables[i]) = lower(v_table_label) then
        v_table_label := v_valid_tables[i];
        exit;
      end if;
    end loop;
  end if;

  v_customer_name := trim(coalesce(p_payload->>'customer_name', ''));
  v_phone := trim(coalesce(p_payload->>'phone', ''));
  v_address := trim(coalesce(p_payload->>'address', ''));
  v_location_url := trim(coalesce(p_payload->>'location_url', ''));
  v_notes := trim(coalesce(p_payload->>'notes', ''));
  v_marketing_consent := coalesce((p_payload->>'marketing_consent')::boolean, false);
  v_zone_id := trim(coalesce(p_payload->>'delivery_zone_id', ''));

  v_items_in := coalesce(p_payload->'items', '[]'::jsonb);
  if jsonb_typeof(v_items_in) <> 'array' or jsonb_array_length(v_items_in) = 0 then
    raise exception 'Order must contain at least one item';
  end if;

  -- Recompute prices strictly from public.items
  for v_line in select * from jsonb_array_elements(v_items_in) loop
    v_qty := greatest(coalesce((v_line->>'quantity')::int, 1), 1);

    select * into v_db_item
    from public.items
    where id::text = (v_line->>'item_id')
      and business_id = v_business.id
      and is_available = true
    limit 1;

    if not found then
      raise exception 'Item % is unavailable or does not belong to this business', coalesce(v_line->>'item_id', 'unknown');
    end if;

    v_extra_price := 0;
    if jsonb_typeof(v_db_item.options) = 'array' and jsonb_typeof(v_line->'selected_options') = 'object' then
      for v_opt_group in select * from jsonb_array_elements(v_db_item.options) loop
        v_selected_ids := coalesce(v_line->'selected_options'->(v_opt_group->>'id'), '[]'::jsonb);
        if jsonb_typeof(v_selected_ids) = 'array' and jsonb_typeof(v_opt_group->'choices') = 'array' then
          for v_opt_choice in select * from jsonb_array_elements(v_opt_group->'choices') loop
            if v_selected_ids ? (v_opt_choice->>'id') then
              v_extra_price := v_extra_price + coalesce((v_opt_choice->>'price')::numeric, 0);
            end if;
          end loop;
        end if;
      end loop;
    end if;

    v_unit_price := v_db_item.price + v_extra_price;
    v_line_total := v_unit_price * v_qty;
    v_subtotal := v_subtotal + v_line_total;

    v_verified_items := v_verified_items || jsonb_build_array(
      jsonb_build_object(
        'item_id', v_db_item.id,
        'name', v_db_item.name,
        'quantity', v_qty,
        'unit_price', v_unit_price,
        'line_total', v_line_total,
        'selected_options', coalesce(v_line->'selected_options', '{}'::jsonb),
        'option_labels', coalesce(v_line->'option_labels', '[]'::jsonb),
        'note', coalesce(v_line->>'note', '')
      )
    );
  end loop;

  -- Enforce delivery minimum order & compute delivery fee
  if v_type = 'delivery' then
    v_min_order := coalesce((v_business.delivery->>'minimumOrder')::numeric, 0);
    if v_subtotal < v_min_order then
      raise exception 'Subtotal (%) is below minimum delivery order (%)', v_subtotal, v_min_order;
    end if;

    v_free_threshold := coalesce((v_business.delivery->>'freeDeliveryThreshold')::numeric, 0);
    if jsonb_typeof(v_business.delivery->'zones') = 'array' then
      select z into v_zone
      from jsonb_array_elements(v_business.delivery->'zones') z
      where (z->>'id') = v_zone_id
      limit 1;

      if v_zone is null then
        select z into v_zone
        from jsonb_array_elements(v_business.delivery->'zones') z
        limit 1;
      end if;
    end if;

    if v_free_threshold > 0 and v_subtotal >= v_free_threshold then
      v_delivery_fee := 0;
    else
      v_delivery_fee := coalesce((v_zone->>'fee')::numeric, 0);
    end if;
  end if;

  v_total := v_subtotal + v_delivery_fee;

  -- Generate short human-friendly order code (e.g. MM-4829)
  v_code := 'MM-' || upper(substring(encode(gen_random_bytes(3), 'hex') from 1 for 4));

  insert into public.orders (
    business_id,
    code,
    type,
    table_label,
    customer_name,
    phone,
    address,
    delivery_zone,
    location_url,
    items,
    subtotal,
    delivery_fee,
    total,
    notes,
    status
  ) values (
    v_business.id,
    v_code,
    v_type,
    v_table_label,
    v_customer_name,
    v_phone,
    v_address,
    v_zone,
    v_location_url,
    v_verified_items,
    v_subtotal,
    v_delivery_fee,
    v_total,
    v_notes,
    'new'
  )
  returning id into v_order_id;

  -- Upsert customer record when phone or customer_name is provided
  if v_phone <> '' or v_customer_name <> '' then
    insert into public.customers (
      business_id,
      name,
      phone,
      orders_count,
      total_spent,
      last_order_at,
      marketing_consent
    ) values (
      v_business.id,
      case when v_customer_name <> '' then v_customer_name else coalesce('Table ' || v_table_label, 'Client') end,
      case when v_phone <> '' then v_phone else coalesce('table-' || coalesce(v_table_label, 'dinein'), 'walk-in') end,
      1,
      v_total,
      now(),
      v_marketing_consent
    )
    on conflict (business_id, phone) do update
      set name = case when excluded.name <> '' then excluded.name else public.customers.name end,
          orders_count = public.customers.orders_count + 1,
          total_spent = public.customers.total_spent + excluded.total_spent,
          last_order_at = now(),
          marketing_consent = public.customers.marketing_consent or excluded.marketing_consent;
  end if;

  -- Record order event
  insert into public.menu_events (business_id, type, table_label)
  values (v_business.id, 'order', v_table_label);

  return jsonb_build_object(
    'order_id', v_order_id,
    'code', v_code,
    'subtotal', v_subtotal,
    'delivery_fee', v_delivery_fee,
    'total', v_total,
    'table_label', v_table_label
  );
end;
$$;

grant execute on function public.place_order(text, jsonb) to anon, authenticated;

-- 4.3 track_event(slug, type, table_label)
create or replace function public.track_event(
  p_slug text,
  p_type text,
  p_table_label text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_business_id uuid;
begin
  select id into v_business_id
  from public.businesses
  where slug = lower(trim(p_slug))
    and is_active = true
  limit 1;

  if v_business_id is not null then
    insert into public.menu_events (business_id, type, table_label)
    values (v_business_id, coalesce(nullif(trim(p_type), ''), 'view'), nullif(trim(coalesce(p_table_label, '')), ''));
  end if;
end;
$$;

grant execute on function public.track_event(text, text, text) to anon, authenticated;

-- 4.4 create_business(name, slug, owner_email, table_count) — ADMINS ONLY
create or replace function public.create_business(
  p_name text,
  p_slug text,
  p_owner_email text,
  p_table_count int default 10
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_owner_id uuid;
  v_business_id uuid;
  v_clean_slug text;
begin
  if not public.is_admin() then
    raise exception 'Forbidden: Only super admins can create a business';
  end if;

  v_clean_slug := lower(regexp_replace(trim(p_slug), '[^a-z0-9-]+', '-', 'g'));
  if v_clean_slug = '' then
    raise exception 'Invalid business slug';
  end if;

  if trim(coalesce(p_owner_email, '')) <> '' then
    select id into v_owner_id
    from auth.users
    where lower(email) = lower(trim(p_owner_email))
    limit 1;
  end if;

  insert into public.businesses (
    owner_id,
    slug,
    name,
    tagline,
    colors,
    table_count,
    is_active,
    accepting_orders
  ) values (
    v_owner_id,
    v_clean_slug,
    trim(p_name),
    jsonb_build_object(
      'fr', 'Bienvenue chez ' || trim(p_name),
      'ar', 'مرحباً بكم في ' || trim(p_name),
      'en', 'Welcome to ' || trim(p_name)
    ),
    '{"primary":"#6BBF3A","accent":"#18181B","background":"#FAF8F5"}'::jsonb,
    greatest(coalesce(p_table_count, 10), 1),
    true,
    true
  )
  returning id into v_business_id;

  -- Create default categories for the new client
  insert into public.categories (business_id, name, sort_order, is_visible)
  values
    (
      v_business_id,
      '{"fr":"Boissons Chaudes & Froides","ar":"مشروبات ساخنة وباردة","en":"Hot & Cold Drinks"}'::jsonb,
      1,
      true
    ),
    (
      v_business_id,
      '{"fr":"Petit-Déjeuner & Gourmandises","ar":"فطور الصباح وحلويات","en":"Breakfast & Pastries"}'::jsonb,
      2,
      true
    );

  return v_business_id;
end;
$$;

grant execute on function public.create_business(text, text, text, int) to authenticated;

-- 4.5 admin_set_owner_by_email(business_id, owner_email) — ADMINS ONLY
create or replace function public.admin_set_owner_by_email(
  p_business_id uuid,
  p_owner_email text
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_owner_id uuid;
begin
  if not public.is_admin() then
    raise exception 'Forbidden: Only super admins can assign business owners';
  end if;

  select id into v_owner_id
  from auth.users
  where lower(email) = lower(trim(p_owner_email))
  limit 1;

  if v_owner_id is null then
    raise exception 'No user found in auth.users with email %', p_owner_email;
  end if;

  update public.businesses
  set owner_id = v_owner_id
  where id = p_business_id;

  return found;
end;
$$;

grant execute on function public.admin_set_owner_by_email(uuid, text) to authenticated;

-- ============================================================================
-- 5. STORAGE BUCKET: "menu-images" (Public read, images only, max 2 MB)
-- ============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'menu-images',
  'menu-images',
  true,
  2097152, -- 2 MB max
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update
  set public = true,
      file_size_limit = 2097152,
      allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

drop policy if exists "menu_images_public_read" on storage.objects;
create policy "menu_images_public_read" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'menu-images');

drop policy if exists "menu_images_owner_or_admin_insert" on storage.objects;
create policy "menu_images_owner_or_admin_insert" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'menu-images'
    and (
      public.is_admin()
      or exists (
        select 1 from public.businesses b
        where b.owner_id = auth.uid()
          and (storage.foldername(name))[1] = b.id::text
      )
    )
  );

drop policy if exists "menu_images_owner_or_admin_update" on storage.objects;
create policy "menu_images_owner_or_admin_update" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'menu-images'
    and (
      public.is_admin()
      or exists (
        select 1 from public.businesses b
        where b.owner_id = auth.uid()
          and (storage.foldername(name))[1] = b.id::text
      )
    )
  );

drop policy if exists "menu_images_owner_or_admin_delete" on storage.objects;
create policy "menu_images_owner_or_admin_delete" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'menu-images'
    and (
      public.is_admin()
      or exists (
        select 1 from public.businesses b
        where b.owner_id = auth.uid()
          and (storage.foldername(name))[1] = b.id::text
      )
    )
  );

-- ============================================================================
-- 6. SUPABASE REALTIME FOR ORDERS
-- ============================================================================

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'orders'
  ) then
    alter publication supabase_realtime add table public.orders;
  end if;
exception
  when others then null;
end $$;

-- ============================================================================
-- 7. SEED: BUSINESS SLUG "demo" (Green My Menu theme, 2 categories, 6 items, table_count 12)
-- ============================================================================

do $$
declare
  v_demo_id uuid;
  v_cat_drinks uuid;
  v_cat_food uuid;
begin
  insert into public.businesses (
    slug,
    name,
    tagline,
    logo_url,
    cover_url,
    colors,
    whatsapp,
    phone,
    instagram,
    city,
    address,
    maps_url,
    languages,
    default_language,
    currency,
    order_types,
    delivery,
    banner,
    table_count,
    extra_tables,
    is_active,
    accepting_orders
  ) values (
    'demo',
    'Marina Sol Café',
    '{"ar":"قهوة مختصة، فطور بلدي مغربي وإطلالة على مارينا أكادير","fr":"Café de spécialité, petit-déjeuner beldi & vue sur la Marina d’Agadir","en":"Specialty coffee, Moroccan beldi breakfast & Agadir Marina view"}'::jsonb,
    'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=320&q=80&fm=webp',
    'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200&q=80&fm=webp',
    '{"primary":"#6BBF3A","accent":"#18181B","background":"#FAF8F5"}'::jsonb,
    '212633226714',
    '+212 6 33 22 67 14',
    'https://instagram.com/mymenu.ma',
    'Agadir',
    '{"ar":"كورنيش مارينا أكادير، الشطر 2، أكادير 80000، المغرب","fr":"Corniche Marina d’Agadir, Quai Principal, 80000 Agadir, Maroc","en":"Agadir Marina Corniche, Main Pier, 80000 Agadir, Morocco"}'::jsonb,
    'https://maps.google.com/?q=Marina+Agadir+Morocco',
    array['ar','fr','en'],
    'ar',
    'MAD',
    '{"dineIn":true,"takeaway":true,"delivery":true}'::jsonb,
    '{
      "minimumOrder": 50,
      "freeDeliveryThreshold": 120,
      "zones": [
        {"id":"marina-centre","name":{"ar":"مارينا ووسط مدينة أكادير","fr":"Marina & Centre-Ville Agadir","en":"Agadir Marina & City Center"},"fee":10,"estimatedTime":{"ar":"20 إلى 30 دقيقة","fr":"20 à 30 min","en":"20 to 30 mins"}},
        {"id":"talborjt-founty","name":{"ar":"تالبرجت، فونتي وحي الداخلة","fr":"Talborjt, Founty & Hay Dakhla","en":"Talborjt, Founty & Hay Dakhla"},"fee":15,"estimatedTime":{"ar":"30 إلى 40 دقيقة","fr":"30 à 40 min","en":"30 to 40 mins"}}
      ]
    }'::jsonb,
    '{
      "enabled": true,
      "badge": {"ar":"عرض الصباح • مارينا أكادير","fr":"Offre Matinale • Marina Agadir","en":"Morning Special • Agadir Marina"},
      "title": {"ar":"فطور بلدي سوسي متكامل مع أملو وأركان","fr":"Ftour Beldi Soussi Complet avec Amlou & Argan","en":"Complete Soussi Beldi Breakfast with Amlou & Argan"},
      "subtitle": {"ar":"مسمن، حرشة، بيض بلدي، عصير برتقال سوس الطازج ومشروب ساخن من اختيارك","fr":"Msemen, harcha, œufs beldi, jus d’orange pressé du Souss & boisson chaude au choix","en":"Msemen, harcha, farm eggs, fresh Souss orange juice & your choice of hot drink"},
      "buttonText": {"ar":"اكتشف القائمة","fr":"Découvrir la sélection","en":"Explore selection"},
      "image": "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200&q=80&fm=webp"
    }'::jsonb,
    12,
    array['Terrasse 1', 'VIP'],
    true,
    true
  )
  on conflict (slug) do update
    set colors = excluded.colors,
        table_count = excluded.table_count,
        extra_tables = excluded.extra_tables
  returning id into v_demo_id;

  -- Only seed categories and items if none exist yet for "demo"
  if not exists (select 1 from public.categories where business_id = v_demo_id) then
    insert into public.categories (business_id, name, sort_order, is_visible)
    values (
      v_demo_id,
      '{"ar":"قهوة وعصائر طازجة","fr":"Café & Jus Frais","en":"Coffee & Fresh Juices"}'::jsonb,
      1,
      true
    ) returning id into v_cat_drinks;

    insert into public.categories (business_id, name, sort_order, is_visible)
    values (
      v_demo_id,
      '{"ar":"فطور، أطباق وحلويات","fr":"Ftour, Plats & Douceurs","en":"Breakfast, Dishes & Sweets"}'::jsonb,
      2,
      true
    ) returning id into v_cat_food;

    -- 3 items in Category 1 (Drinks)
    insert into public.items (
      business_id, category_id, name, description, price, image_url, badges, options, is_available, is_popular, is_upsell, sort_order
    ) values
    (
      v_demo_id,
      v_cat_drinks,
      '{"ar":"قهوة نص نص مغربية أرابيكا","fr":"Café Nous-Nous Marocain Pur Arabica","en":"Moroccan Nous-Nous Arabica Coffee"}'::jsonb,
      '{"ar":"نصف إسبريسو إيطالي مركز ونصف حليب طازج برغوة كريمية ناعمة يقدم على الطريقة المغربية.","fr":"Moitié espresso italien intense, moitié lait chaud moussé à la marocaine servi en verre.","en":"Half rich Italian espresso, half steamed velvety milk served in a traditional glass."}'::jsonb,
      18,
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80&fm=webp',
      array['popular'],
      '[
        {"id":"size","name":{"ar":"الحجم","fr":"Taille","en":"Size"},"type":"single","required":true,"choices":[
          {"id":"regular","name":{"ar":"عادي","fr":"Classique","en":"Regular"},"price":0},
          {"id":"large","name":{"ar":"كبير (دوبل شوت)","fr":"Grand (Double shot)","en":"Large (Double shot)"},"price":6}
        ]},
        {"id":"extras","name":{"ar":"إضافات","fr":"Suppléments","en":"Extras"},"type":"multiple","choices":[
          {"id":"oat-milk","name":{"ar":"حليب الشوفان","fr":"Lait d’avoine","en":"Oat milk"},"price":5},
          {"id":"caramel","name":{"ar":"نكهة الكراميل","fr":"Sirop caramel","en":"Caramel syrup"},"price":4}
        ]}
      ]'::jsonb,
      true,
      true,
      false,
      1
    ),
    (
      v_demo_id,
      v_cat_drinks,
      '{"ar":"أتاي مغربي بالنعناع الطازج","fr":"Thé Marocain à la Menthe Fraîche","en":"Traditional Moroccan Mint Tea"}'::jsonb,
      '{"ar":"براد أتاي شعرية أصيل مشحر بالنعناع الطازج، يقدم مع غريبة اللوز المغربية.","fr":"Théière traditionnelle de thé vert gunpowder infusé à la menthe fraîche.","en":"Authentic teapot of green tea infused with fresh mint leaves."}'::jsonb,
      20,
      'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80&fm=webp',
      array['vegetarian'],
      '[]'::jsonb,
      true,
      false,
      true,
      2
    ),
    (
      v_demo_id,
      v_cat_drinks,
      '{"ar":"عصير برتقال سوس الطبيعي","fr":"Jus d’Orange Frais Pressé du Souss","en":"Fresh Squeezed Souss Orange Juice"}'::jsonb,
      '{"ar":"عصير برتقال طبيعي 100% معصور عند الطلب من بساتين سوس بدون سكر مضاف.","fr":"100% pur jus d’oranges de la vallée du Souss pressées à la minute, sans sucre ajouté.","en":"100% pure Souss valley oranges freshly squeezed to order, no added sugar."}'::jsonb,
      22,
      'https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=600&q=80&fm=webp',
      array['popular','vegetarian'],
      '[]'::jsonb,
      true,
      true,
      true,
      3
    );

    -- 3 items in Category 2 (Food & Sweets)
    insert into public.items (
      business_id, category_id, name, description, price, image_url, badges, options, is_available, is_popular, is_upsell, sort_order
    ) values
    (
      v_demo_id,
      v_cat_food,
      '{"ar":"فطور أمازيغي بلدي (أملو وأركان)","fr":"Ftour Beldi Amazigh (Amlou & Argan)","en":"Amazigh Beldi Breakfast (Amlou & Argan)"}'::jsonb,
      '{"ar":"مسمن، حرشة، بطبوط، بيضتان بلديتان، أملو باللوز، زيت أركان، عسل حر، عصير برتقال ومشروب ساخن.","fr":"Msemen, harcha, batbout, 2 œufs beldi, amlou aux amandes, huile d’argan, miel pur, jus d’orange et boisson chaude.","en":"Msemen, harcha, batbout, 2 farm eggs, almond amlou, argan oil, pure honey, fresh orange juice & hot drink."}'::jsonb,
      58,
      'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=600&q=80&fm=webp',
      array['popular','new'],
      '[
        {"id":"hot-drink","name":{"ar":"المشروب الساخن المرافق","fr":"Boisson chaude incluse","en":"Included hot drink"},"type":"single","required":true,"choices":[
          {"id":"mint-tea","name":{"ar":"أتاي مغربي بالنعناع","fr":"Thé à la menthe","en":"Moroccan mint tea"},"price":0},
          {"id":"nous-nous","name":{"ar":"قهوة نص نص","fr":"Café Nous-Nous","en":"Nous-Nous coffee"},"price":0}
        ]}
      ]'::jsonb,
      true,
      true,
      false,
      1
    ),
    (
      v_demo_id,
      v_cat_food,
      '{"ar":"بيتزا مارغريتا نابوليتانا على الحطب","fr":"Pizza Margherita Napolitaine au Feu de Bois","en":"Wood-Fired Neapolitan Margherita Pizza"}'::jsonb,
      '{"ar":"عجينة مخمرة 48 ساعة، صلصة طماطم سان مارزانو، موزاريلا فيور دي لاتي طازجة، ريحان وزيت زيتون بكر.","fr":"Pâte maturée 48h, sauce tomate San Marzano, mozzarella fior di latte, basilic frais et huile d’olive vierge.","en":"48h fermented dough, San Marzano tomato sauce, fresh fior di latte mozzarella, sweet basil & olive oil."}'::jsonb,
      55,
      'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?auto=format&fit=crop&w=600&q=80&fm=webp',
      array['popular','vegetarian'],
      '[]'::jsonb,
      true,
      true,
      false,
      2
    ),
    (
      v_demo_id,
      v_cat_food,
      '{"ar":"تيراميسو إيطالي بالقهوة والماسكاربوني","fr":"Tiramisu Italien au Café & Mascarpone","en":"Artisanal Coffee & Mascarpone Tiramisu"}'::jsonb,
      '{"ar":"بسكويت سافوياردي مشرب بإسبريسو أرابيكا مع كريمة الماسكاربوني الخفيفة والكاكاو الخام.","fr":"Biscuits cuillère imbibés d’espresso arabica, crème onctueuse au mascarpone et cacao pur.","en":"Savoiardi ladyfingers soaked in arabica espresso, velvety mascarpone cream & pure cocoa."}'::jsonb,
      36,
      'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=600&q=80&fm=webp',
      array['popular'],
      '[]'::jsonb,
      true,
      true,
      true,
      3
    );
  end if;
end $$;
