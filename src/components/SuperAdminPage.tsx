import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Plus,
  Store,
  QrCode,
  ExternalLink,
  Power,
  LogOut,
  Check,
  AlertCircle,
  X,
  LayoutDashboard,
  UserCheck,
} from 'lucide-react';
import { config } from '../config';
import { useLanguage } from '../i18n/LanguageContext';
import type { ClientMenu } from '../menus';
import { BrandLogo } from './BrandLogo';
import { LanguageSwitcher } from './LanguageSwitcher';
import { PriceDisplay } from './PriceDisplay';
import { TableQrStudio } from './TableQrStudio';
import {
  getCurrentSession,
  loadLocalBusinesses,
  loadLocalOrders,
  adminCreateNewBusiness,
  adminSetBusinessActive,
  adminAssignOwnerEmail,
  updateBusinessConfig,
  signInWithEmailPassword,
  signOutUser,
  subscribeToRealtimeChanges,
  type AuthUserSession,
} from '../lib/store';

export const SuperAdminPage: React.FC = () => {
  const { lang, dir } = useLanguage();
  const navigate = useNavigate();

  const [session, setSession] = useState<AuthUserSession | null>(() =>
    getCurrentSession()
  );
  const [refreshTick, setRefreshTick] = useState(0);

  // New Client Form State
  const [newName, setNewName] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [newOwnerEmail, setNewOwnerEmail] = useState('');
  const [newTableCount, setNewTableCount] = useState<number>(10);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // One-click QR Pack Modal for any client
  const [qrPackClientSlug, setQrPackClientSlug] = useState<string | null>(null);

  useEffect(() => {
    const unsub = subscribeToRealtimeChanges(() => {
      setSession(getCurrentSession());
      setRefreshTick((t) => t + 1);
    });
    return unsub;
  }, []);

  const businesses = useMemo(
    () => loadLocalBusinesses(),
    [refreshTick, session]
  );
  const allOrders = useMemo(() => loadLocalOrders(), [refreshTick, session]);

  const qrPackClient: ClientMenu | undefined = useMemo(
    () => businesses.find((b) => b.slug === qrPackClientSlug),
    [businesses, qrPackClientSlug]
  );

  const handleAutoSlug = (nameVal: string) => {
    setNewName(nameVal);
    const generated = nameVal
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    setNewSlug(generated);
  };

  const handleCreateBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    if (!newName.trim() || !newSlug.trim()) {
      setFormError('Veuillez renseigner le nom et le slug du client.');
      return;
    }
    try {
      const created = await adminCreateNewBusiness(
        {
          name: newName,
          slug: newSlug,
          ownerEmail: newOwnerEmail || `${newSlug}@mymenu.ma`,
          tableCount: newTableCount,
        },
        session
      );
      setFormSuccess(
        `Client "${created.name}" créé avec succès (/m/${created.slug}, ${created.tableCount} tables).`
      );
      setNewName('');
      setNewSlug('');
      setNewOwnerEmail('');
      setNewTableCount(10);
      setRefreshTick((t) => t + 1);
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : 'Erreur lors de la création'
      );
    }
  };

  const handleToggleActive = async (biz: ClientMenu) => {
    const nextState = biz.isActive === false;
    await adminSetBusinessActive(biz.slug, nextState, session);
    setRefreshTick((t) => t + 1);
  };

  // If not logged in or not an admin, show Admin Access Gate
  if (!session || !session.isAdmin) {
    return (
      <div
        dir={dir}
        className="min-h-screen bg-[#FAF8F5] flex items-center justify-center p-6"
      >
        <div className="max-w-md w-full bg-white rounded-3xl border border-neutral-200 p-8 text-center shadow-sm space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-neutral-900 text-[#6BBF3A] flex items-center justify-center mx-auto">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-extrabold text-neutral-950">
            Accès réservé au Super Admin
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
            Cette interface d’administration générale de l’agence{' '}
            <strong>{config.agencyName}</strong> est réservée aux comptes présents
            dans la table <code className="font-mono">public.admins</code>.
          </p>
          <div className="space-y-2.5 pt-2">
            <button
              type="button"
              onClick={async () => {
                const adminSess = await signInWithEmailPassword(
                  'admin@mymenu.ma',
                  'admin1234'
                );
                setSession(adminSess);
              }}
              className="w-full py-3 px-4 rounded-2xl text-xs sm:text-sm font-extrabold text-white shadow-xs cursor-pointer"
              style={{ backgroundColor: config.colors.primary }}
            >
              Activer la session Super Admin (admin@mymenu.ma)
            </button>
            <Link
              to="/dashboard"
              className="block w-full py-2.5 px-4 rounded-2xl bg-neutral-100 text-xs font-bold text-neutral-700"
            >
              Retour au Dashboard Restaurant
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  return (
    <div dir={dir} className="min-h-screen bg-[#FAF8F5] pb-16">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 bg-neutral-950 text-white border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link to="/">
              <BrandLogo variant="dark" size="sm" />
            </Link>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#6BBF3A]/20 text-[#6BBF3A] text-xs font-extrabold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Super Admin • {config.agencyName}</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </Link>
            <button
              type="button"
              onClick={async () => {
                await signOutUser();
                navigate('/login');
              }}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 text-xs font-bold cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Quitter</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-8">
        {/* ================================================================== */}
        {/* 1. NEW CLIENT FORM (calls create_business RPC)                     */}
        {/* ================================================================== */}
        <section className="rounded-3xl bg-white border border-neutral-200/90 p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span
                className="w-8 h-8 rounded-xl flex items-center justify-center text-white"
                style={{ backgroundColor: config.colors.primary }}
              >
                <Plus className="w-4 h-4" />
              </span>
              <div>
                <h2 className="text-base sm:text-lg font-extrabold text-neutral-950">
                  Nouveau client (Café / Restaurant)
                </h2>
                <p className="text-xs text-neutral-500">
                  Exécute <code className="font-mono">create_business(name, slug, owner_email, table_count)</code> : crée le restaurant, lie le propriétaire et initialise les catégories par défaut.
                </p>
              </div>
            </div>
          </div>

          {formError && (
            <div className="rounded-2xl bg-rose-950 text-white p-3.5 flex items-center gap-2 text-xs font-bold">
              <AlertCircle className="w-4 h-4 text-rose-300 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {formSuccess && (
            <div className="rounded-2xl bg-emerald-950 text-white p-3.5 flex items-center gap-2 text-xs font-bold">
              <Check className="w-4 h-4 text-emerald-300 shrink-0" />
              <span>{formSuccess}</span>
            </div>
          )}

          <form
            onSubmit={handleCreateBusiness}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end"
          >
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                Nom de l’établissement
              </label>
              <input
                type="text"
                required
                value={newName}
                onChange={(e) => handleAutoSlug(e.target.value)}
                placeholder="Ex: Café Majorelle"
                className="w-full rounded-xl bg-neutral-50 border border-neutral-200 px-3 py-2 text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                Slug URL (/m/slug)
              </label>
              <input
                type="text"
                required
                dir="ltr"
                value={newSlug}
                onChange={(e) => setNewSlug(e.target.value)}
                placeholder="cafe-majorelle"
                className="w-full rounded-xl bg-neutral-50 border border-neutral-200 px-3 py-2 text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                E-mail du propriétaire
              </label>
              <input
                type="email"
                dir="ltr"
                value={newOwnerEmail}
                onChange={(e) => setNewOwnerEmail(e.target.value)}
                placeholder="contact@cafemajorelle.ma"
                className="w-full rounded-xl bg-neutral-50 border border-neutral-200 px-3 py-2 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                Nombre de tables (QR auto)
              </label>
              <input
                type="number"
                min={1}
                max={500}
                dir="ltr"
                value={newTableCount}
                onChange={(e) => setNewTableCount(Number(e.target.value || 10))}
                className="w-full rounded-xl bg-neutral-50 border border-neutral-200 px-3 py-2 text-xs font-extrabold"
              />
            </div>

            <button
              type="submit"
              className="py-2.5 px-4 rounded-xl text-xs font-extrabold text-white shadow-xs hover:opacity-95 cursor-pointer"
              style={{ backgroundColor: config.colors.primary }}
            >
              + Créer le client
            </button>
          </form>
        </section>

        {/* ================================================================== */}
        {/* 2. ALL BUSINESSES LIST (Status, Monthly Orders, Suspend, QR Pack)  */}
        {/* ================================================================== */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-neutral-950">
              Clients & Établissements ({businesses.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {businesses.map((biz) => {
              const bizId = biz.id || `biz-${biz.slug}`;
              const monthlyOrders = allOrders.filter((o) => {
                const d = new Date(o.created_at);
                return (
                  (o.business_id === bizId || o.slug === biz.slug) &&
                  d.getMonth() === currentMonth &&
                  d.getFullYear() === currentYear &&
                  o.status !== 'cancelled'
                );
              });
              const monthlyRevenue = monthlyOrders.reduce(
                (s, o) => s + o.total,
                0
              );
              const isActive = biz.isActive !== false;

              return (
                <div
                  key={biz.slug}
                  className={`rounded-3xl bg-white border p-5 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition-colors ${
                    isActive
                      ? 'border-neutral-200/90'
                      : 'border-rose-300 bg-rose-50/30'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={biz.logo}
                      alt={biz.name}
                      referrerPolicy="no-referrer"
                      className="w-14 h-14 rounded-2xl object-cover border border-neutral-200 bg-neutral-100 shrink-0"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-extrabold text-neutral-950">
                          {biz.name}
                        </h3>
                        <span
                          className={`px-2.5 py-0.5 rounded-lg text-[11px] font-extrabold ${
                            isActive
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-600 text-white'
                          }`}
                        >
                          {isActive ? '● Actif' : '✕ Suspendu (Impayé)'}
                        </span>
                        <span className="px-2 py-0.5 rounded-lg bg-neutral-100 text-neutral-700 text-[11px] font-mono">
                          /m/{biz.slug}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-600">
                        <span>
                          <strong>Ville:</strong> {biz.city}
                        </span>
                        <span>•</span>
                        <span dir="ltr">
                          <strong>Owner:</strong>{' '}
                          {biz.ownerEmail || `${biz.slug}@mymenu.ma`}
                        </span>
                        <span>•</span>
                        <span>
                          <strong>Tables QR:</strong>{' '}
                          {(biz.tableCount ?? 12) + (biz.extraTables?.length ?? 0)}
                        </span>
                        <span>•</span>
                        <span>
                          <strong>Commandes ce mois:</strong>{' '}
                          {monthlyOrders.length} (
                          <PriceDisplay
                            amount={monthlyRevenue}
                            lang={lang}
                            className="font-extrabold text-neutral-900"
                          />
                          )
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons: Toggle Suspend, Open Dashboard, 1-Click QR Pack, View Public Menu */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {/* Suspend / Activate toggle */}
                    <button
                      type="button"
                      onClick={() => handleToggleActive(biz)}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                          : 'bg-emerald-600 text-white hover:bg-emerald-700'
                      }`}
                    >
                      <Power className="w-3.5 h-3.5" />
                      <span>
                        {isActive ? 'Suspendre' : 'Réactiver le menu'}
                      </span>
                    </button>

                    {/* 1-Click Table QR Pack */}
                    <button
                      type="button"
                      onClick={() => setQrPackClientSlug(biz.slug)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold text-white shadow-2xs cursor-pointer"
                      style={{ backgroundColor: config.colors.primary }}
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>Pack QR Tables</span>
                    </button>

                    {/* Open Client Dashboard */}
                    <Link
                      to={`/dashboard?business=${biz.slug}`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-extrabold"
                    >
                      <Store className="w-3.5 h-3.5" />
                      <span>Ouvrir Dashboard</span>
                    </Link>

                    {/* View Public Menu */}
                    <Link
                      to={`/m/${biz.slug}`}
                      className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold"
                    >
                      <span>Menu</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>

                    {/* Assign Owner Email via admin_set_owner_by_email */}
                    <button
                      type="button"
                      onClick={async () => {
                        const nextEmail = window.prompt(
                          `E-mail du propriétaire pour ${biz.name} :`,
                          biz.ownerEmail || `${biz.slug}@mymenu.ma`
                        );
                        if (nextEmail && nextEmail.trim()) {
                          await adminAssignOwnerEmail(
                            biz.slug,
                            nextEmail.trim(),
                            session
                          );
                          setRefreshTick((t) => t + 1);
                        }
                      }}
                      className="p-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 cursor-pointer"
                      title="Modifier l’e-mail du propriétaire (admin_set_owner_by_email)"
                    >
                      <UserCheck className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* ==================================================================== */}
      {/* ONE-CLICK CLIENT TABLE QR PACK MODAL                                 */}
      {/* ==================================================================== */}
      {qrPackClient && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setQrPackClientSlug(null)}
        >
          <div
            className="bg-[#FAF8F5] w-full max-w-6xl rounded-3xl max-h-[92vh] overflow-y-auto p-5 sm:p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between bg-white rounded-2xl px-5 py-3.5 border border-neutral-200">
              <div>
                <h3 className="text-base sm:text-lg font-extrabold text-neutral-950">
                  Pack QR Tables — {qrPackClient.name} (/m/{qrPackClient.slug})
                </h3>
                <p className="text-xs text-neutral-500">
                  Téléchargez le ZIP complet des tables ou les planches PDF A6 / A4 en un clic.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setQrPackClientSlug(null)}
                className="p-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <TableQrStudio
              menu={qrPackClient}
              lang={lang}
              onUpdateTableSettings={async (nextCount, nextExtras) => {
                await updateBusinessConfig(
                  qrPackClient.slug,
                  (cur) => ({
                    ...cur,
                    tableCount: nextCount,
                    extraTables: nextExtras,
                  }),
                  session
                );
                setRefreshTick((t) => t + 1);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
