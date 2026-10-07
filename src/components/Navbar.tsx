import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, MessageCircle } from 'lucide-react';
import { config, getWhatsAppUrl } from '../config';
import { useLanguage } from '../i18n/LanguageContext';
import { BrandLogo } from './BrandLogo';
import { LanguageSwitcher } from './LanguageSwitcher';

export const Navbar: React.FC = () => {
  const { t } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);

  const whatsappHref = getWhatsAppUrl(t.nav.whatsappDefaultMsg, config.whatsappNumber);

  const navLinks = [
    { label: t.nav.howItWorks, href: '/#how-it-works', isRoute: false },
    { label: t.nav.pricing, href: '/#pricing', isRoute: false },
    { label: t.nav.demo, href: '/m/demo', isRoute: true },
    { label: t.nav.faq, href: '/#faq', isRoute: false },
    { label: t.nav.contact, href: '/#contact', isRoute: false },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-neutral-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Brand Logo */}
        <Link to="/" className="shrink-0 focus:outline-none">
          <BrandLogo />
        </Link>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-7 text-sm font-semibold text-neutral-600" aria-label="Primary Navigation">
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

        {/* Zone 3: Language Switcher + WhatsApp CTA */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          <LanguageSwitcher />
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

        {/* Mobile Controls */}
        <div className="flex md:hidden items-center gap-2">
          <LanguageSwitcher />
          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="p-2 rounded-xl border border-neutral-200 text-neutral-700 hover:bg-neutral-100 cursor-pointer"
            aria-label="Toggle Menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-neutral-200 bg-white px-4 pt-3 pb-5 space-y-3 shadow-lg">
          <nav className="flex flex-col space-y-1">
            {navLinks.map((item) =>
              item.isRoute ? (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="px-3 py-2.5 rounded-xl text-sm font-semibold text-neutral-700 hover:bg-neutral-100"
                >
                  {item.label}
                </Link>
              ) : (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="px-3 py-2.5 rounded-xl text-sm font-semibold text-neutral-700 hover:bg-neutral-100"
                >
                  {item.label}
                </a>
              )
            )}
          </nav>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold text-white shadow-xs"
            style={{ backgroundColor: config.colors.primary }}
          >
            <MessageCircle className="w-4 h-4 shrink-0" />
            <span>{t.nav.whatsappCta}</span>
          </a>
        </div>
      )}
    </header>
  );
};
