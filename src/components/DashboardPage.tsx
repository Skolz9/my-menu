import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  Utensils,
  Clock,
  Palette,
  QrCode,
  BarChart3,
  Settings,
  LogOut,
  Volume2,
  VolumeX,
  Printer,
  Download,
  MessageCircle,
  ExternalLink,
  Check,
  X,
  ShieldCheck,
  Sparkles,
  MoreHorizontal,
  Bell,
} from 'lucide-react';
import { config, getWhatsAppUrl } from '../config';
import { useLanguage } from '../i18n/LanguageContext';
import { getLocalized, formatPriceText, type ClientMenu } from '../menus';
import { BrandLogo } from './BrandLogo';
import { LanguageSwitcher } from './LanguageSwitcher';
import { PriceDisplay } from './PriceDisplay';
import { TableQrStudio } from './TableQrStudio';
import {
  ProductsTabPanel,
  HoursAndOrderingTabPanel,
  LookTabPanel,
  StatsTabPanel,
  SettingsTabPanel,
} from './DashboardTabs';
import { supabase } from '../lib/supabase';
import {
  getCurrentSession,
  getAccessibleBusinesses,
  getOrdersForBusiness,
  getCustomersForBusiness,
  getEventsForBusiness,
  updateOrderStatus,
  updateCustomerNotes,
  updateBusinessConfig,
  signOutUser,
  subscribeToRealtimeChanges,
  type OrderRecord,
  type OrderStatus,
  type CustomerRecord,
  type AuthUserSession,
} from '../lib/store';

export type DashboardTabId =
  | 'overview'
  | 'orders'
  | 'customers'
  | 'products'
  | 'hours'
  | 'look'
  | 'tables'
  | 'stats'
  | 'settings';

function playNewOrderChime() {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const notes = [587.33, 880]; // D5 -> A5 pleasant restaurant bell chime
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.14);
      gain.gain.setValueAtTime(0.001, now + i * 0.14);
      gain.gain.exponentialRampToValueAtTime(0.22, now + i * 0.14 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.14 + 0.45);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.14);
      osc.stop(now + i * 0.14 + 0.48);
    });
  } catch {
    // Ignore audio errors if browser blocks autoplay
  }
}

function downloadCsvFile(filename: string, rows: string[][]) {
  const csvContent =
    '\uFEFF' +
    rows
      .map((r) =>
        r
          .map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`)
          .join(',')
      )
      .join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const STATUS_BADGES: Record<
  OrderStatus,
  { labelFr: string; labelAr: string; labelEn: string; cls: string }
> = {
  new: {
    labelFr: 'Nouvelle',
    labelAr: 'جديد',
    labelEn: 'New',
    cls: 'bg-emerald-600 text-white',
  },
  confirmed: {
    labelFr: 'Confirmée',
    labelAr: 'مؤكد',
    labelEn: 'Confirmed',
    cls: 'bg-blue-600 text-white',
  },
  preparing: {
    labelFr: 'En préparation',
    labelAr: 'قيد التحضير',
    labelEn: 'Preparing',
    cls: 'bg-amber-500 text-white',
  },
  ready: {
    labelFr: 'Prête',
    labelAr: 'جاهز',
    labelEn: 'Ready',
    cls: 'bg-purple-600 text-white',
  },
  delivered: {
    labelFr: 'Servie / Livrée',
    labelAr: 'تم التسليم',
    labelEn: 'Delivered',
    cls: 'bg-neutral-800 text-white',
  },
  cancelled: {
    labelFr: 'Annulée',
    labelAr: 'ملغى',
    labelEn: 'Cancelled',
    cls: 'bg-rose-600 text-white',
  },
};

export const DashboardPage: React.FC = () => {
  const { lang, dir } = useLanguage();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [session, setSession] = useState<AuthUserSession | null>(() =>
    getCurrentSession()
  );

  // Redirect to /login if not authenticated
  useEffect(() => {
    const cur = getCurrentSession();
    if (!cur) {
      navigate('/login?redirect=/dashboard');
    } else {
      setSession(cur);
    }
  }, [navigate]);

  const [refreshTick, setRefreshTick] = useState(0);
  const accessibleBusinesses = useMemo(
    () => getAccessibleBusinesses(session),
    [session, refreshTick]
  );

  const requestedSlug = searchParams.get('business');
  const requestedTab = searchParams.get('tab') as DashboardTabId | null;

  const activeBusiness: ClientMenu | undefined = useMemo(() => {
    if (requestedSlug) {
      const found = accessibleBusinesses.find((b) => b.slug === requestedSlug);
      if (found) return found;
    }
    return accessibleBusinesses[0];
  }, [accessibleBusinesses, requestedSlug]);

  const [activeTab, setActiveTab] = useState<DashboardTabId>(
    requestedTab || 'overview'
  );
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [printingOrder, setPrintingOrder] = useState<OrderRecord | null>(null);
  const [mobileMoreOpen, setMobileMoreOpen] = useState(false);

  // Customers state
  const [customerFilter, setCustomerFilter] = useState<
    'all' | 'inactive' | 'marketing'
  >('all');
  const [selectedCustomerHistory, setSelectedCustomerHistory] =
    useState<CustomerRecord | null>(null);
  const [promoTemplate, setPromoTemplate] = useState(
    'Salam {name} ! Profitez de -15% aujourd’hui chez {business} sur présentation de ce message.'
  );

  useEffect(() => {
    if (requestedTab) {
      setActiveTab(requestedTab);
    }
  }, [requestedTab]);

  // Strictly isolated orders, customers, and events for `activeBusiness`
  const orders = useMemo(
    () =>
      activeBusiness ? getOrdersForBusiness(activeBusiness, session) : [],
    [activeBusiness, session, refreshTick]
  );

  const customers = useMemo(
    () =>
      activeBusiness ? getCustomersForBusiness(activeBusiness, session) : [],
    [activeBusiness, session, refreshTick]
  );

  const events = useMemo(
    () =>
      activeBusiness ? getEventsForBusiness(activeBusiness, session) : [],
    [activeBusiness, session, refreshTick]
  );

  const prevOrderCountRef = useRef<number>(orders.length);

  // Subscribe to Supabase Realtime + BroadcastChannel live updates
  useEffect(() => {
    const unsubLocal = subscribeToRealtimeChanges((ev) => {
      setRefreshTick((t) => t + 1);
      if (ev.type === 'new_order' && soundEnabled) {
        playNewOrderChime();
      }
    });

    let supaChannel: ReturnType<NonNullable<typeof supabase>['channel']> | null =
      null;
    if (supabase && activeBusiness?.id) {
      supaChannel = supabase
        .channel(`orders-live-${activeBusiness.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'orders',
            filter: `business_id=eq.${activeBusiness.id}`,
          },
          (payload) => {
            setRefreshTick((t) => t + 1);
            if (payload.eventType === 'INSERT' && soundEnabled) {
              playNewOrderChime();
            }
          }
        )
        .subscribe();
    }

    return () => {
      unsubLocal();
      if (supaChannel && supabase) {
        supabase.removeChannel(supaChannel);
      }
    };
  }, [activeBusiness?.id, soundEnabled]);

  useEffect(() => {
    if (orders.length > prevOrderCountRef.current && soundEnabled) {
      playNewOrderChime();
    }
    prevOrderCountRef.current = orders.length;
  }, [orders.length, soundEnabled]);

  if (!session || !activeBusiness) {
    return null;
  }

  const primaryColor = activeBusiness.colors.primary || config.colors.primary;
  const newOrdersCount = orders.filter((o) => o.status === 'new').length;

  const handleSelectTab = (tab: DashboardTabId) => {
    setActiveTab(tab);
    setMobileMoreOpen(false);
    const next = new URLSearchParams(searchParams);
    next.set('tab', tab);
    setSearchParams(next, { replace: true });
  };

  const handleSaveMenu = async (updater: (cur: ClientMenu) => ClientMenu) => {
    await updateBusinessConfig(activeBusiness.slug, updater, session);
    setRefreshTick((t) => t + 1);
  };

  const handleSignOut = async () => {
    await signOutUser();
    navigate('/login');
  };

  const handleExportOrdersCsv = () => {
    const rows: string[][] = [
      [
        'Code',
        'Date',
        'Type',
        'Table',
        'Client',
        'Téléphone',
        'Total (MAD)',
        'Statut',
        'Articles',
      ],
      ...orders.map((o) => [
        o.code,
        new Date(o.created_at).toLocaleString('fr-MA'),
        o.type,
        o.table_label || '-',
        o.customer_name || '-',
        o.phone || '-',
        String(o.total),
        o.status,
        o.items
          .map((i) => `${i.quantity}x ${getLocalized(i.name, lang)}`)
          .join(' | '),
      ]),
    ];
    downloadCsvFile(`${activeBusiness.slug}-commandes.csv`, rows);
  };

  const handleExportCustomersCsv = () => {
    const rows: string[][] = [
      [
        'Nom',
        'Téléphone',
        'Commandes',
        'Total Dépensé (MAD)',
        'Dernière Commande',
        'Consentement Marketing',
        'Notes',
      ],
      ...customers.map((c) => [
        c.name,
        c.phone,
        String(c.orders_count),
        String(c.total_spent),
        new Date(c.last_order_at).toLocaleDateString('fr-MA'),
        c.marketing_consent ? 'OUI' : 'NON',
        c.notes,
      ]),
    ];
    downloadCsvFile(`${activeBusiness.slug}-clients.csv`, rows);
  };

  const navItems: {
    id: DashboardTabId;
    label: string;
    icon: React.FC<{ className?: string }>;
    badge?: number;
  }[] = [
    {
      id: 'overview',
      label: lang === 'ar' ? 'نظرة عامة' : lang === 'fr' ? 'Vue d’ensemble' : 'Overview',
      icon: LayoutDashboard,
    },
    {
      id: 'orders',
      label: lang === 'ar' ? 'الطلبات المباشرة' : lang === 'fr' ? 'Commandes' : 'Orders',
      icon: ShoppingBag,
      badge: newOrdersCount > 0 ? newOrdersCount : undefined,
    },
    {
      id: 'customers',
      label: lang === 'ar' ? 'الزبناء' : lang === 'fr' ? 'Clients' : 'Customers',
      icon: Users,
    },
    {
      id: 'products',
      label: lang === 'ar' ? 'الأصناف والأسعار' : lang === 'fr' ? 'Produits' : 'Products',
      icon: Utensils,
    },
    {
      id: 'tables',
      label: lang === 'ar' ? 'الطاولات و QR' : lang === 'fr' ? 'Tables & QR' : 'Tables & QR',
      icon: QrCode,
    },
    {
      id: 'hours',
      label:
        lang === 'ar'
          ? 'الأوقات والتوصيل'
          : lang === 'fr'
          ? 'Horaires & Commande'
          : 'Hours & Ordering',
      icon: Clock,
    },
    {
      id: 'look',
      label: lang === 'ar' ? 'المظهر والألوان' : lang === 'fr' ? 'Apparence' : 'Look',
      icon: Palette,
    },
    {
      id: 'stats',
      label: lang === 'ar' ? 'الإحصائيات' : lang === 'fr' ? 'Statistiques' : 'Stats',
      icon: BarChart3,
    },
    {
      id: 'settings',
      label: lang === 'ar' ? 'الإعدادات' : lang === 'fr' ? 'Paramètres' : 'Settings',
      icon: Settings,
    },
  ];

  // Filtered orders
  const filteredOrders =
    orderStatusFilter === 'all'
      ? orders
      : orders.filter((o) => o.status === orderStatusFilter);

  // Filtered customers
  const thirtyDaysAgo = Date.now() - 30 * 86400 * 1000;
  const filteredCustomers = customers.filter((c) => {
    if (customerFilter === 'inactive') {
      return new Date(c.last_order_at).getTime() < thirtyDaysAgo;
    }
    if (customerFilter === 'marketing') {
      return c.marketing_consent === true;
    }
    return true;
  });

  // Consented customers ONLY for Promo Helper
  const consentedCustomers = customers.filter((c) => c.marketing_consent === true);

  // Top items calculation
  const topItemsList = useMemo(() => {
    const counts: Record<string, { name: string; qty: number; revenue: number }> =
      {};
    for (const o of orders) {
      if (o.status === 'cancelled') continue;
      for (const line of o.items) {
        const key = line.item_id;
        if (!counts[key]) {
          counts[key] = {
            name: getLocalized(line.name, lang),
            qty: 0,
            revenue: 0,
          };
        }
        counts[key].qty += line.quantity;
        counts[key].revenue += line.line_total;
      }
    }
    return Object.values(counts).sort((a, b) => b.qty - a.qty);
  }, [orders, lang]);

  const totalRevenue = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.total, 0);

  return (
    <div dir={dir} className="min-h-screen bg-[#FAF8F5] flex flex-col lg:flex-row">
      {/* ==================================================================== */}
      {/* DESKTOP SIDEBAR                                                      */}
      {/* ==================================================================== */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-white border-e border-neutral-200/90 z-30 justify-between p-4">
        <div className="space-y-5">
          <div className="flex items-center justify-between px-2 pt-1">
            <Link to="/">
              <BrandLogo size="sm" />
            </Link>
            {session.isAdmin && (
              <Link
                to="/admin"
                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-neutral-900 text-white text-[10px] font-extrabold"
              >
                <ShieldCheck className="w-3 h-3 text-[#6BBF3A]" />
                <span>Admin</span>
              </Link>
            )}
          </div>

          {/* Active Business Switcher (if multiple accessible) */}
          <div className="rounded-2xl bg-neutral-50 border border-neutral-200/80 p-3 space-y-2">
            <div className="flex items-center gap-2.5">
              <img
                src={activeBusiness.logo}
                alt={activeBusiness.name}
                referrerPolicy="no-referrer"
                className="w-10 h-10 rounded-xl object-cover shrink-0 bg-neutral-200"
              />
              <div className="min-w-0">
                <p className="text-xs font-extrabold text-neutral-950 truncate">
                  {activeBusiness.name}
                </p>
                <p className="text-[11px] text-neutral-500 truncate">
                  /m/{activeBusiness.slug}
                </p>
              </div>
            </div>

            {accessibleBusinesses.length > 1 && (
              <select
                value={activeBusiness.slug}
                onChange={(e) => {
                  const next = new URLSearchParams(searchParams);
                  next.set('business', e.target.value);
                  setSearchParams(next);
                }}
                className="w-full rounded-xl bg-white border border-neutral-200 px-2.5 py-1.5 text-xs font-bold text-neutral-800"
              >
                {accessibleBusinesses.map((b) => (
                  <option key={b.slug} value={b.slug}>
                    {b.name} (/m/{b.slug})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                    active
                      ? 'text-white shadow-2xs'
                      : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950'
                  }`}
                  style={active ? { backgroundColor: primaryColor } : undefined}
                >
                  <span className="inline-flex items-center gap-2.5">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </span>
                  {item.badge !== undefined && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                        active
                          ? 'bg-white text-neutral-950'
                          : 'bg-rose-600 text-white'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Sidebar User & Logout */}
        <div className="pt-4 border-t border-neutral-100 space-y-2">
          <div className="px-2 flex items-center justify-between text-[11px] text-neutral-500">
            <span className="truncate font-mono" dir="ltr">
              {session.email}
            </span>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            className="w-full flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* ==================================================================== */}
      {/* MAIN CONTENT AREA                                                    */}
      {/* ==================================================================== */}
      <div className="flex-1 lg:ps-64 pb-24 lg:pb-10">
        {/* Top Sticky Header */}
        <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-neutral-200/80 px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <h1 className="text-base sm:text-lg font-extrabold text-neutral-950 truncate">
              {navItems.find((n) => n.id === activeTab)?.label}
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-100 text-xs font-bold text-neutral-700">
              {activeBusiness.name}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <LanguageSwitcher />

            <Link
              to={`/m/${activeBusiness.slug}`}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-xs font-extrabold text-neutral-800"
            >
              <span>Voir Menu</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            <Link
              to={`/m/${activeBusiness.slug}?t=5`}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-extrabold text-white shadow-2xs"
              style={{ backgroundColor: primaryColor }}
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Tester Table 5</span>
            </Link>
          </div>
        </header>

        <main className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* ================================================================ */}
          {/* TAB 1: OVERVIEW                                                  */}
          {/* ================================================================ */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Accepting Orders Banner + Switch */}
              <div className="rounded-3xl bg-white border border-neutral-200/90 p-5 sm:p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-3 h-3 rounded-full ${
                        activeBusiness.acceptingOrders !== false
                          ? 'bg-emerald-500'
                          : 'bg-rose-500'
                      }`}
                    />
                    <h2 className="text-base sm:text-lg font-extrabold text-neutral-950">
                      {activeBusiness.acceptingOrders !== false
                        ? 'Réception des commandes ACTIVE'
                        : 'Commandes en PAUSE'}
                    </h2>
                  </div>
                  <p className="text-xs text-neutral-500">
                    Activez ou mettez en pause les commandes en ligne sur{' '}
                    <code className="font-mono">/m/{activeBusiness.slug}</code>.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      handleSaveMenu((cur) => ({
                        ...cur,
                        acceptingOrders: cur.acceptingOrders === false,
                      }))
                    }
                    className={`px-5 py-2.5 rounded-2xl text-xs font-extrabold text-white shadow-xs cursor-pointer ${
                      activeBusiness.acceptingOrders !== false
                        ? 'bg-emerald-600 hover:bg-emerald-700'
                        : 'bg-rose-600 hover:bg-rose-700'
                    }`}
                  >
                    {activeBusiness.acceptingOrders !== false
                      ? '✓ Accepte les commandes'
                      : '✕ Commandes désactivées'}
                  </button>
                </div>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="rounded-3xl bg-white border border-neutral-200/90 p-5 shadow-2xs space-y-1">
                  <p className="text-xs font-bold text-neutral-500">
                    Commandes du jour
                  </p>
                  <p className="text-2xl sm:text-3xl font-extrabold text-neutral-950">
                    {orders.length}
                  </p>
                </div>

                <div className="rounded-3xl bg-white border border-neutral-200/90 p-5 shadow-2xs space-y-1">
                  <p className="text-xs font-bold text-neutral-500">
                    Chiffre d’affaires
                  </p>
                  <PriceDisplay
                    amount={totalRevenue}
                    lang={lang}
                    className="text-2xl sm:text-3xl font-extrabold"
                    style={{ color: primaryColor }}
                  />
                </div>

                <div className="rounded-3xl bg-white border border-neutral-200/90 p-5 shadow-2xs space-y-1">
                  <p className="text-xs font-bold text-neutral-500">
                    Clients enregistrés
                  </p>
                  <p className="text-2xl sm:text-3xl font-extrabold text-neutral-950">
                    {customers.length}
                  </p>
                </div>

                <div className="rounded-3xl bg-white border border-neutral-200/90 p-5 shadow-2xs space-y-1">
                  <p className="text-xs font-bold text-neutral-500">
                    Tables QR actives
                  </p>
                  <p className="text-2xl sm:text-3xl font-extrabold text-neutral-950">
                    {(activeBusiness.tableCount ?? 12) +
                      (activeBusiness.extraTables?.length ?? 0)}
                  </p>
                </div>
              </div>

              {/* Top Selling Items & Recent Orders */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-6 rounded-3xl bg-white border border-neutral-200/90 p-5 sm:p-6 shadow-2xs space-y-4">
                  <h3 className="text-base font-extrabold text-neutral-950">
                    Articles les plus commandés
                  </h3>
                  <div className="space-y-2.5">
                    {topItemsList.slice(0, 5).map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between rounded-2xl bg-neutral-50 border border-neutral-200/80 px-4 py-2.5 text-xs"
                      >
                        <span className="font-extrabold text-neutral-900">
                          {item.qty}x {item.name}
                        </span>
                        <PriceDisplay
                          amount={item.revenue}
                          lang={lang}
                          className="font-extrabold"
                          style={{ color: primaryColor }}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-6 rounded-3xl bg-white border border-neutral-200/90 p-5 sm:p-6 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-extrabold text-neutral-950">
                      Dernières commandes en direct
                    </h3>
                    <button
                      type="button"
                      onClick={() => handleSelectTab('orders')}
                      className="text-xs font-extrabold hover:underline cursor-pointer"
                      style={{ color: primaryColor }}
                    >
                      Tout voir →
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {orders.slice(0, 4).map((ord) => (
                      <div
                        key={ord.id}
                        className="flex items-center justify-between rounded-2xl bg-neutral-50 border border-neutral-200/80 px-4 py-2.5 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-extrabold text-neutral-950">
                            {ord.code}
                          </span>
                          {ord.table_label && (
                            <span
                              className="px-2 py-0.5 rounded-md text-[11px] font-extrabold text-white"
                              style={{ backgroundColor: primaryColor }}
                            >
                              Table {ord.table_label}
                            </span>
                          )}
                          <span className="text-neutral-600 truncate max-w-[130px]">
                            {ord.customer_name || 'Sur place'}
                          </span>
                        </div>
                        <PriceDisplay
                          amount={ord.total}
                          lang={lang}
                          className="font-extrabold text-neutral-950"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================ */}
          {/* TAB 2: ORDERS (Live Supabase Realtime, Sound, Statuses,          */}
          {/*        Reply on WhatsApp, Print Ticket, CSV Export)              */}
          {/* ================================================================ */}
          {activeTab === 'orders' && (
            <div className="space-y-5">
              {/* Top Controls Bar */}
              <div className="rounded-3xl bg-white border border-neutral-200/90 p-4 sm:p-5 shadow-2xs flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-1.5">
                  {(
                    [
                      'all',
                      'new',
                      'confirmed',
                      'preparing',
                      'ready',
                      'delivered',
                      'cancelled',
                    ] as const
                  ).map((st) => {
                    const active = orderStatusFilter === st;
                    return (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setOrderStatusFilter(st)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-colors cursor-pointer ${
                          active
                            ? 'text-white'
                            : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                        }`}
                        style={
                          active ? { backgroundColor: primaryColor } : undefined
                        }
                      >
                        {st === 'all'
                          ? `Toutes (${orders.length})`
                          : STATUS_BADGES[st].labelFr}
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const next = !soundEnabled;
                      setSoundEnabled(next);
                      if (next) playNewOrderChime();
                    }}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-extrabold cursor-pointer ${
                      soundEnabled
                        ? 'bg-emerald-100 text-emerald-900'
                        : 'bg-neutral-100 text-neutral-600'
                    }`}
                  >
                    {soundEnabled ? (
                      <Volume2 className="w-4 h-4" />
                    ) : (
                      <VolumeX className="w-4 h-4" />
                    )}
                    <span>{soundEnabled ? 'Son actif' : 'Muet'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={playNewOrderChime}
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-xs font-bold text-neutral-700 cursor-pointer"
                  >
                    <Bell className="w-3.5 h-3.5" />
                    <span>Tester son</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleExportOrdersCsv}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-neutral-900 text-white text-xs font-extrabold cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export CSV</span>
                  </button>
                </div>
              </div>

              {/* Orders Cards List */}
              {filteredOrders.length === 0 ? (
                <div className="rounded-3xl bg-white border border-neutral-200 p-10 text-center space-y-2">
                  <p className="text-sm font-extrabold text-neutral-800">
                    Aucune commande dans ce filtre
                  </p>
                  <p className="text-xs text-neutral-500">
                    Testez une commande en direct depuis{' '}
                    <Link
                      to={`/m/${activeBusiness.slug}?t=5`}
                      className="underline font-bold"
                      style={{ color: primaryColor }}
                    >
                      /m/{activeBusiness.slug}?t=5
                    </Link>
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredOrders.map((ord) => {
                    const badge = STATUS_BADGES[ord.status];
                    const replyWaUrl = getWhatsAppUrl(
                      `Salam ${ord.customer_name || ''}, votre commande ${ord.code} chez ${activeBusiness.name} est : ${badge.labelFr}.`,
                      ord.phone || activeBusiness.contact.whatsapp
                    );

                    return (
                      <div
                        key={ord.id}
                        className="rounded-3xl bg-white border border-neutral-200/90 p-5 shadow-2xs space-y-4"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-100 pb-3">
                          <div className="flex flex-wrap items-center gap-2.5">
                            <span
                              dir="ltr"
                              className="px-3 py-1 rounded-xl bg-neutral-900 text-white text-xs font-mono font-extrabold"
                            >
                              {ord.code}
                            </span>

                            <span
                              className={`px-2.5 py-1 rounded-xl text-xs font-extrabold ${badge.cls}`}
                            >
                              {badge.labelFr}
                            </span>

                            {ord.table_label && (
                              <span
                                className="px-3 py-1 rounded-xl text-xs font-extrabold text-white shadow-2xs"
                                style={{ backgroundColor: primaryColor }}
                              >
                                Table {ord.table_label}
                              </span>
                            )}

                            <span className="text-xs font-bold text-neutral-600">
                              {ord.type === 'dineIn'
                                ? 'Sur place'
                                : ord.type === 'takeaway'
                                ? 'À emporter'
                                : 'Livraison'}
                            </span>

                            <span className="text-xs text-neutral-400">
                              {new Date(ord.created_at).toLocaleTimeString('fr-MA', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>

                          <PriceDisplay
                            amount={ord.total}
                            lang={lang}
                            className="text-base sm:text-lg font-extrabold"
                            style={{ color: primaryColor }}
                          />
                        </div>

                        {/* Items */}
                        <div className="space-y-1.5">
                          {ord.items.map((item, idx) => (
                            <div
                              key={idx}
                              className="flex items-start justify-between text-xs sm:text-sm"
                            >
                              <div>
                                <span className="font-extrabold text-neutral-950">
                                  {item.quantity}x {getLocalized(item.name, lang)}
                                </span>
                                {item.option_labels?.length > 0 && (
                                  <span className="text-neutral-500 text-xs ms-2">
                                    ({item.option_labels.join(', ')})
                                  </span>
                                )}
                                {item.note && (
                                  <p className="text-xs text-amber-700 font-semibold">
                                    Note: {item.note}
                                  </p>
                                )}
                              </div>
                              <PriceDisplay
                                amount={item.line_total}
                                lang={lang}
                                className="font-bold text-neutral-800"
                              />
                            </div>
                          ))}
                        </div>

                        {/* Customer info if present */}
                        {(ord.customer_name || ord.phone || ord.address) && (
                          <div className="rounded-2xl bg-neutral-50 p-3 text-xs text-neutral-700 flex flex-wrap gap-4">
                            {ord.customer_name && (
                              <span>
                                <strong>Client:</strong> {ord.customer_name}
                              </span>
                            )}
                            {ord.phone && (
                              <span dir="ltr">
                                <strong>Tél:</strong> {ord.phone}
                              </span>
                            )}
                            {ord.address && (
                              <span>
                                <strong>Adresse:</strong> {ord.address}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Status Buttons + Reply on WhatsApp + Print Ticket */}
                        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-neutral-100">
                          <div className="flex flex-wrap items-center gap-1.5">
                            {(
                              [
                                'confirmed',
                                'preparing',
                                'ready',
                                'delivered',
                                'cancelled',
                              ] as OrderStatus[]
                            ).map((nextStatus) => (
                              <button
                                key={nextStatus}
                                type="button"
                                onClick={async () => {
                                  await updateOrderStatus(
                                    ord.id,
                                    nextStatus,
                                    activeBusiness,
                                    session
                                  );
                                  setRefreshTick((t) => t + 1);
                                }}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                                  ord.status === nextStatus
                                    ? 'bg-neutral-900 text-white'
                                    : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800'
                                }`}
                              >
                                {STATUS_BADGES[nextStatus].labelFr}
                              </button>
                            ))}
                          </div>

                          <div className="flex items-center gap-2">
                            <a
                              href={replyWaUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#25D366] text-white text-xs font-extrabold"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span>Répondre WhatsApp</span>
                            </a>

                            <button
                              type="button"
                              onClick={() => setPrintingOrder(ord)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-extrabold cursor-pointer"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span>Ticket</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ================================================================ */}
          {/* TAB 3: CUSTOMERS (CRM List, History, Notes, Inactive Filter,     */}
          {/*        CSV Export, and Marketing Consent Promo Helper)           */}
          {/* ================================================================ */}
          {activeTab === 'customers' && (
            <div className="space-y-6">
              {/* Promo Helper: ONLY lists customers with marketing_consent = true */}
              <div className="rounded-3xl bg-neutral-900 text-white p-5 sm:p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-1">
                    <span
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-extrabold text-white"
                      style={{ backgroundColor: primaryColor }}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>
                        Assistant Promo WhatsApp (Clients avec consentement uniquement)
                      </span>
                    </span>
                    <h3 className="text-base sm:text-lg font-extrabold text-white">
                      Envoyer une offre aux clients ayant accepté le marketing ({consentedCustomers.length})
                    </h3>
                  </div>
                </div>

                <textarea
                  rows={2}
                  value={promoTemplate}
                  onChange={(e) => setPromoTemplate(e.target.value)}
                  className="w-full rounded-2xl bg-white/10 border border-white/20 px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {consentedCustomers.map((c) => {
                    const personalizedMsg = promoTemplate
                      .replace(/\{name\}/g, c.name)
                      .replace(/\{business\}/g, activeBusiness.name);
                    const waHref = getWhatsAppUrl(personalizedMsg, c.phone);
                    return (
                      <div
                        key={c.id}
                        className="rounded-2xl bg-white/10 border border-white/15 p-3 flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-extrabold text-white truncate">
                            {c.name}
                          </p>
                          <p dir="ltr" className="text-[11px] text-neutral-300 truncate">
                            {c.phone}
                          </p>
                        </div>
                        <a
                          href={waHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#25D366] text-white text-xs font-extrabold shrink-0"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>wa.me</span>
                        </a>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Filter & CSV Export Bar */}
              <div className="rounded-3xl bg-white border border-neutral-200/90 p-5 shadow-2xs space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {(
                      [
                        { id: 'all', label: `Tous les clients (${customers.length})` },
                        { id: 'inactive', label: 'Inactifs (+30 jours)' },
                        {
                          id: 'marketing',
                          label: `Consentement Marketing (${consentedCustomers.length})`,
                        },
                      ] as const
                    ).map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setCustomerFilter(f.id)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-extrabold cursor-pointer ${
                          customerFilter === f.id
                            ? 'text-white'
                            : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                        }`}
                        style={
                          customerFilter === f.id
                            ? { backgroundColor: primaryColor }
                            : undefined
                        }
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={handleExportCustomersCsv}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-neutral-900 text-white text-xs font-extrabold cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export CSV Clients</span>
                  </button>
                </div>

                {/* Customers List */}
                <div className="space-y-3">
                  {filteredCustomers.map((cust) => (
                    <div
                      key={cust.id}
                      className="rounded-2xl bg-neutral-50 border border-neutral-200/80 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-extrabold text-neutral-950">
                            {cust.name}
                          </h4>
                          <span
                            dir="ltr"
                            className="text-xs font-mono text-neutral-600 bg-white px-2 py-0.5 rounded-md border border-neutral-200"
                          >
                            {cust.phone}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-neutral-200 text-neutral-800 text-[11px] font-extrabold">
                            {cust.orders_count} commande(s)
                          </span>
                          <PriceDisplay
                            amount={cust.total_spent}
                            lang={lang}
                            className="text-xs font-extrabold"
                            style={{ color: primaryColor }}
                          />
                        </div>

                        <div className="flex items-center gap-3 text-[11px] text-neutral-500">
                          <span>
                            Dernière commande:{' '}
                            {new Date(cust.last_order_at).toLocaleDateString('fr-MA')}
                          </span>
                          <label className="inline-flex items-center gap-1 font-bold text-neutral-700 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={cust.marketing_consent}
                              onChange={async (e) => {
                                await updateCustomerNotes(
                                  cust.id,
                                  cust.notes,
                                  e.target.checked,
                                  activeBusiness,
                                  session
                                );
                                setRefreshTick((t) => t + 1);
                              }}
                            />
                            <span>Opt-in Promo WhatsApp</span>
                          </label>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={cust.notes}
                          onChange={async (e) => {
                            await updateCustomerNotes(
                              cust.id,
                              e.target.value,
                              cust.marketing_consent,
                              activeBusiness,
                              session
                            );
                            setRefreshTick((t) => t + 1);
                          }}
                          placeholder="Ajouter une note client..."
                          className="rounded-xl bg-white border border-neutral-200 px-3 py-1.5 text-xs text-neutral-800 w-48"
                        />

                        <button
                          type="button"
                          onClick={() => setSelectedCustomerHistory(cust)}
                          className="px-3 py-1.5 rounded-xl bg-white border border-neutral-200 hover:bg-neutral-100 text-xs font-bold text-neutral-800 cursor-pointer"
                        >
                          Historique
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ================================================================ */}
          {/* TAB 4: PRODUCTS                                                  */}
          {/* ================================================================ */}
          {activeTab === 'products' && (
            <ProductsTabPanel
              menu={activeBusiness}
              lang={lang}
              onSaveMenu={handleSaveMenu}
            />
          )}

          {/* ================================================================ */}
          {/* TAB 5: AUTOMATIC TABLES & QR                                     */}
          {/* ================================================================ */}
          {activeTab === 'tables' && (
            <TableQrStudio
              menu={activeBusiness}
              lang={lang}
              onUpdateTableSettings={(nextCount, nextExtras) => {
                handleSaveMenu((cur) => ({
                  ...cur,
                  tableCount: nextCount,
                  extraTables: nextExtras,
                }));
              }}
            />
          )}

          {/* ================================================================ */}
          {/* TAB 6: HOURS & ORDERING                                          */}
          {/* ================================================================ */}
          {activeTab === 'hours' && (
            <HoursAndOrderingTabPanel
              menu={activeBusiness}
              lang={lang}
              onSaveMenu={handleSaveMenu}
            />
          )}

          {/* ================================================================ */}
          {/* TAB 7: LOOK & THEME                                              */}
          {/* ================================================================ */}
          {activeTab === 'look' && (
            <LookTabPanel
              menu={activeBusiness}
              lang={lang}
              onSaveMenu={handleSaveMenu}
            />
          )}

          {/* ================================================================ */}
          {/* TAB 8: STATS                                                     */}
          {/* ================================================================ */}
          {activeTab === 'stats' && (
            <StatsTabPanel
              menu={activeBusiness}
              orders={orders}
              events={events}
              lang={lang}
            />
          )}

          {/* ================================================================ */}
          {/* TAB 9: SETTINGS                                                  */}
          {/* ================================================================ */}
          {activeTab === 'settings' && (
            <SettingsTabPanel
              menu={activeBusiness}
              lang={lang}
              onSaveMenu={handleSaveMenu}
            />
          )}
        </main>
      </div>

      {/* ==================================================================== */}
      {/* MOBILE BOTTOM TAB BAR                                                */}
      {/* ==================================================================== */}
      <nav className="fixed bottom-0 inset-x-0 z-30 bg-white border-t border-neutral-200 px-2 py-1.5 grid grid-cols-5 gap-1 lg:hidden">
        {navItems.slice(0, 4).map((item) => {
          const Icon = item.icon;
          const active = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleSelectTab(item.id)}
              className={`flex flex-col items-center justify-center py-1.5 rounded-xl text-[10px] font-extrabold cursor-pointer ${
                active ? 'text-white' : 'text-neutral-600'
              }`}
              style={active ? { backgroundColor: primaryColor } : undefined}
            >
              <Icon className="w-4 h-4 mb-0.5" />
              <span className="truncate max-w-[64px]">{item.label}</span>
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => setMobileMoreOpen((p) => !p)}
          className="flex flex-col items-center justify-center py-1.5 rounded-xl text-[10px] font-extrabold text-neutral-700 bg-neutral-100 cursor-pointer"
        >
          <MoreHorizontal className="w-4 h-4 mb-0.5" />
          <span>Plus</span>
        </button>
      </nav>

      {/* Mobile "More" Drawer */}
      {mobileMoreOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 flex items-end lg:hidden"
          onClick={() => setMobileMoreOpen(false)}
        >
          <div
            className="bg-white w-full rounded-t-3xl p-5 space-y-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="grid grid-cols-2 gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectTab(item.id)}
                    className="flex items-center gap-2 p-3 rounded-xl bg-neutral-50 border border-neutral-200 text-xs font-extrabold text-neutral-900"
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              className="w-full py-2.5 rounded-xl bg-rose-50 text-rose-600 text-xs font-extrabold"
            >
              Déconnexion
            </button>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* THERMAL TICKET PRINT MODAL                                           */}
      {/* ==================================================================== */}
      {printingOrder && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          onClick={() => setPrintingOrder(null)}
        >
          <div
            className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl space-y-4 font-mono text-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center border-b border-dashed border-neutral-300 pb-3 space-y-1">
              <h3 className="text-base font-extrabold text-neutral-950">
                {activeBusiness.name}
              </h3>
              <p className="text-neutral-500">Ticket Commande #{printingOrder.code}</p>
              {printingOrder.table_label && (
                <p className="text-sm font-extrabold">
                  TABLE {printingOrder.table_label}
                </p>
              )}
              <p className="text-[11px] text-neutral-400">
                {new Date(printingOrder.created_at).toLocaleString('fr-MA')}
              </p>
            </div>

            <div className="space-y-2 border-b border-dashed border-neutral-300 pb-3">
              {printingOrder.items.map((it, idx) => (
                <div key={idx} className="flex justify-between">
                  <span>
                    {it.quantity}x {getLocalized(it.name, lang)}
                  </span>
                  <span>{formatPriceText(it.line_total, lang)}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-between text-sm font-extrabold">
              <span>TOTAL</span>
              <span>{formatPriceText(printingOrder.total, lang)}</span>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2.5 rounded-xl bg-neutral-900 text-white font-sans font-extrabold cursor-pointer"
              >
                Imprimer
              </button>
              <button
                type="button"
                onClick={() => setPrintingOrder(null)}
                className="px-4 py-2.5 rounded-xl bg-neutral-100 text-neutral-700 font-sans font-bold cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* CUSTOMER ORDER HISTORY MODAL                                         */}
      {/* ==================================================================== */}
      {selectedCustomerHistory && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          onClick={() => setSelectedCustomerHistory(null)}
        >
          <div
            className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-neutral-950">
                  Historique — {selectedCustomerHistory.name}
                </h3>
                <p dir="ltr" className="text-xs text-neutral-500">
                  {selectedCustomerHistory.phone}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCustomerHistory(null)}
                className="p-2 rounded-xl bg-neutral-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {orders
                .filter(
                  (o) =>
                    o.phone === selectedCustomerHistory.phone ||
                    o.customer_name === selectedCustomerHistory.name
                )
                .map((o) => (
                  <div
                    key={o.id}
                    className="rounded-xl bg-neutral-50 border border-neutral-200 p-3 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-mono font-extrabold">{o.code}</span>
                      <span className="text-neutral-500 ms-2">
                        {new Date(o.created_at).toLocaleDateString('fr-MA')}
                      </span>
                    </div>
                    <PriceDisplay
                      amount={o.total}
                      lang={lang}
                      className="font-extrabold"
                    />
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
