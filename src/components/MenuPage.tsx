import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Flame, QrCode, Sparkles, ArrowUpRight } from 'lucide-react';
import {
  getMenuBySlug,
  getLocalized,
  checkBusinessOpenStatus,
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

const CUSTOMER_STORAGE_KEY = 'mymenu_customer_details_v1';

export const MenuPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const menu = getMenuBySlug(slug);

  const [menuLang, setMenuLang] = useState<Language>(
    menu?.defaultLanguage || 'ar'
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

  // Order type state
  const defaultOrderType: OrderType = useMemo(() => {
    if (!menu) return 'dineIn';
    if (menu.orderTypes.dineIn) return 'dineIn';
    if (menu.orderTypes.takeaway) return 'takeaway';
    return 'delivery';
  }, [menu]);

  const [orderType, setOrderType] = useState<OrderType>(defaultOrderType);

  // Customer details with localStorage persistence (try/catch)
  const [customer, setCustomer] = useState<CustomerDetails>(() => ({
    name: '',
    phone: '',
    address: '',
    locationLink: '',
    deliveryZoneId: menu?.delivery.zones[0]?.id || '',
    tableNumber: '',
  }));
  const [hasSavedDetails, setHasSavedDetails] = useState(false);

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
        }));
        if (parsed.name || parsed.phone || parsed.address) {
          setHasSavedDetails(true);
        }
      }
    } catch {
      // Ignore storage errors
    }
  }, [menu]);

  const handleCustomerChange = (patch: Partial<CustomerDetails>) => {
    setCustomer((prev) => {
      const next = { ...prev, ...patch };
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
      tableNumber: '',
    });
    setHasSavedDetails(false);
  };

  useEffect(() => {
    if (menu) {
      setMenuLang(menu.defaultLanguage);
    }
  }, [menu]);

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
  }, [menu, popularItems.length]);

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

  if (!menu) {
    return <NotFoundPage />;
  }

  const t = translations[menuLang].menuPage;
  const dir = menuLang === 'ar' ? 'rtl' : 'ltr';

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

  // Add item with specific options & note (from ItemDetailModal or default card stepper)
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

  // Direct card "+" button
  const handleCardIncrement = (item: MenuItem) => {
    const defaultOpts = getDefaultSelectedOptions(item);
    handleAddWithOptions(item, 1, defaultOpts, '');
  };

  // Direct card "-" button (decrements the most recent cart line for this item)
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

  const selectedZone =
    menu.delivery.zones.find((z) => z.id === customer.deliveryZoneId) ||
    menu.delivery.zones[0];
  const isFreeDelivery =
    menu.delivery.freeDeliveryThreshold > 0 &&
    subtotal >= menu.delivery.freeDeliveryThreshold;
  const deliveryFee =
    orderType === 'delivery'
      ? isFreeDelivery
        ? 0
        : selectedZone?.fee || 0
      : 0;
  const grandTotal = subtotal + deliveryFee;

  const menuUrl = `${getBaseUrl()}/m/${menu.slug}`;

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
              orderType={orderType}
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
            <div className="flex items-center gap-2.5 text-xs sm:text-sm font-extrabold">
              <span
                className="px-2.5 py-1 rounded-lg text-white font-extrabold tabular-nums"
                style={{ backgroundColor: menu.colors.primary }}
              >
                {formatItemCountLabel(totalCount)}
              </span>
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
              orderType={orderType}
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
        tableNumber={customer.tableNumber}
        onTableNumberChange={(val) => handleCustomerChange({ tableNumber: val })}
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
