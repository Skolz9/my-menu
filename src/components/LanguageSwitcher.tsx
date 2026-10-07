import React from 'react';
import { Globe } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import type { Language } from '../menus/types';
import { config } from '../config';

const LANGUAGE_LABELS: Record<Language, { short: string; full: string }> = {
  ar: { short: 'AR', full: 'العربية' },
  fr: { short: 'FR', full: 'Français' },
  en: { short: 'EN', full: 'English' },
};

export const LanguageSwitcher: React.FC<{
  availableLanguages?: Language[];
  activeLanguage?: Language;
  onSelectLanguage?: (lang: Language) => void;
  accentColor?: string;
  variant?: 'light' | 'dark';
}> = ({
  availableLanguages = ['ar', 'fr', 'en'],
  activeLanguage,
  onSelectLanguage,
  accentColor = config.colors.primary,
  variant = 'light',
}) => {
  const { lang: contextLang, setLang: setContextLang } = useLanguage();
  const currentLang = activeLanguage ?? contextLang;
  const handleSelect = onSelectLanguage ?? setContextLang;

  const containerStyle =
    variant === 'dark'
      ? 'bg-white/10 border-white/15 text-white'
      : 'bg-neutral-100 border-neutral-200/80 text-neutral-700';

  return (
    <div
      className={`inline-flex items-center gap-0.5 p-1 rounded-xl border ${containerStyle}`}
      role="group"
      aria-label="Language switcher"
    >
      <Globe
        className={`w-3.5 h-3.5 mx-1.5 shrink-0 ${
          variant === 'dark' ? 'text-white/70' : 'text-neutral-500'
        }`}
        aria-hidden="true"
      />
      {availableLanguages.map((code) => {
        const isActive = currentLang === code;
        return (
          <button
            key={code}
            type="button"
            onClick={() => handleSelect(code)}
            className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all duration-150 cursor-pointer whitespace-nowrap ${
              isActive
                ? 'text-white shadow-xs'
                : variant === 'dark'
                ? 'text-white/75 hover:text-white hover:bg-white/10'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-white/60'
            }`}
            style={isActive ? { backgroundColor: accentColor } : undefined}
            aria-pressed={isActive}
            title={LANGUAGE_LABELS[code].full}
          >
            {LANGUAGE_LABELS[code].short}
          </button>
        );
      })}
    </div>
  );
};
