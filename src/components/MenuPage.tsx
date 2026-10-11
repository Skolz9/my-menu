import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import {
  Flame,
  QrCode,
  Sparkles,
  ArrowUpRight,
  Lock,
  Clock,
  UtensilsCrossed,
} from 'lucide-react';
import {
  getMenuBySlug,
  getLocalized,
  checkBusinessOpenStatus,
  validateTableLabel,
  type ClientMenu,
  type Language,
  type MenuItem,
  type OrderType,
} from '../menus';
import { getBaseUrl } from '../config';
import { translations } from '../i18n/translations';
import { CategoryTabs } from './CategoryTabs';
import { MenuItemCard } from './MenuItemCard';
import { BusinessProfileCard } from './BusinessProfileCard';
import { CartPanel, type CustomerDetails } from './CartPanel';
import {
  ItemDetailModal,
  ShowToWaiterModal,
  MenuQrModal,
  getDefaultSelectedOptions,
  buildCartKey,
  computeItemUnitPrice,
  type CartLineItem,
} from './MenuModals';
import { PriceDisplay } from './PriceDisplay';
import { SeoHead } from './SeoHead';
import { NotFoundPage } from './NotFoundPage';
import { LanguageSwitcher } from './LanguageSwitcher';
import {
  fetchPublicMenu,
  loadLocalBusinesses,
  subscribeToRealtimeChanges,
  trackMenuEvent,
} from '../lib/store';

const CUSTOMER_STORAGE_KEY = 'mymenu_customer_details_v1';

const UNAVAILABLE_TEXT: Record<
  Language,
  {
    badge: string;
    title: string;
    subtitle: string;
    footer: string;
  }
> = {
  ar: {
    badge: 'القائمة غير متاحة مؤقتاً',
    title: 'هذه القائمة غير متاحة حالياً',
    subtitle:
      'يرجى مراجعة موظفي المقهى أو المحاولة لاحقاً. شكراً لتفهمكم.',
    footer: 'Menu by My Menu',
  },
  fr: {
    badge: 'Menu temporairement indisponible',
    title: 'Menu temporairement indisponible',
    subtitle:
      'Ce menu digital est momentanément désactivé. Veuillez vous adresser au personnel de l’établissement.',
    footer: 'Menu by My Menu',
  },
  en: {
    badge: 'Menu temporarily unavailable',
    title: 'Menu temporarily unavailable',
    subtitle:
      'This digital menu is currently unavailable. Please ask a member of staff for assistance.',
    footer: 'Menu by My Menu',
  },
};

export const MenuPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const rawTableParam = searchParams.get('t');

  // Resolve initial state synchronously for SSR prerendering + instant mount
  const initialLocalBiz = useMemo(() => {
    const clean = (slug || '').trim().toLowerCase();
    const fromStore = loadLocalBusinesses().find(
      (b) => b.slug.toLowerCase() === clean
    );
    return fromStore || getMenuBySlug(clean);
  }, [slug]);

  const [menu, setMenu] = useState<ClientMenu | undefined>(initialLocalBiz);
  const [isInactive, setIsInactive] = useState<boolean>(
    initialLocalBiz ? initialLocalBiz.isActive === false : false
  );
  const [inactiveName, setInactiveName] = useState<string>(
    initialLocalBiz?.name || ''
  );
  const [notFound, setNotFound] = useState<boolean>(!initialLocalBiz);

  const [menuLang, setMenuLang] = useState<Language>(
    initialLocalBiz?.defaultLanguage || 'ar'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategoryId, setActiveCategoryId] = useState<string>('popular');
  const [cartLines, setCartLines] = useState<CartLineItem[]>([]);
  const [mobileCartOpen, setMobileCartOpen] = useState(false);

  // Modals state
  const [detailItem, setDetailItem] = useState<MenuItem | null>(null);
  const [waiterModalOpen, setWaiterModalOpen] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);

  // Open / Closed live status + simulation toggle
  const [simulateClosed, setSimulateClosed] = useState(false);

  // Fetch from Supabase `get_menu` RPC + subscribe to live changes
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!slug) {
        setNotFound(true);
        return;
      }
      const res = await fetchPublicMenu(slug);
      if (!mounted) return;
      if (res.status === 'not_found') {
        setNotFound(true);
        setMenu(undefined);
      } else if (res.status === 'inactive') {
        setNotFound(false);
        setIsInactive(true);
        setInactiveName(res.name);
        setMenuLang(res.defaultLanguage || 'ar');
      } else {
        setNotFound(false);
        setIsInactive(false);
        setMenu(res.menu);
      }
    };

    load();
    const unsubscribe = subscribeToRealtimeChanges(() => {
      load();
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [slug]);

  // Validate `?t={label}` against business derived table labels ("1".."table_count" + extra_tables)
  const lockedTableLabel = useMemo(() => {
    if (!menu || !rawTableParam) return null;
    return validateTableLabel(
      rawTableParam,
      menu.tableCount ?? 12,
      menu.extraTables ?? []
    );
  }, [menu, rawTableParam]);

  // Track menu view / QR scan event once per slug + table visit
  useEffect(() => {
    if (!slug || isInactive || notFound) return;
    trackMenuEvent(
      slug,
      lockedTableLabel ? 'qr_scan' : 'view',
      lockedTableLabel
    );
  }, [slug, lockedTableLabel, isInactive, notFound]);

  // Default Order type state
  const defaultOrderType: OrderType = useMemo(() => {
    if (lockedTableLabel) return 'dineIn';
    if (!menu) return 'dineIn';
    if (menu.orderTypes.dineIn) return 'dineIn';
    if (menu.orderTypes.takeaway) return 'takeaway';
    return 'delivery';
  }, [menu, lockedTableLabel]);

  const [orderType, setOrderType] = useState<OrderType>(defaultOrderType);

  // Customer details with localStorage persistence (try/catch)
  const [customer, setCustomer] = useState<CustomerDetails>(() => ({
    name: '',
    phone: '',
    address: '',
    locationLink: '',
    deliveryZoneId: menu?.delivery.zones[0]?.id || '',
    tableNumber: lockedTableLabel || '',
    marketingConsent: false,
  }));
  const [hasSavedDetails, setHasSavedDetails] = useState(false);

  // Whenever lockedTableLabel is present, lock orderType = 'dineIn' and tableNumber = lockedTableLabel
  useEffect(() => {
    if (lockedTableLabel) {
      setOrderType('dineIn');
      setCustomer((prev) => ({
        ...prev,
        tableNumber: lockedTableLabel,
      }));
    }
  }, [lockedTableLabel]);

  // Load saved customer details on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(CUSTOMER_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<CustomerDetails>;
        setCustomer((prev) => ({
          ...prev,
          name: parsed.name || '',
          phone: parsed.phone || '',
          address: parsed.address || '',
          deliveryZoneId:
            parsed.deliveryZoneId || menu?.delivery.zones[0]?.id || '',
          tableNumber: lockedTableLabel || prev.tableNumber || '',
        }));
        if (parsed.name || parsed.phone || parsed.address) {
          setHasSavedDetails(true);
        }
      }
    } catch {
      // Ignore storage errors
    }
  }, [menu, lockedTableLabel]);

  const handleCustomerChange = (patch: Partial<CustomerDetails>) => {
    setCustomer((prev) => {
      const next = {
        ...prev,
        ...patch,
        tableNumber: lockedTableLabel || (patch.tableNumber ?? prev.tableNumber),
      };
      if (typeof window !== 'undefined') {
        try {
          window.localStorage.setItem(
            CUSTOMER_STORAGE_KEY,
            JSON.stringify({
              name: next.name,
              phone: next.phone,
              address: next.address,
              deliveryZoneId: next.deliveryZoneId,
            })
          );
          if (next.name || next.phone || next.address) {
            setHasSavedDetails(true);
          }
        } catch {
          // Ignore storage errors
        }
      }
      return next;
    });
  };

  const handleForgetDetails = () => {
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.removeItem(CUSTOMER_STORAGE_KEY);
      } catch {
        // Ignore storage errors
      }
    }
    setCustomer({
      name: '',
      phone: '',
      address: '',
      locationLink: '',
      deliveryZoneId: menu?.delivery.zones[0]?.id || '',
      tableNumber: lockedTableLabel || '',
      marketingConsent: false,
    });
    setHasSavedDetails(false);
  };

  useEffect(() => {
    if (menu) {
      setMenuLang(menu.defaultLanguage);
    }
  }, [menu?.slug]);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = menuLang;
      document.documentElement.dir = menuLang === 'ar' ? 'rtl' : 'ltr';
    }
  }, [menuLang]);

  const popularItems = useMemo(() => {
    if (!menu) return [];
    const list: MenuItem[] = [];
    for (const cat of menu.categories) {
      for (const item of cat.items) {
        if (item.popular || item.badges?.includes('popular')) {
          list.push(item);
        }
      }
    }
    return list;
  }, [menu]);

  // Set initial active category tab
  useEffect(() => {
    if (!menu) return;
    if (popularItems.length > 0) {
      setActiveCategoryId('popular');
    } else if (menu.categories[0]) {
      setActiveCategoryId(menu.categories[0].id);
    }
  }, [menu?.slug, popularItems.length]);

  // Scroll-spy for category sections
  useEffect(() => {
    if (!menu || typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const catId = entry.target.getAttribute('data-category-id');
            if (catId) {
              setActiveCategoryId(catId);
              break;
            }
          }
        }
      },
      {
        rootMargin: '-120px 0px -65% 0px',
        threshold: 0.05,
      }
    );

    const popularEl = document.getElementById('cat-popular');
    if (popularEl) observer.observe(popularEl);

    menu.categories.forEach((cat) => {
      const el = document.getElementById(`cat-${cat.id}`);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [menu, searchQuery, popularItems.length]);

  const filteredCategories = useMemo(() => {
    if (!menu) return [];
    const q = searchQuery.trim().toLowerCase();
    if (!q) return menu.categories;

    return menu.categories
      .map((cat) => ({
        ...cat,
        items: cat.items.filter((item) => {
          const name = getLocalized(item.name, menuLang).toLowerCase();
          const desc = getLocalized(item.description, menuLang).toLowerCase();
          return name.includes(q) || desc.includes(q);
        }),
      }))
      .filter((cat) => cat.items.length > 0);
  }, [menu, searchQuery, menuLang]);

  // Map itemId -> total quantity in cart across all option variations
  const itemQuantityMap = useMemo(() => {
    const map: Record<string, number> = {};
    for (const line of cartLines) {
      map[line.item.id] = (map[line.item.id] || 0) + line.quantity;
    }
    return map;
  }, [cartLines]);

  // Upsell items (2 items from menu.upsellItemIds not yet in cart, or top available)
  const upsellItems = useMemo(() => {
    if (!menu || !menu.upsellItemIds) return [];
    const allItems: Record<string, MenuItem> = {};
    for (const cat of menu.categories) {
      for (const item of cat.items) {
        allItems[item.id] = item;
      }
    }
    return menu.upsellItemIds
      .map((id) => allItems[id])
      .filter(
        (item): item is MenuItem =>
          Boolean(item) &&
          !item.badges?.includes('soldout') &&
          !itemQuantityMap[item.id]
      )
      .slice(0, 2);
  }, [menu, itemQuantityMap]);

  // 1. Inactive Business Neutral Page ("Menu temporarily unavailable")
  if (isInactive) {
    const uText = UNAVAILABLE_TEXT[menuLang];
    const dir = menuLang === 'ar' ? 'rtl' : 'ltr';
    return (
      <div
        dir={dir}
        className="min-h-screen bg-[#FAF8F5] flex flex-col justify-between p-6"
      >
        <div className="max-w-md w-full mx-auto flex justify-end pt-2">
          <LanguageSwitcher
            availableLanguages={['ar', 'fr', 'en']}
            activeLanguage={menuLang}
            onSelectLanguage={setMenuLang}
          />
        </div>

        <div className="max-w-md w-full mx-auto bg-white rounded-3xl border border-neutral-200/90 p-8 text-center shadow-xs space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-neutral-100 text-neutral-500 flex items-center justify-center mx-auto">
            <UtensilsCrossed className="w-7 h-7" />
          </div>
          {inactiveName && (
            <p className="text-xs font-extrabold uppercase tracking-wider text-neutral-400">
              {inactiveName}
            </p>
          )}
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 text-neutral-700 text-xs font-bold">
            <Clock className="w-3.5 h-3.5" />
            <span>{uText.badge}</span>
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-neutral-950">
            {uText.title}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
            {uText.subtitle}
          </p>
        </div>

        <footer className="py-4 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-400 hover:text-neutral-700"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>{uText.footer}</span>
          </Link>
        </footer>
      </div>
    );
  }

  // 2. 404 Not Found
  if (notFound || !menu) {
    return <NotFoundPage />;
  }

  const t = translations[menuLang].menuPage;
  const dir = menuLang === 'ar' ? 'rtl' : 'ltr';
  const tableWord = menuLang === 'ar' ? 'طاولة' : 'Table';

  const liveStatus = checkBusinessOpenStatus(menu.weeklyHours);
  const isOpen = simulateClosed ? false : liveStatus.isOpen;

  const formatItemCountLabel = (count: number) => {
    const label = count === 1 ? t.itemCountSingle : t.itemCountPlural;
    return `${count} ${label}`;
  };

  const handleSelectCategory = (catId: string) => {
    setActiveCategoryId(catId);
    if (typeof document !== 'undefined') {
      const target = document.getElementById(`cat-${catId}`);
      if (target) {
        const y = target.getBoundingClientRect().top + window.scrollY - 118;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }
  };

  // Add item with specific options & note
  const handleAddWithOptions = (
    item: MenuItem,
    quantityToAdd: number,
    selectedOptions: Record<string, string[]>,
    note: string
  ) => {
    const cartKey = buildCartKey(item.id, selectedOptions);
    setCartLines((prev) => {
      const existingIdx = prev.findIndex((l) => l.cartKey === cartKey);
      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: updated[existingIdx].quantity + quantityToAdd,
          note: note.trim() ? note : updated[existingIdx].note,
        };
        return updated;
      }
      return [
        ...prev,
        {
          cartKey,
          item,
          quantity: quantityToAdd,
          selectedOptions,
          note,
        },
      ];
    });
  };

  const handleCardIncrement = (item: MenuItem) => {
    const defaultOpts = getDefaultSelectedOptions(item);
    handleAddWithOptions(item, 1, defaultOpts, '');
  };

  const handleCardDecrement = (item: MenuItem) => {
    setCartLines((prev) => {
      for (let i = prev.length - 1; i >= 0; i--) {
        if (prev[i].item.id === item.id) {
          const next = [...prev];
          if (next[i].quantity <= 1) {
            next.splice(i, 1);
          } else {
            next[i] = { ...next[i], quantity: next[i].quantity - 1 };
          }
          return next;
        }
      }
      return prev;
    });
  };

  const handleIncrementLine = (cartKey: string) => {
    setCartLines((prev) =>
      prev.map((l) =>
        l.cartKey === cartKey ? { ...l, quantity: l.quantity + 1 } : l
      )
    );
  };

  const handleDecrementLine = (cartKey: string) => {
    setCartLines((prev) =>
      prev
        .map((l) =>
          l.cartKey === cartKey ? { ...l, quantity: l.quantity - 1 } : l
        )
        .filter((l) => l.quantity > 0)
    );
  };

  const handleUpdateLineNote = (cartKey: string, note: string) => {
    setCartLines((prev) =>
      prev.map((l) => (l.cartKey === cartKey ? { ...l, note } : l))
    );
  };

  const totalCount = cartLines.reduce((sum, l) => sum + l.quantity, 0);
  const subtotal = cartLines.reduce(
    (sum, l) =>
      sum + computeItemUnitPrice(l.item, l.selectedOptions) * l.quantity,
    0
  );

  const effectiveOrderType: OrderType = lockedTableLabel ? 'dineIn' : orderType;

  const selectedZone =
    menu.delivery.zones.find((z) => z.id === customer.deliveryZoneId) ||
    menu.delivery.zones[0];
  const isFreeDelivery =
    menu.delivery.freeDeliveryThreshold > 0 &&
    subtotal >= menu.delivery.freeDeliveryThreshold;
  const deliveryFee =
    effectiveOrderType === 'delivery'
      ? isFreeDelivery
        ? 0
        : selectedZone?.fee || 0
      : 0;
  const grandTotal = subtotal + deliveryFee;

  const menuUrl = lockedTableLabel
    ? `${getBaseUrl()}/m/${menu.slug}?t=${encodeURIComponent(lockedTableLabel)}`
    : `${getBaseUrl()}/m/${menu.slug}`;

  return (
    <div
      dir={dir}
      className="min-h-screen flex flex-col justify-between pb-24 lg:pb-8"
      style={
        {
          backgroundColor: menu.colors.background || '#FAF8F5',
          '--menu-primary': menu.colors.primary,
          '--menu-accent': menu.colors.accent,
        } as React.CSSProperties
      }
    >
      <SeoHead pathname={`/m/${menu.slug}`} lang={menuLang} />

      {/* Main 3-Column Desktop / 1-Column Mobile Layout */}
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN (Desktop Sticky): Business Profile Card */}
          <div className="lg:col-span-3 lg:sticky lg:top-6">
            <BusinessProfileCard
              menu={menu}
              lang={menuLang}
              onSelectLanguage={setMenuLang}
              isOpen={isOpen}
              todayKey={liveStatus.todayKey}
              todayHours={liveStatus.todayHours}
              simulateClosed={simulateClosed}
              onToggleSimulateClosed={() => setSimulateClosed((prev) => !prev)}
              onOpenQrModal={() => setQrModalOpen(true)}
              lockedTableLabel={lockedTableLabel}
            />
          </div>

          {/* CENTER COLUMN: Promo Banner, Sticky Category Tabs + Search, Popular & Categories */}
          <main className="lg:col-span-5 space-y-6 min-w-0">
            {/* Editable Promo Banner */}
            {menu.promoBanner && menu.promoBanner.enabled && (
              <div className="relative rounded-3xl overflow-hidden bg-neutral-900 text-white shadow-sm border border-neutral-200/60">
                <img
                  src={menu.promoBanner.image}
                  alt={getLocalized(menu.promoBanner.title, menuLang)}
                  referrerPolicy="no-referrer"
                  className="absolute inset-0 w-full h-full object-cover opacity-55"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/55 to-black/30" />

                <div className="relative p-5 sm:p-6 space-y-3">
                  {menu.promoBanner.badge && (
                    <span
                      className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-white px-2.5 py-1 rounded-lg"
                      style={{ backgroundColor: menu.colors.primary }}
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>{getLocalized(menu.promoBanner.badge, menuLang)}</span>
                    </span>
                  )}

                  <h2 className="text-lg sm:text-xl font-extrabold text-white leading-snug">
                    {getLocalized(menu.promoBanner.title, menuLang)}
                  </h2>

                  <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed">
                    {getLocalized(menu.promoBanner.subtitle, menuLang)}
                  </p>

                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        if (menu.promoBanner?.targetCategoryId) {
                          handleSelectCategory(menu.promoBanner.targetCategoryId);
                        }
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold text-white shadow-xs hover:opacity-95 transition-opacity cursor-pointer"
                      style={{ backgroundColor: menu.colors.primary }}
                    >
                      <span>
                        {getLocalized(menu.promoBanner.buttonText, menuLang)}
                      </span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Sticky Category Tabs + Search Box */}
            <div className="rounded-3xl bg-white border border-neutral-200/90 overflow-hidden shadow-2xs">
              <CategoryTabs
                categories={menu.categories}
                hasPopularSection={popularItems.length > 0}
                activeCategoryId={activeCategoryId}
                onSelectCategory={handleSelectCategory}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                lang={menuLang}
                primaryColor={menu.colors.primary}
              />

              <div className="p-4 space-y-8">
                {/* "Most Popular" Section (shown when not filtering by search) */}
                {popularItems.length > 0 && !searchQuery.trim() && (
                  <section
                    id="cat-popular"
                    data-category-id="popular"
                    className="scroll-mt-32 space-y-3.5"
                  >
                    <div className="flex items-center justify-between border-b border-neutral-200/80 pb-2">
                      <div className="flex items-center gap-2">
                        <Flame
                          className="w-5 h-5 shrink-0"
                          style={{ color: menu.colors.primary }}
                        />
                        <h2 className="text-base sm:text-lg font-extrabold text-neutral-950">
                          {t.mostPopularTitle}
                        </h2>
                      </div>
                      <span className="text-xs font-bold text-neutral-500">
                        {formatItemCountLabel(popularItems.length)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      {popularItems.map((item) => (
                        <MenuItemCard
                          key={`pop-${item.id}`}
                          item={item}
                          lang={menuLang}
                          primaryColor={menu.colors.primary}
                          quantity={itemQuantityMap[item.id] || 0}
                          onIncrement={() => handleCardIncrement(item)}
                          onDecrement={() => handleCardDecrement(item)}
                          onOpenDetail={() => setDetailItem(item)}
                        />
                      ))}
                    </div>
                  </section>
                )}

                {/* Category Sections */}
                {filteredCategories.length === 0 ? (
                  <div className="py-10 text-center space-y-3">
                    <p className="text-sm font-bold text-neutral-600">
                      {t.noResults}
                    </p>
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-white cursor-pointer"
                      style={{ backgroundColor: menu.colors.primary }}
                    >
                      {t.clearSearch}
                    </button>
                  </div>
                ) : (
                  filteredCategories.map((category) => (
                    <section
                      key={category.id}
                      id={`cat-${category.id}`}
                      data-category-id={category.id}
                      className="scroll-mt-32 space-y-3.5"
                    >
                      <div className="flex items-center justify-between border-b border-neutral-200/80 pb-2">
                        <h2 className="text-base sm:text-lg font-extrabold text-neutral-950">
                          {getLocalized(category.name, menuLang)}
                        </h2>
                        <span className="text-xs font-bold text-neutral-500">
                          {formatItemCountLabel(category.items.length)}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 gap-3">
                        {category.items.map((item) => (
                          <MenuItemCard
                            key={item.id}
                            item={item}
                            lang={menuLang}
                            primaryColor={menu.colors.primary}
                            quantity={itemQuantityMap[item.id] || 0}
                            onIncrement={() => handleCardIncrement(item)}
                            onDecrement={() => handleCardDecrement(item)}
                            onOpenDetail={() => setDetailItem(item)}
                          />
                        ))}
                      </div>
                    </section>
                  ))
                )}
              </div>
            </div>
          </main>

          {/* RIGHT COLUMN (Desktop Sticky): Cart & Ordering Panel */}
          <div className="hidden lg:block lg:col-span-4 lg:sticky lg:top-6">
            <CartPanel
              menu={menu}
              lang={menuLang}
              isOpen={isOpen}
              cartItems={cartLines}
              upsellItems={upsellItems}
              orderType={effectiveOrderType}
              onOrderTypeChange={setOrderType}
              customer={customer}
              onCustomerChange={handleCustomerChange}
              hasSavedDetails={hasSavedDetails}
              onForgetDetails={handleForgetDetails}
              onIncrementLine={handleIncrementLine}
              onDecrementLine={handleDecrementLine}
              onUpdateLineNote={handleUpdateLineNote}
              onQuickAddUpsell={handleCardIncrement}
              onClearCart={() => setCartLines([])}
              onOpenWaiterModal={() => setWaiterModalOpen(true)}
              lockedTableLabel={lockedTableLabel}
            />
          </div>
        </div>
      </div>

      {/* Discreet Footer Credit: "Menu by My Menu" */}
      <footer className="mt-12 py-6 text-center border-t border-neutral-200/70 bg-white/60">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-400 hover:text-neutral-800 transition-colors"
        >
          <span
            className="w-4 h-4 rounded inline-flex items-center justify-center text-white"
            style={{ backgroundColor: menu.colors.primary }}
          >
            <QrCode className="w-2.5 h-2.5" />
          </span>
          <span>{t.footerCredit}</span>
        </Link>
      </footer>

      {/* Mobile Sticky Bottom Cart Bar ("2 articles · 37 MAD · Commander") */}
      {totalCount > 0 && (
        <div className="fixed bottom-0 inset-x-0 z-30 p-3 bg-gradient-to-t from-black/20 to-transparent lg:hidden">
          <button
            type="button"
            onClick={() => setMobileCartOpen(true)}
            className="w-full max-w-lg mx-auto rounded-2xl px-4 py-3.5 text-white shadow-xl flex items-center justify-between gap-3 cursor-pointer active:scale-[0.99] transition-transform"
            style={{ backgroundColor: menu.colors.accent || '#18181B' }}
          >
            <div className="flex items-center gap-2 text-xs sm:text-sm font-extrabold">
              <span
                className="px-2.5 py-1 rounded-lg text-white font-extrabold tabular-nums"
                style={{ backgroundColor: menu.colors.primary }}
              >
                {formatItemCountLabel(totalCount)}
              </span>
              {lockedTableLabel && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white/15 text-[11px] font-extrabold text-white">
                  <Lock className="w-2.5 h-2.5" />
                  <span>
                    {tableWord} {lockedTableLabel}
                  </span>
                </span>
              )}
              <span aria-hidden="true">·</span>
              <PriceDisplay
                amount={grandTotal}
                lang={menuLang}
                className="text-sm sm:text-base font-extrabold text-white"
              />
            </div>

            <span
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold text-white shadow-2xs whitespace-nowrap"
              style={{ backgroundColor: menu.colors.primary }}
            >
              {t.mobileBarOrderCta}
            </span>
          </button>
        </div>
      )}

      {/* Mobile Bottom Sheet Cart Drawer */}
      {mobileCartOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs flex items-end justify-center lg:hidden"
          onClick={() => setMobileCartOpen(false)}
        >
          <div
            className="bg-white w-full max-w-lg rounded-t-3xl max-h-[88vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drag Handle Affordance */}
            <div className="w-10 h-1.5 bg-neutral-300 rounded-full mx-auto mt-3 mb-1" />
            <CartPanel
              menu={menu}
              lang={menuLang}
              isOpen={isOpen}
              cartItems={cartLines}
              upsellItems={upsellItems}
              orderType={effectiveOrderType}
              onOrderTypeChange={setOrderType}
              customer={customer}
              onCustomerChange={handleCustomerChange}
              hasSavedDetails={hasSavedDetails}
              onForgetDetails={handleForgetDetails}
              onIncrementLine={handleIncrementLine}
              onDecrementLine={handleDecrementLine}
              onUpdateLineNote={handleUpdateLineNote}
              onQuickAddUpsell={handleCardIncrement}
              onClearCart={() => {
                setCartLines([]);
                setMobileCartOpen(false);
              }}
              onOpenWaiterModal={() => {
                setMobileCartOpen(false);
                setWaiterModalOpen(true);
              }}
              onCloseMobileDrawer={() => setMobileCartOpen(false)}
              lockedTableLabel={lockedTableLabel}
            />
          </div>
        </div>
      )}

      {/* Item Detail & Options Modal */}
      <ItemDetailModal
        item={detailItem}
        lang={menuLang}
        primaryColor={menu.colors.primary}
        onClose={() => setDetailItem(null)}
        onConfirmAdd={handleAddWithOptions}
      />

      {/* Full-Screen "Show to Waiter" Modal */}
      <ShowToWaiterModal
        open={waiterModalOpen}
        onClose={() => setWaiterModalOpen(false)}
        cartItems={cartLines}
        tableNumber={lockedTableLabel || customer.tableNumber}
        onTableNumberChange={(val) => {
          if (lockedTableLabel) return;
          handleCustomerChange({ tableNumber: val });
        }}
        totalAmount={grandTotal}
        lang={menuLang}
        menu={menu}
      />

      {/* Client Menu QR Code & Copy Link Popup */}
      <MenuQrModal
        open={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        menu={menu}
        menuUrl={menuUrl}
        lang={menuLang}
      />
    </div>
  );
};
