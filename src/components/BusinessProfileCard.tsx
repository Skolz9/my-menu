import React, { useState } from 'react';
import {
  Clock,
  MapPin,
  Phone,
  MessageCircle,
  Instagram,
  QrCode,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from 'lucide-react';
import {
  getLocalized,
  type ClientMenu,
  type DayOfWeek,
  type DailyHours,
  type Language,
} from '../menus';
import { getWhatsAppUrl } from '../config';
import { translations } from '../i18n/translations';
import { LanguageSwitcher } from './LanguageSwitcher';

const ORDERED_DAYS: DayOfWeek[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

export const BusinessProfileCard: React.FC<{
  menu: ClientMenu;
  lang: Language;
  onSelectLanguage: (lang: Language) => void;
  isOpen: boolean;
  todayKey: DayOfWeek;
  todayHours: DailyHours | null;
  simulateClosed: boolean;
  onToggleSimulateClosed: () => void;
  onOpenQrModal: () => void;
  lockedTableLabel?: string | null;
}> = ({
  menu,
  lang,
  onSelectLanguage,
  isOpen,
  todayKey,
  todayHours,
  simulateClosed,
  onToggleSimulateClosed,
  onOpenQrModal,
  lockedTableLabel,
}) => {
  const [showWeekly, setShowWeekly] = useState(false);
  const t = translations[lang].menuPage;

  const directWhatsappUrl = getWhatsAppUrl(
    `Salam ${menu.name}`,
    menu.contact.whatsapp
  );

  const tableWord = lang === 'ar' ? 'طاولة' : 'Table';

  return (
    <aside className="bg-white rounded-3xl border border-neutral-200/90 p-5 shadow-2xs space-y-4">
      {/* Top Bar: Language Switcher & QR Code Button */}
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-neutral-100">
        <LanguageSwitcher
          availableLanguages={menu.languages}
          activeLanguage={lang}
          onSelectLanguage={onSelectLanguage}
          accentColor={menu.colors.primary}
        />

        <div className="flex items-center gap-1.5 shrink-0">
          {lockedTableLabel && (
            <span
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-white text-xs font-extrabold shadow-2xs"
              style={{ backgroundColor: menu.colors.primary }}
            >
              <span>
                {tableWord} {lockedTableLabel}
              </span>
            </span>
          )}

          <button
            type="button"
            onClick={onOpenQrModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold transition-colors cursor-pointer shrink-0"
          >
            <QrCode className="w-3.5 h-3.5" style={{ color: menu.colors.primary }} />
            <span>{t.qrCodeBtn}</span>
          </button>
        </div>
      </div>

      {/* Business Logo, H1 Name, Tagline */}
      <div className="flex items-start gap-3.5">
        <img
          src={menu.logo}
          alt={menu.name}
          referrerPolicy="no-referrer"
          className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl object-cover border-2 border-neutral-200/80 shadow-2xs shrink-0 bg-neutral-100"
        />
        <div className="min-w-0 space-y-1">
          <h1 className="text-lg sm:text-xl font-extrabold text-neutral-950 tracking-tight leading-snug">
            {menu.name}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
            {getLocalized(menu.tagline, lang)}
          </p>
        </div>
      </div>

      {/* Live Open/Closed Status + Today's Hours */}
      <div className="rounded-2xl bg-neutral-50 border border-neutral-200/80 p-3.5 space-y-2.5">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="inline-flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                isOpen ? 'bg-emerald-500' : 'bg-rose-500'
              }`}
            />
            <span
              className={`text-xs font-extrabold ${
                isOpen ? 'text-emerald-700' : 'text-rose-700'
              }`}
            >
              {isOpen ? t.statusOpen : t.statusClosed}
            </span>
          </div>

          {todayHours && (
            <div className="inline-flex items-center gap-1.5 text-xs text-neutral-600 font-semibold">
              <Clock className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
              <span>{t.todayHoursLabel}</span>
              {todayHours.closed ? (
                <span className="font-bold text-rose-600">{t.closedDay}</span>
              ) : (
                <span dir="ltr" className="font-bold text-neutral-900 tabular-nums">
                  {todayHours.open} – {todayHours.close}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 pt-1 border-t border-neutral-200/60">
          <button
            type="button"
            onClick={() => setShowWeekly((prev) => !prev)}
            className="inline-flex items-center gap-1 text-xs font-bold text-neutral-600 hover:text-neutral-950 cursor-pointer"
          >
            <span>{t.weeklyHoursToggle}</span>
            {showWeekly ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>

          {/* Discreet toggle to preview Closed state behavior anytime */}
          <button
            type="button"
            onClick={onToggleSimulateClosed}
            className="text-[11px] font-semibold text-neutral-400 hover:text-neutral-700 underline cursor-pointer"
          >
            {simulateClosed ? t.simulateOpenBtn : t.simulateClosedBtn}
          </button>
        </div>

        {showWeekly && menu.weeklyHours && (
          <div className="pt-2 space-y-1.5 border-t border-neutral-200/60 text-xs">
            {ORDERED_DAYS.map((day) => {
              const dh = menu.weeklyHours[day];
              const isToday = day === todayKey;
              return (
                <div
                  key={day}
                  className={`flex items-center justify-between py-0.5 ${
                    isToday ? 'font-extrabold text-neutral-950' : 'text-neutral-600'
                  }`}
                >
                  <span>{t.days[day]}</span>
                  {dh?.closed ? (
                    <span className="text-rose-600 font-bold">{t.closedDay}</span>
                  ) : (
                    <span dir="ltr" className="tabular-nums">
                      {dh?.open} – {dh?.close}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* City & Google Maps Directions Link */}
      <div className="flex items-start justify-between gap-3 text-xs sm:text-sm text-neutral-700 px-1">
        <div className="flex items-start gap-2 min-w-0">
          <MapPin
            className="w-4 h-4 shrink-0 mt-0.5"
            style={{ color: menu.colors.primary }}
          />
          <div className="min-w-0">
            <span className="font-extrabold text-neutral-900">{menu.city}</span>
            <span className="text-neutral-400 mx-1.5">·</span>
            <span className="text-neutral-600">
              {getLocalized(menu.contact.address, lang)}
            </span>
          </div>
        </div>

        {menu.contact.mapsLink && (
          <a
            href={menu.contact.mapsLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-extrabold shrink-0 hover:underline"
            style={{ color: menu.colors.primary }}
          >
            <span>{t.directionsLink}</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>

      {/* Single Set of Contact Buttons: Call, WhatsApp, Instagram */}
      <div className="grid grid-cols-3 gap-2 pt-1">
        <a
          href={`tel:${menu.contact.phone.replace(/\s+/g, '')}`}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold text-neutral-900 bg-neutral-100 hover:bg-neutral-200 transition-colors whitespace-nowrap"
        >
          <Phone className="w-3.5 h-3.5 shrink-0" style={{ color: menu.colors.primary }} />
          <span>{t.callNow}</span>
        </a>

        <a
          href={directWhatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold text-white transition-opacity hover:opacity-95 whitespace-nowrap"
          style={{ backgroundColor: '#25D366' }}
        >
          <MessageCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{t.whatsappContact}</span>
        </a>

        {menu.contact.instagram && (
          <a
            href={menu.contact.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold text-neutral-900 bg-neutral-100 hover:bg-neutral-200 transition-colors whitespace-nowrap"
          >
            <Instagram className="w-3.5 h-3.5 shrink-0" style={{ color: menu.colors.primary }} />
            <span>{t.instagramFollow}</span>
          </a>
        )}
      </div>
    </aside>
  );
};
