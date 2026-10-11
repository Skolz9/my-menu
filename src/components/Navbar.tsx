import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, MessageCircle, User } from 'lucide-react';
import { config, getWhatsAppUrl } from '../config';
import { useLanguage } from '../i18n/LanguageContext';
import type { Language } from '../menus/types';
import { BrandLogo } from './BrandLogo';
import { LanguageSwitcher } from './LanguageSwitcher';

const MOBILE_LANG_PILLS: { code: Language; label: string; full: string }[] = [
  { code: 'ar', label: 'AR', full: 'العربية' },
  { code: 'fr', label: 'FR', full: 'Français' },
  { code: 'en', label: 'EN', full: 'English' },
];

export const Navbar: React.FC = () => {
  const { t, lang, setLang, dir } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);

  const whatsappHref = getWhatsAppUrl(
    t.nav.whatsappDefaultMsg,
    config.whatsappNumber
  );

  const navLinks = [
    { label: t.nav.howItWorks, href: '/#how-it-works', isRoute: false },
    { label: t.nav.pricing, href: '/#pricing', isRoute: false },
    { label: t.nav.demo, href: '/m/demo', isRoute: true },
    { label: t.nav.faq, href: '/#faq', isRoute: false },
    { label: t.nav.contact, href: '/#contact', isRoute: false },
  ];

  // Close mobile menu on ESC key
  useEffect(() => {
    if (!mobileOpen || typeof window === 'undefined') return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileOpen]);

  // Lock body scroll while mobile menu is open
  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (mobileOpen) {
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = previousOverflow;
      };
    }
  }, [mobileOpen]);

  return (
    <>
      <header
        dir={dir}
        className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200/80"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          {/* Zone 1: Brand Logo */}
          <Link
            to="/"
            onClick={() => setMobileOpen(false)}
            className="shrink-0 focus:outline-none"
          >
            <BrandLogo />
          </Link>

          {/* Zone 2: Desktop Navigation Links */}
          <nav
            className="hidden lg:flex items-center gap-7 text-sm font-semibold text-neutral-600"
            aria-label="Primary Navigation"
          >
            {navLinks.map((item) =>
              item.isRoute ? (
                <Link
                  key={item.href}
                  to={item.href}
                  className="hover:text-neutral-950 transition-colors whitespace-nowrap py-1"
                >
                  {item.label}
                </Link>
              ) : (
                <a
                  key={item.href}
                  href={item.href}
                  className="hover:text-neutral-950 transition-colors whitespace-nowrap py-1"
                >
                  {item.label}
                </a>
              )
            )}
          </nav>

          {/* Zone 3: Desktop Language Switcher + Espace Client + WhatsApp CTA */}
          <div className="hidden md:flex items-center gap-2.5 shrink-0">
            <LanguageSwitcher />
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-neutral-800 bg-neutral-100 hover:bg-neutral-200 transition-colors whitespace-nowrap"
            >
              <span>Espace Client</span>
            </Link>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white shadow-xs hover:opacity-95 transition-opacity whitespace-nowrap"
              style={{ backgroundColor: config.colors.primary }}
            >
              <MessageCircle className="w-4 h-4 shrink-0" />
              <span>{t.nav.whatsappCta}</span>
            </a>
          </div>

          {/* Mobile Controls (< 768px): ONLY Compact "Espace Client" User Icon Button + Hamburger Button */}
          <div className="flex md:hidden items-center gap-2 shrink-0">
            <Link
              to="/login"
              onClick={() => setMobileOpen(false)}
              aria-label="Espace Client"
              title="Espace Client"
              className="min-w-[44px] min-h-[44px] w-11 h-11 rounded-xl border border-neutral-200 bg-neutral-50 hover:bg-neutral-100 text-neutral-800 inline-flex items-center justify-center transition-colors"
            >
              <User className="w-5 h-5" />
            </Link>

            <button
              type="button"
              onClick={() => setMobileOpen((prev) => !prev)}
              className="min-w-[44px] min-h-[44px] w-11 h-11 rounded-xl border border-neutral-200 bg-white text-neutral-800 hover:bg-neutral-100 inline-flex items-center justify-center transition-colors cursor-pointer"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
              aria-controls="mobile-slide-down-menu"
            >
              {mobileOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Full-Width Slide-Down Panel */}
        {mobileOpen && (
          <div
            id="mobile-slide-down-menu"
            dir={dir}
            className="md:hidden absolute top-full inset-x-0 bg-white border-b border-neutral-200 shadow-2xl px-4 pt-3 pb-6 space-y-4 max-h-[calc(100vh-4rem)] overflow-y-auto"
          >
            {/* 1. Navigation Links (min 44px touch targets) */}
            <nav
              className="flex flex-col space-y-1"
              aria-label="Mobile Navigation"
            >
              {navLinks.map((item) =>
                item.isRoute ? (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="min-h-[44px] px-3.5 py-2.5 rounded-xl text-sm font-bold text-neutral-800 hover:bg-neutral-100 flex items-center transition-colors"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="min-h-[44px] px-3.5 py-2.5 rounded-xl text-sm font-bold text-neutral-800 hover:bg-neutral-100 flex items-center transition-colors"
                  >
                    {item.label}
                  </a>
                )
              )}
            </nav>

            {/* 2. Language Switcher (AR / FR / EN as pill buttons with >= 44px touch targets) */}
            <div className="pt-2 border-t border-neutral-100">
              <div
                className="grid grid-cols-3 gap-2"
                role="group"
                aria-label="Language switcher"
              >
                {MOBILE_LANG_PILLS.map((pill) => {
                  const isActive = lang === pill.code;
                  return (
                    <button
                      key={pill.code}
                      type="button"
                      onClick={() => {
                        setLang(pill.code);
                      }}
                      aria-pressed={isActive}
                      className={`min-h-[44px] px-3 py-2.5 rounded-full text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        isActive
                          ? 'text-white shadow-xs'
                          : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                      }`}
                      style={
                        isActive
                          ? { backgroundColor: config.colors.primary }
                          : undefined
                      }
                    >
                      <span>{pill.label}</span>
                      <span className="text-[11px] opacity-85">
                        ({pill.full})
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Secondary Button "Espace Client" (/login) + Green WhatsApp CTA */}
            <div className="pt-2 border-t border-neutral-100 space-y-2.5">
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="w-full min-h-[44px] px-4 py-3 rounded-xl text-sm font-extrabold text-neutral-900 bg-neutral-100 hover:bg-neutral-200 border border-neutral-200/80 inline-flex items-center justify-center gap-2 transition-colors"
              >
                <User className="w-4 h-4 shrink-0 text-neutral-700" />
                <span>Espace Client</span>
              </Link>

              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileOpen(false)}
                className="w-full min-h-[44px] px-4 py-3 rounded-xl text-sm font-extrabold text-white shadow-xs inline-flex items-center justify-center gap-2 hover:opacity-95 transition-opacity"
                style={{ backgroundColor: config.colors.primary }}
              >
                <MessageCircle className="w-4 h-4 shrink-0" />
                <span>{t.nav.whatsappCta}</span>
              </a>
            </div>
          </div>
        )}
      </header>

      {/* Tap-outside Backdrop Overlay when Mobile Panel is open */}
      {mobileOpen && (
        <div
          aria-hidden="true"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-[1px] md:hidden"
        />
      )}
    </>
  );
};
