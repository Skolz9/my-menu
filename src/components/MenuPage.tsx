import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Search,
  X,
  Clock,
  MapPin,
  Phone,
  MessageCircle,
  Instagram,
  ShoppingBag,
  Trash2,
  QrCode,
  ExternalLink,
} from 'lucide-react';
import { getMenuBySlug, getLocalized, type Language, type MenuItem } from '../menus';
import { translations } from '../i18n/translations';
import { getWhatsAppUrl } from '../config';
import { CategoryTabs } from './CategoryTabs';
import { MenuItemCard } from './MenuItemCard';
import { LanguageSwitcher } from './LanguageSwitcher';
import { SeoHead } from './SeoHead';
import { NotFoundPage } from './NotFoundPage';

export const MenuPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const menu = getMenuBySlug(slug);

  const [menuLang, setMenuLang] = useState<Language>(menu?.defaultLanguage || 'ar');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategoryId, setActiveCategoryId] = useState<string>(
    menu?.categories[0]?.id || ''
  );
  const [cart, setCart] = useState<Record<string, number>>({});
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    if (menu) {
      setMenuLang(menu.defaultLanguage);
      if (menu.categories[0]) {
        setActiveCategoryId(menu.categories[0].id);
      }
    }
  }, [menu]);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = menuLang;
      document.documentElement.dir = menuLang === 'ar' ? 'rtl' : 'ltr';
    }
  }, [menuLang]);

  // Highlight active category while scrolling
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
        rootMargin: '-110px 0px -65% 0px',
        threshold: 0.05,
      }
    );

    menu.categories.forEach((cat) => {
      const el = document.getElementById(`cat-${cat.id}`);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [menu, searchQuery]);

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

  const allItemsMap = useMemo(() => {
    const map: Record<string, MenuItem> = {};
    if (!menu) return map;
    for (const cat of menu.categories) {
      for (const item of cat.items) {
        map[item.id] = item;
      }
    }
    return map;
  }, [menu]);

  const cartEntries = useMemo(() => {
    return Object.entries(cart)
      .filter(([, qty]) => qty > 0)
      .map(([id, qty]) => ({
        item: allItemsMap[id],
        qty,
      }))
      .filter((entry) => Boolean(entry.item));
  }, [cart, allItemsMap]);

  const totalCount = cartEntries.reduce((acc, curr) => acc + curr.qty, 0);
  const totalPrice = cartEntries.reduce(
    (acc, curr) => acc + curr.item.price * curr.qty,
    0
  );

  if (!menu) {
    return <NotFoundPage />;
  }

  const t = translations[menuLang].menuPage;
  const dir = menuLang === 'ar' ? 'rtl' : 'ltr';

  const handleSelectCategory = (catId: string) => {
    setActiveCategoryId(catId);
    if (typeof document !== 'undefined') {
      const target = document.getElementById(`cat-${catId}`);
      if (target) {
        const y = target.getBoundingClientRect().top + window.scrollY - 72;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }
  };

  const addItem = (itemId: string) => {
    setCart((prev) => ({ ...prev, [itemId]: (prev[itemId] || 0) + 1 }));
  };

  const removeItem = (itemId: string) => {
    setCart((prev) => {
      const next = { ...prev };
      if ((next[itemId] || 0) <= 1) {
        delete next[itemId];
      } else {
        next[itemId] -= 1;
      }
      return next;
    });
  };

  const buildOrderWhatsAppUrl = () => {
    const lines = [
      `${t.orderWhatsappHeader} *${menu.name}* :`,
      '',
      ...cartEntries.map(
        ({ item, qty }) =>
          `• ${qty}x ${getLocalized(item.name, menuLang)} — ${item.price * qty} ${menu.currency}`
      ),
      '',
      `*${t.orderWhatsappTotal} : ${totalPrice} ${menu.currency}*`,
    ];
    return getWhatsAppUrl(lines.join('\n'), menu.contact.whatsapp);
  };

  const directContactWhatsAppUrl = getWhatsAppUrl(
    `Salam ${menu.name}`,
    menu.contact.whatsapp
  );

  return (
    <div
      dir={dir}
      className="min-h-screen flex flex-col justify-between pb-24"
      style={{ backgroundColor: menu.colors.background || '#F9FAF8' }}
    >
      <SeoHead pathname={`/m/${menu.slug}`} lang={menuLang} />

      <div>
        {/* Restaurant Header */}
        <header className="bg-white border-b border-neutral-200/80 pt-5 pb-5">
          <div className="max-w-3xl mx-auto px-4 space-y-4">
            {/* Top Bar: Discreet Back Link + Language Switcher */}
            <div className="flex items-center justify-between gap-2">
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-500 hover:text-neutral-900 transition-colors"
              >
                <span
                  className="w-5 h-5 rounded-md inline-flex items-center justify-center text-white"
                  style={{ backgroundColor: menu.colors.primary }}
                >
                  <QrCode className="w-3 h-3" />
                </span>
                <span>{t.backToHome}</span>
              </Link>

              <LanguageSwitcher
                availableLanguages={menu.languages}
                activeLanguage={menuLang}
                onSelectLanguage={setMenuLang}
                accentColor={menu.colors.primary}
              />
            </div>

            {/* Restaurant Identity: Logo, H1 Name, City, Tagline */}
            <div className="flex items-center gap-4 pt-1">
              <img
                src={menu.logo}
                alt={menu.name}
                referrerPolicy="no-referrer"
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-neutral-200 shadow-xs shrink-0 bg-neutral-100"
              />
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-extrabold text-neutral-950 tracking-tight">
                    {menu.name}
                  </h1>
                  <span className="text-xs font-bold text-neutral-500">
                    · {menu.city}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                  {getLocalized(menu.tagline, menuLang)}
                </p>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search
                className={`w-4 h-4 text-neutral-400 absolute top-1/2 -translate-y-1/2 ${
                  dir === 'rtl' ? 'right-3.5' : 'left-3.5'
                }`}
              />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                className={`w-full rounded-xl bg-neutral-100 border border-neutral-200/80 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:bg-white focus:border-neutral-400 transition-colors ${
                  dir === 'rtl' ? 'pr-10 pl-9' : 'pl-10 pr-9'
                }`}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label={t.clearSearch}
                  className={`absolute top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 cursor-pointer ${
                    dir === 'rtl' ? 'left-3' : 'right-3'
                  }`}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Sticky Horizontal Category Tabs */}
        <CategoryTabs
          categories={menu.categories}
          activeCategoryId={activeCategoryId}
          onSelectCategory={handleSelectCategory}
          lang={menuLang}
          primaryColor={menu.colors.primary}
        />

        {/* Menu Categories & Items */}
        <main className="max-w-3xl mx-auto px-4 py-6 space-y-8">
          {filteredCategories.length === 0 ? (
            <div className="bg-white rounded-2xl border border-neutral-200 p-8 text-center space-y-3">
              <p className="text-sm font-semibold text-neutral-600">{t.noResults}</p>
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
                className="scroll-mt-20 space-y-3.5"
              >
                <div className="flex items-center justify-between border-b border-neutral-200/80 pb-2">
                  <h2 className="text-lg sm:text-xl font-extrabold text-neutral-950">
                    {getLocalized(category.name, menuLang)}
                  </h2>
                  <span className="text-xs font-semibold text-neutral-400 tabular-nums">
                    {category.items.length}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {category.items.map((item) => (
                    <MenuItemCard
                      key={item.id}
                      item={item}
                      lang={menuLang}
                      currency={menu.currency}
                      primaryColor={menu.colors.primary}
                      quantity={cart[item.id] || 0}
                      onAdd={() => addItem(item.id)}
                      onRemove={() => removeItem(item.id)}
                    />
                  ))}
                </div>
              </section>
            ))
          )}

          {/* Restaurant Contact, Hours, Map & Social Info */}
          <section className="bg-white rounded-3xl border border-neutral-200/90 p-5 sm:p-6 space-y-5 mt-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-white"
                  style={{ backgroundColor: menu.colors.primary }}
                >
                  <Clock className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-neutral-500">
                    {t.hoursTitle}
                  </h3>
                  <p className="text-sm font-bold text-neutral-900 mt-0.5">
                    {getLocalized(menu.hours, menuLang)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-white"
                  style={{ backgroundColor: menu.colors.primary }}
                >
                  <MapPin className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-neutral-500">
                    {t.addressTitle}
                  </h3>
                  <p className="text-sm font-bold text-neutral-900 mt-0.5">
                    {getLocalized(menu.contact.address, menuLang)}
                  </p>
                  {menu.contact.mapsLink && (
                    <a
                      href={menu.contact.mapsLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-bold mt-1 hover:underline"
                      style={{ color: menu.colors.primary }}
                    >
                      <span>{t.openInMaps}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons: Call, WhatsApp, Instagram */}
            <div className="pt-3 border-t border-neutral-100 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <a
                href={`tel:${menu.contact.phone.replace(/\s+/g, '')}`}
                className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs sm:text-sm font-bold text-neutral-900 bg-neutral-100 hover:bg-neutral-200 transition-colors"
              >
                <Phone className="w-4 h-4 shrink-0" />
                <span>{t.callNow}</span>
              </a>

              <a
                href={directContactWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs sm:text-sm font-bold text-white transition-opacity hover:opacity-95"
                style={{ backgroundColor: '#25D366' }}
              >
                <MessageCircle className="w-4 h-4 shrink-0" />
                <span>{t.whatsappContact}</span>
              </a>

              {menu.contact.instagram && (
                <a
                  href={menu.contact.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs sm:text-sm font-bold text-neutral-900 bg-neutral-100 hover:bg-neutral-200 transition-colors"
                >
                  <Instagram className="w-4 h-4 shrink-0" />
                  <span>{t.instagramFollow}</span>
                </a>
              )}
            </div>
          </section>
        </main>
      </div>

      {/* Discreet Footer: "Menu by My Menu" */}
      <footer className="py-6 text-center border-t border-neutral-200/70 bg-white/60">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-500 hover:text-neutral-900 transition-colors"
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

      {/* Sticky Bottom Cart Bar when items are selected */}
      {totalCount > 0 && (
        <div className="fixed bottom-4 inset-x-4 z-30 max-w-xl mx-auto">
          <div
            className="rounded-2xl p-3 sm:p-3.5 text-white shadow-xl flex items-center justify-between gap-3"
            style={{ backgroundColor: menu.colors.accent || '#0F1410' }}
          >
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              className="flex items-center gap-3 text-start cursor-pointer"
            >
              <span
                className="w-9 h-9 rounded-xl inline-flex items-center justify-center font-extrabold text-sm text-white tabular-nums shrink-0"
                style={{ backgroundColor: menu.colors.primary }}
              >
                {totalCount}
              </span>
              <div>
                <p className="text-xs font-bold text-white/80">{t.cartTitle}</p>
                <p className="text-sm font-extrabold tabular-nums">
                  {totalPrice} {menu.currency}
                </p>
              </div>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCartOpen(true)}
                className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white shadow-xs cursor-pointer whitespace-nowrap inline-flex items-center gap-1.5"
                style={{ backgroundColor: menu.colors.primary }}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{t.cartButton}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* In-Memory Cart Drawer / Modal for WhatsApp Order */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 space-y-4 max-h-[85vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div>
                <h2 className="text-lg font-extrabold text-neutral-950">
                  {t.cartTitle}
                </h2>
                <p className="text-xs text-neutral-500">{t.cartSubtitle}</p>
              </div>
              <button
                type="button"
                onClick={() => setCartOpen(false)}
                className="p-2 rounded-xl bg-neutral-100 text-neutral-600 hover:text-neutral-950 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 py-1">
              {cartEntries.map(({ item, qty }) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-neutral-50 border border-neutral-200/70"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-neutral-950 truncate">
                      {getLocalized(item.name, menuLang)}
                    </p>
                    <p className="text-xs text-neutral-500 tabular-nums">
                      {item.price} {menu.currency} × {qty} ={' '}
                      <strong className="text-neutral-900">
                        {item.price * qty} {menu.currency}
                      </strong>
                    </p>
                  </div>

                  <div className="inline-flex items-center gap-2 bg-white rounded-xl p-1 border border-neutral-200">
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="w-6 h-6 rounded-lg bg-neutral-100 text-neutral-800 flex items-center justify-center font-bold cursor-pointer"
                    >
                      -
                    </button>
                    <span className="text-xs font-extrabold tabular-nums px-1">
                      {qty}
                    </span>
                    <button
                      type="button"
                      onClick={() => addItem(item.id)}
                      className="w-6 h-6 rounded-lg text-white flex items-center justify-center font-bold cursor-pointer"
                      style={{ backgroundColor: menu.colors.primary }}
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-neutral-200 pt-4 space-y-3">
              <div className="flex items-center justify-between text-base font-extrabold text-neutral-950">
                <span>{t.totalLabel}</span>
                <span className="tabular-nums">
                  {totalPrice} {menu.currency}
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setCart({});
                    setCartOpen(false);
                  }}
                  className="px-3.5 py-3 rounded-xl border border-neutral-200 text-neutral-600 hover:text-rose-600 hover:border-rose-200 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{t.clearCart}</span>
                </button>

                <a
                  href={buildOrderWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-sm font-bold text-white shadow-md hover:opacity-95 transition-opacity"
                  style={{ backgroundColor: '#25D366' }}
                >
                  <MessageCircle className="w-4.5 h-4.5 shrink-0" />
                  <span>{t.sendOrderWhatsapp}</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
