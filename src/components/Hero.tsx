import React from 'react';
import { Link } from 'react-router-dom';
import { Check, MessageCircle, ArrowUpRight, QrCode, Sparkles, Utensils } from 'lucide-react';
import { config, getWhatsAppUrl } from '../config';
import { useLanguage } from '../i18n/LanguageContext';
import { demoMenu, getLocalized } from '../menus';

const GeometricLogoIcon: React.FC<{ shape: string; color: string }> = ({ shape, color }) => {
  switch (shape) {
    case 'circle':
      return (
        <span
          className="w-7 h-7 rounded-full inline-flex items-center justify-center text-white text-xs font-bold shrink-0"
          style={{ backgroundColor: color }}
        >
          M
        </span>
      );
    case 'hexagon':
      return (
        <span
          className="w-7 h-7 rounded-lg rotate-12 inline-flex items-center justify-center text-white text-xs font-bold shrink-0"
          style={{ backgroundColor: color }}
        >
          Z
        </span>
      );
    case 'diamond':
      return (
        <span
          className="w-6 h-6 rounded-md rotate-45 inline-flex items-center justify-center text-white text-[10px] font-bold shrink-0"
          style={{ backgroundColor: color }}
        >
          <span className="-rotate-45">K</span>
        </span>
      );
    case 'arch':
      return (
        <span
          className="w-7 h-7 rounded-t-full rounded-b-md inline-flex items-center justify-center text-white text-xs font-bold shrink-0"
          style={{ backgroundColor: color }}
        >
          A
        </span>
      );
    case 'shield':
      return (
        <span
          className="w-7 h-7 rounded-t-md rounded-b-2xl inline-flex items-center justify-center text-white text-xs font-bold shrink-0"
          style={{ backgroundColor: color }}
        >
          B
        </span>
      );
    default:
      return (
        <span
          className="w-7 h-7 rounded-lg inline-flex items-center justify-center text-white text-xs font-bold shrink-0"
          style={{ backgroundColor: color }}
        >
          C
        </span>
      );
  }
};

export const Hero: React.FC = () => {
  const { t, lang } = useLanguage();
  const whatsappUrl = getWhatsAppUrl(t.nav.whatsappDefaultMsg, config.whatsappNumber);
  const previewItems = demoMenu.categories[0].items.slice(0, 3);

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#F4FAEF] via-white to-white pt-10 pb-14 lg:pt-16 lg:pb-20">
      {/* Subtle geometric background grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-35"
        style={{
          backgroundImage:
            'radial-gradient(#6BBF3A 0.75px, transparent 0.75px)',
          backgroundSize: '28px 28px',
        }}
        aria-hidden="true"
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
          {/* Text Column */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#3F7A1E] bg-[#6BBF3A]/12 border border-[#6BBF3A]/25 px-3.5 py-1.5 rounded-xl">
              <Sparkles className="w-4 h-4 shrink-0 text-[#5aa630]" />
              <span>{t.hero.badge}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-[52px] font-extrabold text-neutral-950 tracking-tight leading-[1.15] text-balance">
              {t.hero.headline}
            </h1>

            <p className="text-base sm:text-lg text-neutral-600 leading-relaxed max-w-2xl">
              {t.hero.subheadline}
            </p>

            {/* Primary & Secondary CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-2xl text-base font-bold text-white shadow-md hover:opacity-95 transition-opacity whitespace-nowrap"
                style={{ backgroundColor: config.colors.primary }}
              >
                <MessageCircle className="w-5 h-5 shrink-0" />
                <span>{t.hero.whatsappCta}</span>
              </a>

              <Link
                to="/m/demo"
                className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl text-base font-bold text-neutral-900 bg-white border border-neutral-300 hover:border-neutral-400 hover:bg-neutral-50 transition-colors whitespace-nowrap"
              >
                <span>{t.hero.demoCta}</span>
                <ArrowUpRight className="w-4.5 h-4.5 shrink-0" />
              </Link>
            </div>

            {/* 3 Trust Ticks */}
            <div className="pt-2 flex flex-wrap items-center gap-x-6 gap-y-2.5 text-sm font-semibold text-neutral-700">
              {t.hero.ticks.map((tick) => (
                <div key={tick} className="inline-flex items-center gap-2">
                  <span
                    className="w-5 h-5 rounded-full inline-flex items-center justify-center text-white shrink-0"
                    style={{ backgroundColor: config.colors.primary }}
                  >
                    <Check className="w-3 h-3 stroke-[3]" />
                  </span>
                  <span>{tick}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Visual Column: Barista Photo + Live Phone Mockup + Floating QR Card */}
          <div className="lg:col-span-5 relative flex justify-center">
            <div className="relative w-full max-w-md">
              {/* Decorative green backdrop card */}
              <div
                className="absolute -inset-3 rounded-[32px] opacity-15 blur-xl pointer-events-none"
                style={{ backgroundColor: config.colors.primary }}
                aria-hidden="true"
              />

              {/* Barista / Waiter Photo Accent Card */}
              <div className="relative rounded-3xl overflow-hidden border border-neutral-200 bg-neutral-900 shadow-xl">
                <div className="relative h-48 sm:h-52 overflow-hidden bg-neutral-800">
                  <img
                    src={config.images.heroBarista}
                    alt="Barista presenting QR digital menu in a cafe"
                    referrerPolicy="no-referrer"
                    fetchPriority="high"
                    className="w-full h-full object-cover object-center opacity-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/90 via-neutral-950/30 to-transparent" />
                  <div className="absolute bottom-3 inset-x-4 flex items-center justify-between text-white">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={demoMenu.logo}
                        alt={demoMenu.name}
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 rounded-xl object-cover border-2 border-white/80 bg-neutral-700"
                      />
                      <div>
                        <p className="text-sm font-extrabold leading-tight">{demoMenu.name}</p>
                        <p className="text-xs text-white/80">{demoMenu.city} • Maroc</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold bg-[#6BBF3A] text-white px-2.5 py-1 rounded-lg">
                      AR • FR • EN
                    </span>
                  </div>
                </div>

                {/* Phone Menu Preview Body */}
                <div className="bg-white p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-neutral-100 pb-2.5">
                    <span className="text-xs font-bold text-neutral-500">
                      {t.hero.phonePreviewBadge}
                    </span>
                    <Link
                      to="/m/demo"
                      className="text-xs font-bold text-[#5aa630] hover:underline inline-flex items-center gap-1"
                    >
                      <span>{t.hero.demoCta}</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  {/* Category Tabs Pill Preview */}
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                    {demoMenu.categories.map((cat, idx) => (
                      <span
                        key={cat.id}
                        className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap ${
                          idx === 0
                            ? 'text-white'
                            : 'bg-neutral-100 text-neutral-600'
                        }`}
                        style={idx === 0 ? { backgroundColor: config.colors.primary } : undefined}
                      >
                        {getLocalized(cat.name, lang)}
                      </span>
                    ))}
                  </div>

                  {/* Mini Items List */}
                  <div className="space-y-2">
                    {previewItems.map((item) => (
                      <Link
                        to="/m/demo"
                        key={item.id}
                        className="flex items-center justify-between gap-3 p-2 rounded-xl border border-neutral-200/70 hover:border-[#6BBF3A] transition-colors bg-neutral-50/50"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={getLocalized(item.name, lang)}
                              referrerPolicy="no-referrer"
                              loading="lazy"
                              className="w-11 h-11 rounded-lg object-cover shrink-0 bg-neutral-200"
                            />
                          ) : (
                            <div className="w-11 h-11 rounded-lg bg-neutral-200 flex items-center justify-center shrink-0">
                              <Utensils className="w-4 h-4 text-neutral-500" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-neutral-900 truncate">
                              {getLocalized(item.name, lang)}
                            </p>
                            <p className="text-[11px] text-neutral-500 truncate">
                              {getLocalized(item.description, lang)}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs font-extrabold text-neutral-950 tabular-nums whitespace-nowrap px-2 py-1 rounded-lg bg-white border border-neutral-200">
                          {item.price} MAD
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating QR Code Card */}
              <Link
                to="/m/demo"
                className="mt-4 sm:mt-0 sm:absolute sm:-bottom-6 sm:-left-6 bg-white rounded-2xl p-3.5 border border-neutral-200 shadow-lg flex items-center gap-3 hover:border-[#6BBF3A] transition-colors group"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition-transform"
                  style={{ backgroundColor: config.colors.primary }}
                >
                  <QrCode className="w-7 h-7" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-extrabold text-neutral-950">
                    {t.hero.qrCardTitle}
                  </p>
                  <p className="text-[11px] text-neutral-500">
                    {t.hero.qrCardSubtitle}
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Trusted-by strip with generic geometric cafe placeholders */}
        <div className="mt-16 lg:mt-20 pt-8 border-t border-neutral-200/80">
          <p className="text-center text-xs sm:text-sm font-semibold text-neutral-500 mb-6">
            {t.trustedBy.title}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {config.trustedByPlaceholders.map((partner) => (
              <div
                key={partner.id}
                className="flex items-center justify-center gap-2.5 px-4 py-3 rounded-2xl bg-neutral-50 border border-neutral-200/70 text-neutral-700"
              >
                <GeometricLogoIcon shape={partner.shape} color={partner.accent} />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-neutral-800 truncate">{partner.name}</p>
                  <p className="text-[10px] text-neutral-500 truncate">{partner.city}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
