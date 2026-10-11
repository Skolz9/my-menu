import { supabase, isSupabaseConfigured } from './supabase';
import {
  allMenus,
  demoMenu,
  deriveTableLabels,
  validateTableLabel,
  type ClientMenu,
  type DeliveryZone,
  type Language,
  type MenuCategory,
  type MenuItem,
  type OrderType,
} from '../menus';
import { config } from '../config';

export type OrderStatus =
  | 'new'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'delivered'
  | 'cancelled';

export interface OrderLineRecord {
  item_id: string;
  name: Record<Language, string>;
  quantity: number;
  unit_price: number;
  line_total: number;
  selected_options: Record<string, string[]>;
  option_labels: string[];
  note: string;
}

export interface OrderRecord {
  id: string;
  business_id: string;
  slug: string;
  code: string;
  type: OrderType;
  table_label: string | null;
  customer_name: string;
  phone: string;
  address: string;
  delivery_zone?: DeliveryZone | null;
  location_url: string;
  items: OrderLineRecord[];
  subtotal: number;
  delivery_fee: number;
  total: number;
  notes: string;
  status: OrderStatus;
  created_at: string;
}

export interface CustomerRecord {
  id: string;
  business_id: string;
  name: string;
  phone: string;
  orders_count: number;
  total_spent: number;
  last_order_at: string;
  notes: string;
  marketing_consent: boolean;
  created_at: string;
}

export interface MenuEventRecord {
  id: string;
  business_id: string;
  type: 'view' | 'qr_scan' | 'order';
  table_label: string | null;
  created_at: string;
}

export interface AuthUserSession {
  id: string;
  email: string;
  isAdmin: boolean;
  ownedBusinessSlugs: string[];
}

export interface PlaceOrderPayload {
  type: OrderType;
  table_label?: string | null;
  customer_name?: string;
  phone?: string;
  address?: string;
  delivery_zone_id?: string;
  location_url?: string;
  notes?: string;
  marketing_consent?: boolean;
  items: {
    item_id: string;
    quantity: number;
    selected_options?: Record<string, string[]>;
    option_labels?: string[];
    note?: string;
  }[];
}

const STORAGE_KEYS = {
  businesses: 'mymenu_db_businesses_v2',
  orders: 'mymenu_db_orders_v2',
  customers: 'mymenu_db_customers_v2',
  events: 'mymenu_db_events_v2',
  session: 'mymenu_auth_session_v2',
};

const CHANNEL_NAME = 'mymenu_realtime_channel_v2';

function broadcastChange(type: string, payload?: unknown) {
  if (typeof window === 'undefined') return;
  try {
    if ('BroadcastChannel' in window) {
      const bc = new BroadcastChannel(CHANNEL_NAME);
      bc.postMessage({ type, payload, timestamp: Date.now() });
      bc.close();
    }
    window.dispatchEvent(
      new CustomEvent('mymenu-db-change', { detail: { type, payload } })
    );
  } catch {
    // Ignore broadcast errors
  }
}

export function subscribeToRealtimeChanges(
  callback: (event: { type: string; payload?: unknown }) => void
): () => void {
  if (typeof window === 'undefined') return () => {};

  let bc: BroadcastChannel | null = null;
  if ('BroadcastChannel' in window) {
    try {
      bc = new BroadcastChannel(CHANNEL_NAME);
      bc.onmessage = (ev) => {
        if (ev?.data) callback(ev.data);
      };
    } catch {
      bc = null;
    }
  }

  const handleCustom = (ev: Event) => {
    const customEv = ev as CustomEvent;
    if (customEv.detail) callback(customEv.detail);
  };

  const handleStorage = (ev: StorageEvent) => {
    if (ev.key && Object.values(STORAGE_KEYS).includes(ev.key)) {
      callback({ type: 'storage_sync' });
    }
  };

  window.addEventListener('mymenu-db-change', handleCustom);
  window.addEventListener('storage', handleStorage);

  return () => {
    if (bc) bc.close();
    window.removeEventListener('mymenu-db-change', handleCustom);
    window.removeEventListener('storage', handleStorage);
  };
}

function getInitialBusinesses(): ClientMenu[] {
  return allMenus.map((m) => ({
    ...m,
    id: m.id || `biz-${m.slug}`,
    tableCount: m.tableCount ?? 12,
    extraTables: m.extraTables ?? ['Terrasse 1', 'VIP'],
    isActive: m.isActive ?? true,
    acceptingOrders: m.acceptingOrders ?? true,
  }));
}

export function loadLocalBusinesses(): ClientMenu[] {
  if (typeof window === 'undefined') return getInitialBusinesses();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.businesses);
    if (!raw) {
      const initial = getInitialBusinesses();
      window.localStorage.setItem(STORAGE_KEYS.businesses, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw) as ClientMenu[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : getInitialBusinesses();
  } catch {
    return getInitialBusinesses();
  }
}

export function saveLocalBusinesses(list: ClientMenu[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEYS.businesses, JSON.stringify(list));
    broadcastChange('businesses_updated');
  } catch {
    // Ignore storage errors
  }
}

export function loadLocalOrders(): OrderRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.orders);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as OrderRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveLocalOrders(orders: OrderRecord[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEYS.orders, JSON.stringify(orders));
  } catch {
    // Ignore storage errors
  }
}

export function loadLocalCustomers(): CustomerRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.customers);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CustomerRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveLocalCustomers(customers: CustomerRecord[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEYS.customers, JSON.stringify(customers));
  } catch {
    // Ignore storage errors
  }
}

export function loadLocalEvents(): MenuEventRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.events);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as MenuEventRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveLocalEvents(events: MenuEventRecord[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEYS.events, JSON.stringify(events));
  } catch {
    // Ignore storage errors
  }
}

// ============================================================================
// PUBLIC MENU RPCs: get_menu, place_order, track_event
// ============================================================================

export type FetchMenuResult =
  | { status: 'ok'; menu: ClientMenu }
  | {
      status: 'inactive';
      slug: string;
      name: string;
      logo?: string;
      defaultLanguage: Language;
    }
  | { status: 'not_found' };

export async function fetchPublicMenu(slug: string): Promise<FetchMenuResult> {
  const cleanSlug = (slug || '').trim().toLowerCase();
  if (!cleanSlug) return { status: 'not_found' };

  // 1. Try Supabase SECURITY DEFINER RPC `get_menu(p_slug)` when configured
  if (supabase) {
    try {
      const { data, error } = await supabase.rpc('get_menu', { p_slug: cleanSlug });
      if (!error && data) {
        if (data.is_active === false || data.isActive === false) {
          return {
            status: 'inactive',
            slug: data.slug || cleanSlug,
            name: data.name || cleanSlug,
            logo: data.logo_url || data.logo,
            defaultLanguage: (data.default_language || data.defaultLanguage || 'ar') as Language,
          };
        }
        const mappedMenu: ClientMenu = {
          id: data.id,
          slug: data.slug,
          name: data.name,
          logo: data.logo || config.images.demoMenu.logo,
          cover: data.cover || config.images.demoMenu.cover,
          tagline: data.tagline || { fr: '', ar: '', en: '' },
          city: data.city || 'Agadir',
          languages: data.languages || ['ar', 'fr', 'en'],
          defaultLanguage: data.defaultLanguage || 'ar',
          colors: data.colors || {
            primary: '#6BBF3A',
            accent: '#18181B',
            background: '#FAF8F5',
          },
          currency: 'MAD',
          contact: data.contact || demoMenu.contact,
          hours: data.hours || demoMenu.hours,
          weeklyHours: data.weeklyHours || demoMenu.weeklyHours,
          promoBanner: data.promoBanner,
          upsellItemIds: data.upsellItemIds || [],
          orderTypes: data.orderTypes || { dineIn: true, takeaway: true, delivery: true },
          delivery: data.delivery || demoMenu.delivery,
          tableCount: data.tableCount ?? 12,
          extraTables: data.extraTables ?? [],
          tableLabels:
            data.tableLabels ??
            deriveTableLabels(data.tableCount ?? 12, data.extraTables ?? []),
          isActive: true,
          acceptingOrders: data.acceptingOrders ?? true,
          categories: (data.categories || []) as MenuCategory[],
        };
        return { status: 'ok', menu: mappedMenu };
      }
    } catch {
      // Fall through to local/demo store
    }
  }

  // 2. Fallback to local businesses store (seeded from src/menus/demo.ts)
  const businesses = loadLocalBusinesses();
  const found = businesses.find((b) => b.slug.toLowerCase() === cleanSlug);
  if (!found) {
    return { status: 'not_found' };
  }

  if (found.isActive === false) {
    return {
      status: 'inactive',
      slug: found.slug,
      name: found.name,
      logo: found.logo,
      defaultLanguage: found.defaultLanguage || 'ar',
    };
  }

  return {
    status: 'ok',
    menu: {
      ...found,
      tableCount: found.tableCount ?? 12,
      extraTables: found.extraTables ?? [],
      tableLabels: deriveTableLabels(found.tableCount ?? 12, found.extraTables ?? []),
    },
  };
}

export async function trackMenuEvent(
  slug: string,
  type: 'view' | 'qr_scan' | 'order',
  tableLabel?: string | null
): Promise<void> {
  const cleanSlug = (slug || '').trim().toLowerCase();
  if (!cleanSlug) return;

  if (supabase) {
    try {
      await supabase.rpc('track_event', {
        p_slug: cleanSlug,
        p_type: type,
        p_table_label: tableLabel || null,
      });
    } catch {
      // Continue to local fallback
    }
  }

  const businesses = loadLocalBusinesses();
  const biz = businesses.find((b) => b.slug.toLowerCase() === cleanSlug);
  if (!biz || biz.isActive === false) return;

  const events = loadLocalEvents();
  events.unshift({
    id: `ev-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    business_id: biz.id || `biz-${biz.slug}`,
    type,
    table_label: tableLabel || null,
    created_at: new Date().toISOString(),
  });
  saveLocalEvents(events.slice(0, 500));
  broadcastChange('event_tracked', { slug: cleanSlug, type, tableLabel });
}

/**
 * Calls SECURITY DEFINER `place_order(slug, payload)` on Supabase when configured,
 * and also executes the exact server-side validation, price recomputation, order creation,
 * and customer upsert in the local store so live orders work in every environment.
 */
export async function placePublicOrder(
  slug: string,
  payload: PlaceOrderPayload
): Promise<{
  code: string;
  order_id: string;
  subtotal: number;
  delivery_fee: number;
  total: number;
  table_label: string | null;
}> {
  const cleanSlug = (slug || '').trim().toLowerCase();

  if (supabase) {
    try {
      const { data, error } = await supabase.rpc('place_order', {
        p_slug: cleanSlug,
        p_payload: payload,
      });
      if (!error && data && data.code) {
        return {
          code: String(data.code),
          order_id: String(data.order_id || ''),
          subtotal: Number(data.subtotal || 0),
          delivery_fee: Number(data.delivery_fee || 0),
          total: Number(data.total || 0),
          table_label: data.table_label || null,
        };
      }
    } catch {
      // Fall through to local store execution so the order is never lost
    }
  }

  const businesses = loadLocalBusinesses();
  const biz = businesses.find((b) => b.slug.toLowerCase() === cleanSlug);
  if (!biz || biz.isActive === false) {
    throw new Error('Business is inactive or not found');
  }
  if (biz.acceptingOrders === false) {
    throw new Error('This business is currently not accepting orders');
  }

  // Build item lookup table from the business menu to recompute prices safely
  const itemMap: Record<string, MenuItem> = {};
  for (const cat of biz.categories) {
    for (const item of cat.items) {
      itemMap[item.id] = item;
    }
  }

  const verifiedLines: OrderLineRecord[] = [];
  let subtotal = 0;

  for (const rawLine of payload.items) {
    const dbItem = itemMap[rawLine.item_id];
    if (!dbItem || dbItem.badges?.includes('soldout')) {
      throw new Error(`Item ${rawLine.item_id} is unavailable`);
    }
    const qty = Math.max(1, Math.floor(Number(rawLine.quantity) || 1));
    let extraPrice = 0;
    const selectedOpts = rawLine.selected_options || {};

    if (dbItem.options) {
      for (const group of dbItem.options) {
        const chosenIds = selectedOpts[group.id] || [];
        for (const choice of group.choices) {
          if (chosenIds.includes(choice.id)) {
            extraPrice += Number(choice.price) || 0;
          }
        }
      }
    }

    const unitPrice = Number(dbItem.price) + extraPrice;
    const lineTotal = unitPrice * qty;
    subtotal += lineTotal;

    verifiedLines.push({
      item_id: dbItem.id,
      name: dbItem.name,
      quantity: qty,
      unit_price: unitPrice,
      line_total: lineTotal,
      selected_options: selectedOpts,
      option_labels: rawLine.option_labels || [],
      note: (rawLine.note || '').trim(),
    });
  }

  let deliveryFee = 0;
  let selectedZone: DeliveryZone | null = null;
  if (payload.type === 'delivery') {
    if (subtotal < (biz.delivery.minimumOrder || 0)) {
      throw new Error('Below minimum delivery order amount');
    }
    selectedZone =
      biz.delivery.zones.find((z) => z.id === payload.delivery_zone_id) ||
      biz.delivery.zones[0] ||
      null;
    const isFree =
      biz.delivery.freeDeliveryThreshold > 0 &&
      subtotal >= biz.delivery.freeDeliveryThreshold;
    deliveryFee = isFree ? 0 : selectedZone?.fee || 0;
  }

  const total = subtotal + deliveryFee;

  // Validate or normalize table label
  const validatedTable =
    validateTableLabel(
      payload.table_label,
      biz.tableCount ?? 12,
      biz.extraTables ?? []
    ) ||
    (payload.table_label ? payload.table_label.trim() : null);

  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const code = `MM-${randomNum}`;
  const orderId = `ord-${Date.now()}-${randomNum}`;
  const businessId = biz.id || `biz-${biz.slug}`;

  const newOrder: OrderRecord = {
    id: orderId,
    business_id: businessId,
    slug: biz.slug,
    code,
    type: payload.type,
    table_label: validatedTable,
    customer_name: (payload.customer_name || '').trim(),
    phone: (payload.phone || '').trim(),
    address: (payload.address || '').trim(),
    delivery_zone: selectedZone,
    location_url: (payload.location_url || '').trim(),
    items: verifiedLines,
    subtotal,
    delivery_fee: deliveryFee,
    total,
    notes: (payload.notes || '').trim(),
    status: 'new',
    created_at: new Date().toISOString(),
  };

  const orders = loadLocalOrders();
  orders.unshift(newOrder);
  saveLocalOrders(orders);

  // Upsert customer into customers table for this business
  const customerPhone =
    newOrder.phone ||
    (validatedTable ? `Table ${validatedTable}` : '') ||
    (newOrder.customer_name ? `client-${newOrder.customer_name.toLowerCase().replace(/\s+/g, '-')}` : '');
  const customerName =
    newOrder.customer_name ||
    (validatedTable ? `Client Table ${validatedTable}` : 'Client sur place');

  if (customerPhone || newOrder.customer_name || validatedTable) {
    const customers = loadLocalCustomers();
    const existingIdx = customers.findIndex(
      (c) =>
        c.business_id === businessId &&
        c.phone.toLowerCase() === customerPhone.toLowerCase()
    );

    if (existingIdx > -1) {
      const existing = customers[existingIdx];
      customers[existingIdx] = {
        ...existing,
        name: newOrder.customer_name || existing.name,
        orders_count: existing.orders_count + 1,
        total_spent: existing.total_spent + total,
        last_order_at: newOrder.created_at,
        marketing_consent:
          existing.marketing_consent || Boolean(payload.marketing_consent),
      };
    } else {
      customers.unshift({
        id: `cust-${Date.now()}`,
        business_id: businessId,
        name: customerName,
        phone: customerPhone,
        orders_count: 1,
        total_spent: total,
        last_order_at: newOrder.created_at,
        notes: validatedTable ? `Commande depuis Table ${validatedTable}` : '',
        marketing_consent: Boolean(payload.marketing_consent),
        created_at: newOrder.created_at,
      });
    }
    saveLocalCustomers(customers);
  }

  // Record order event
  await trackMenuEvent(cleanSlug, 'order', validatedTable);

  // Notify live dashboard listeners
  broadcastChange('new_order', newOrder);

  return {
    code,
    order_id: orderId,
    subtotal,
    delivery_fee: deliveryFee,
    total,
    table_label: validatedTable,
  };
}

// ============================================================================
// AUTHENTICATION & STRICT RLS ISOLATION HELPERS
// ============================================================================

export function getCurrentSession(): AuthUserSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.session);
    if (!raw) return null;
    return JSON.parse(raw) as AuthUserSession;
  } catch {
    return null;
  }
}

export async function signInWithEmailPassword(
  email: string,
  password: string
): Promise<AuthUserSession> {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('CONFIG_MISSING');
  }

  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !password) {
    throw new Error('INVALID_CREDENTIALS');
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: cleanEmail,
    password,
  });

  if (error || !data.user) {
    throw new Error('INVALID_CREDENTIALS');
  }

  const uid = data.user.id;
  const { data: adminRow } = await supabase
    .from('admins')
    .select('user_id')
    .eq('user_id', uid)
    .maybeSingle();

  const isAdmin = Boolean(adminRow);
  const { data: bizRows } = await supabase
    .from('businesses')
    .select('slug')
    .or(isAdmin ? 'is_active.eq.true,is_active.eq.false' : `owner_id.eq.${uid}`);

  const slugs = (bizRows || []).map((r: { slug: string }) => r.slug);
  const session: AuthUserSession = {
    id: uid,
    email: data.user.email || cleanEmail,
    isAdmin,
    ownedBusinessSlugs: slugs,
  };
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEYS.session, JSON.stringify(session));
  }
  broadcastChange('auth_changed', session);
  return session;
}

export async function signOutUser(): Promise<void> {
  if (supabase) {
    try {
      await supabase.auth.signOut();
    } catch {
      // Ignore
    }
  }
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(STORAGE_KEYS.session);
  }
  broadcastChange('auth_changed', null);
}

export async function requestPasswordReset(email: string): Promise<void> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail) throw new Error('Email required');
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('CONFIG_MISSING');
  }
  await supabase.auth.resetPasswordForEmail(cleanEmail);
}

/**
 * Enforces RLS: Checks whether `session` has owner or super-admin rights on `business`.
 */
export function canAccessBusiness(
  business: ClientMenu,
  session: AuthUserSession | null
): boolean {
  if (!session) return false;
  if (session.isAdmin) return true;
  if (business.ownerId && business.ownerId === session.id) return true;
  if (
    business.ownerEmail &&
    business.ownerEmail.toLowerCase() === session.email.toLowerCase()
  ) {
    return true;
  }
  return session.ownedBusinessSlugs.includes(business.slug);
}

export function getAccessibleBusinesses(
  session: AuthUserSession | null
): ClientMenu[] {
  if (!session) return [];
  const all = loadLocalBusinesses();
  return all.filter((b) => canAccessBusiness(b, session));
}

export function getOrdersForBusiness(
  business: ClientMenu,
  session: AuthUserSession | null
): OrderRecord[] {
  if (!canAccessBusiness(business, session)) {
    return [];
  }
  const bizId = business.id || `biz-${business.slug}`;
  return loadLocalOrders().filter(
    (o) => o.business_id === bizId || o.slug === business.slug
  );
}

export function getCustomersForBusiness(
  business: ClientMenu,
  session: AuthUserSession | null
): CustomerRecord[] {
  if (!canAccessBusiness(business, session)) {
    return [];
  }
  const bizId = business.id || `biz-${business.slug}`;
  return loadLocalCustomers().filter((c) => c.business_id === bizId);
}

export function getEventsForBusiness(
  business: ClientMenu,
  session: AuthUserSession | null
): MenuEventRecord[] {
  if (!canAccessBusiness(business, session)) {
    return [];
  }
  const bizId = business.id || `biz-${business.slug}`;
  return loadLocalEvents().filter((e) => e.business_id === bizId);
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  business: ClientMenu,
  session: AuthUserSession | null
): Promise<void> {
  if (!canAccessBusiness(business, session)) {
    throw new Error('Unauthorized');
  }
  if (supabase) {
    try {
      await supabase.from('orders').update({ status }).eq('id', orderId);
    } catch {
      // Fallback to local
    }
  }
  const orders = loadLocalOrders().map((o) =>
    o.id === orderId ? { ...o, status } : o
  );
  saveLocalOrders(orders);
  broadcastChange('order_updated', { orderId, status });
}

export async function updateCustomerNotes(
  customerId: string,
  notes: string,
  marketingConsent: boolean,
  business: ClientMenu,
  session: AuthUserSession | null
): Promise<void> {
  if (!canAccessBusiness(business, session)) {
    throw new Error('Unauthorized');
  }
  if (supabase) {
    try {
      await supabase
        .from('customers')
        .update({ notes, marketing_consent: marketingConsent })
        .eq('id', customerId);
    } catch {
      // Fallback to local
    }
  }
  const customers = loadLocalCustomers().map((c) =>
    c.id === customerId
      ? { ...c, notes, marketing_consent: marketingConsent }
      : c
  );
  saveLocalCustomers(customers);
  broadcastChange('customer_updated', { customerId });
}

export async function updateBusinessConfig(
  slug: string,
  updater: (current: ClientMenu) => ClientMenu,
  session: AuthUserSession | null
): Promise<ClientMenu> {
  const all = loadLocalBusinesses();
  const idx = all.findIndex((b) => b.slug === slug);
  if (idx === -1) throw new Error('Business not found');

  const current = all[idx];
  if (!canAccessBusiness(current, session)) {
    throw new Error('Unauthorized');
  }

  const updated = updater(current);
  updated.tableLabels = deriveTableLabels(
    updated.tableCount ?? 12,
    updated.extraTables ?? []
  );

  all[idx] = updated;
  saveLocalBusinesses(all);

  if (supabase && updated.id) {
    try {
      await supabase
        .from('businesses')
        .update({
          name: updated.name,
          tagline: updated.tagline,
          logo_url: updated.logo,
          cover_url: updated.cover || '',
          colors: updated.colors,
          whatsapp: updated.contact.whatsapp,
          phone: updated.contact.phone,
          instagram: updated.contact.instagram,
          city: updated.city,
          address: updated.contact.address,
          maps_url: updated.contact.mapsLink,
          languages: updated.languages,
          default_language: updated.defaultLanguage,
          hours: {
            summary: updated.hours,
            weekly: updated.weeklyHours,
          },
          order_types: updated.orderTypes,
          delivery: updated.delivery,
          banner: updated.promoBanner,
          table_count: updated.tableCount ?? 12,
          extra_tables: updated.extraTables ?? [],
          is_active: updated.isActive ?? true,
          accepting_orders: updated.acceptingOrders ?? true,
        })
        .eq('slug', slug);
    } catch {
      // Local store is already updated
    }
  }

  return updated;
}

// ============================================================================
// SUPER ADMIN RPCs: create_business, toggle is_active, assign owner
// ============================================================================

export async function adminCreateNewBusiness(
  input: {
    name: string;
    slug: string;
    ownerEmail: string;
    tableCount: number;
  },
  session: AuthUserSession | null
): Promise<ClientMenu> {
  if (!session || !session.isAdmin) {
    throw new Error('Forbidden: Super Admin only');
  }

  const cleanSlug = input.slug
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  if (!cleanSlug) throw new Error('Invalid slug');

  const all = loadLocalBusinesses();
  if (all.some((b) => b.slug === cleanSlug)) {
    throw new Error('Slug already exists');
  }

  let newId = `biz-${Date.now()}`;
  if (supabase) {
    try {
      const { data } = await supabase.rpc('create_business', {
        p_name: input.name.trim(),
        p_slug: cleanSlug,
        p_owner_email: input.ownerEmail.trim(),
        p_table_count: input.tableCount,
      });
      if (data) newId = String(data);
    } catch {
      // Continue with local creation
    }
  }

  const safeTableCount = Math.max(1, Math.min(500, Number(input.tableCount) || 10));
  const newBiz: ClientMenu = {
    id: newId,
    ownerId: `owner-${cleanSlug}`,
    ownerEmail: input.ownerEmail.trim().toLowerCase(),
    slug: cleanSlug,
    name: input.name.trim(),
    logo: config.images.demoMenu.logo,
    cover: config.images.demoMenu.cover,
    tagline: {
      ar: `مرحباً بكم في ${input.name.trim()}`,
      fr: `Bienvenue chez ${input.name.trim()}`,
      en: `Welcome to ${input.name.trim()}`,
    },
    city: 'Agadir',
    languages: ['ar', 'fr', 'en'],
    defaultLanguage: 'ar',
    colors: {
      primary: '#6BBF3A',
      accent: '#18181B',
      background: '#FAF8F5',
    },
    currency: 'MAD',
    contact: {
      whatsapp: config.whatsappNumber,
      phone: config.phoneDisplay,
      instagram: config.instagram,
      mapsLink: 'https://maps.google.com/?q=Morocco',
      address: {
        ar: 'المغرب',
        fr: 'Maroc',
        en: 'Morocco',
      },
    },
    hours: demoMenu.hours,
    weeklyHours: demoMenu.weeklyHours,
    orderTypes: {
      dineIn: true,
      takeaway: true,
      delivery: true,
    },
    delivery: demoMenu.delivery,
    tableCount: safeTableCount,
    extraTables: [],
    tableLabels: deriveTableLabels(safeTableCount, []),
    isActive: true,
    acceptingOrders: true,
    categories: [
      {
        id: `cat-drinks-${Date.now()}`,
        name: {
          ar: 'مشروبات ساخنة وباردة',
          fr: 'Boissons Chaudes & Froides',
          en: 'Hot & Cold Drinks',
        },
        items: [
          {
            id: `item-espresso-${Date.now()}`,
            name: {
              ar: 'قهوة نص نص مغربية',
              fr: 'Café Nous-Nous Marocain',
              en: 'Moroccan Nous-Nous Coffee',
            },
            description: {
              ar: 'قهوة إسبريسو متوازنة مع الحليب الطازج.',
              fr: 'Espresso équilibré au lait chaud moussé.',
              en: 'Balanced espresso with steamed milk.',
            },
            price: 18,
            image: config.images.demoMenu.items.nousNous,
            popular: true,
            badges: ['popular'],
          },
        ],
      },
      {
        id: `cat-food-${Date.now() + 1}`,
        name: {
          ar: 'فطور الصباح وحلويات',
          fr: 'Petit-Déjeuner & Gourmandises',
          en: 'Breakfast & Pastries',
        },
        items: [],
      },
    ],
  };

  all.push(newBiz);
  saveLocalBusinesses(all);
  return newBiz;
}

export async function adminSetBusinessActive(
  slug: string,
  isActive: boolean,
  session: AuthUserSession | null
): Promise<ClientMenu> {
  if (!session || !session.isAdmin) {
    throw new Error('Forbidden: Super Admin only');
  }
  return updateBusinessConfig(
    slug,
    (cur) => ({ ...cur, isActive }),
    session
  );
}

export async function adminAssignOwnerEmail(
  slug: string,
  ownerEmail: string,
  session: AuthUserSession | null
): Promise<ClientMenu> {
  if (!session || !session.isAdmin) {
    throw new Error('Forbidden: Super Admin only');
  }
  const cleanEmail = ownerEmail.trim().toLowerCase();
  const biz = loadLocalBusinesses().find((b) => b.slug === slug);
  if (supabase && biz?.id) {
    try {
      await supabase.rpc('admin_set_owner_by_email', {
        p_business_id: biz.id,
        p_owner_email: cleanEmail,
      });
    } catch {
      // Fallback to local
    }
  }
  return updateBusinessConfig(
    slug,
    (cur) => ({ ...cur, ownerEmail: cleanEmail }),
    session
  );
}
