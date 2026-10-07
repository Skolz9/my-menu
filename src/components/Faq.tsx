import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, MessageCircle, ArrowUpRight } from 'lucide-react';
import { config, getWhatsAppUrl } from '../config';
import { useLanguage } from '../i18n/LanguageContext';

export const Faq: React.FC = () => {
  const { t } = useLanguage();
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  const whatsappUrl = getWhatsAppUrl(t.nav.whatsappDefaultMsg, config.whatsappNumber);

  const formatStatNumber = (val: number) => {
    if (val >= 1000) {
      return `${(val / 1000).toFixed(0)}K`;
    }
    return String(val);
  };

  return (
    <>
      {/* Animated Stats Strip */}
      <section className="py-14 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-2 mb-10">
            <p className="text-xs font-bold text-[#5aa630]">{t.stats.kicker}</p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 tracking-tight">
              {t.stats.title}
            </h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {config.stats.map((stat) => (
              <div
                key={stat.key}
                className="rounded-3xl border border-neutral-200/90 bg-neutral-50/50 p-6 text-center space-y-1.5"
              >
                <p
                  className="text-3xl sm:text-4xl font-extrabold text-neutral-950 tabular-nums tracking-tight"
                  dir="ltr"
                >
                  {stat.prefix}
                  {formatStatNumber(stat.value)}
                  {stat.suffix}
                </p>
                <p className="text-xs sm:text-sm font-semibold text-neutral-500">
                  {t.stats.items[stat.key]}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section id="faq" className="py-14 lg:py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-2 mb-10">
            <p className="text-xs font-bold text-[#5aa630]">{t.faq.kicker}</p>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-neutral-950 tracking-tight">
              {t.faq.title}
            </h2>
          </div>

          <div className="space-y-3">
            {t.faq.items.map((item, idx) => {
              const isOpen = openIdx === idx;
              return (
                <div
                  key={item.q}
                  className="rounded-2xl border border-neutral-200/90 bg-white overflow-hidden transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => setOpenIdx(isOpen ? null : idx)}
                    aria-expanded={isOpen}
                    className="w-full flex items-center justify-between gap-4 px-5 sm:px-6 py-4.5 text-start font-bold text-sm sm:text-base text-neutral-950 hover:bg-neutral-50/80 transition-colors cursor-pointer"
                  >
                    <span>{item.q}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-neutral-500 shrink-0 transition-transform duration-150 ${
                        isOpen ? 'rotate-180 text-[#6BBF3A]' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 sm:px-6 pb-5 pt-1 text-sm text-neutral-600 leading-relaxed border-t border-neutral-100">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Final Dark CTA Banner */}
      <section className="py-12 lg:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className="rounded-[32px] px-6 py-12 sm:p-14 text-center text-white space-y-6 relative overflow-hidden"
            style={{ backgroundColor: config.colors.darkSection }}
          >
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight max-w-2xl mx-auto text-balance">
              {t.finalCta.title}
            </h2>
            <p className="text-sm sm:text-base text-neutral-300 max-w-xl mx-auto leading-relaxed">
              {t.finalCta.subtitle}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-2xl text-sm sm:text-base font-bold text-neutral-950 shadow-md hover:opacity-95 transition-opacity whitespace-nowrap"
                style={{ backgroundColor: config.colors.primary }}
              >
                <MessageCircle className="w-5 h-5 shrink-0" />
                <span>{t.finalCta.primaryCta}</span>
              </a>
              <Link
                to="/m/demo"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl text-sm sm:text-base font-bold text-white bg-white/10 border border-white/15 hover:bg-white/15 transition-colors whitespace-nowrap"
              >
                <span>{t.finalCta.secondaryCta}</span>
                <ArrowUpRight className="w-4 h-4 shrink-0" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
