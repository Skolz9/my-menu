import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Phone, Mail, Instagram } from 'lucide-react';
import { config, getWhatsAppUrl } from '../config';
import { useLanguage } from '../i18n/LanguageContext';
import { BrandLogo } from './BrandLogo';

export const Footer: React.FC = () => {
  const { t } = useLanguage();
  const whatsappUrl = getWhatsAppUrl(t.nav.whatsappDefaultMsg, config.whatsappNumber);
  const currentYear = new Date().getFullYear();

  return (
    <footer id="contact" className="bg-neutral-50 border-t border-neutral-200/80 pt-14 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-neutral-200/80">
          {/* Column 1: Brand & Description */}
          <div className="md:col-span-5 space-y-4">
            <Link to="/" className="inline-block">
              <BrandLogo />
            </Link>
            <p className="text-sm text-neutral-600 leading-relaxed max-w-sm">
              {t.footer.description}
            </p>
            <p className="text-xs text-neutral-400 leading-relaxed">
              {t.footer.seoKeywords}
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div className="md:col-span-3 space-y-3">
            <h3 className="text-sm font-extrabold text-neutral-950">
              {t.footer.navigationTitle}
            </h3>
            <ul className="space-y-2.5 text-sm text-neutral-600">
              <li>
                <a href="/#how-it-works" className="hover:text-neutral-950 transition-colors">
                  {t.nav.howItWorks}
                </a>
              </li>
              <li>
                <a href="/#pricing" className="hover:text-neutral-950 transition-colors">
                  {t.nav.pricing}
                </a>
              </li>
              <li>
                <Link to="/m/demo" className="hover:text-neutral-950 transition-colors">
                  {t.nav.demo}
                </Link>
              </li>
              <li>
                <a href="/#faq" className="hover:text-neutral-950 transition-colors">
                  {t.nav.faq}
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Direct Contact (using single source of truth from config) */}
          <div className="md:col-span-4 space-y-3">
            <h3 className="text-sm font-extrabold text-neutral-950">
              {t.footer.contactTitle}
            </h3>
            <ul className="space-y-2.5 text-sm text-neutral-600">
              <li>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 hover:text-neutral-950 transition-colors"
                >
                  <MessageCircle className="w-4 h-4 text-[#6BBF3A] shrink-0" />
                  <span dir="ltr">WhatsApp : {config.phoneDisplay}</span>
                </a>
              </li>
              <li>
                <a
                  href={`tel:+${config.whatsappNumber}`}
                  className="inline-flex items-center gap-2.5 hover:text-neutral-950 transition-colors"
                >
                  <Phone className="w-4 h-4 text-[#6BBF3A] shrink-0" />
                  <span dir="ltr">{config.phoneDisplay}</span>
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${config.email}`}
                  className="inline-flex items-center gap-2.5 hover:text-neutral-950 transition-colors"
                >
                  <Mail className="w-4 h-4 text-[#6BBF3A] shrink-0" />
                  <span>{config.email}</span>
                </a>
              </li>
              <li>
                <a
                  href={config.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 hover:text-neutral-950 transition-colors"
                >
                  <Instagram className="w-4 h-4 text-[#6BBF3A] shrink-0" />
                  <span dir="ltr">{config.instagramHandle}</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright & Made by WebAtlass */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-500">
          <p>
            © {currentYear} {config.brandName}. {t.footer.rights}
          </p>
          <p className="font-semibold text-neutral-600">
            {t.footer.madeBy}
          </p>
        </div>
      </div>
    </footer>
  );
};
