import React from 'react';
import { MessageCircle } from 'lucide-react';
import { config, getWhatsAppUrl } from '../config';
import { useLanguage } from '../i18n/LanguageContext';

export const FloatingWhatsApp: React.FC = () => {
  const { t, dir } = useLanguage();
  const whatsappUrl = getWhatsAppUrl(t.nav.whatsappDefaultMsg, config.whatsappNumber);

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t.nav.whatsappCta}
      className={`fixed bottom-5 ${
        dir === 'rtl' ? 'left-5' : 'right-5'
      } z-40 inline-flex items-center gap-2.5 px-4 py-3 rounded-full text-white font-bold text-sm shadow-lg hover:scale-105 active:scale-95 transition-transform duration-150`}
      style={{ backgroundColor: '#25D366' }}
    >
      <MessageCircle className="w-5 h-5 fill-current shrink-0" />
      <span className="hidden sm:inline whitespace-nowrap">WhatsApp</span>
    </a>
  );
};
