import React, { useState } from 'react';
import { Check, MessageCircle, Sparkles } from 'lucide-react';
import { config, getWhatsAppUrl } from '../config';
import { useLanguage } from '../i18n/LanguageContext';

export const Pricing: React.FC = () => {
  const { t } = useLanguage();
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('yearly');

  const isYearly = billingPeriod === 'yearly';
  const displayedPrice = isYearly ? config.pricing.yearlyPrice : config.pricing.monthlyPrice;
  const periodLabel = isYearly ? t.pricing.perYear : t.pricing.perMonth;

  const whatsappMessage = isYearly
    ? t.pricing.whatsappOrderYearly
    : t.pricing.whatsappOrderMonthly;

  const orderWhatsappUrl = getWhatsAppUrl(whatsappMessage, config.whatsappNumber);

  return (
    <section id="pricing" className="py-16 lg:py-24 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-10">
          <p className="text-xs sm:text-sm font-bold text-[#5aa630]">
            {t.pricing.kicker}
          </p>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-neutral-950 tracking-tight text-balance">
            {t.pricing.title}
          </h2>
          <p className="text-sm sm:text-base text-neutral-600 max-w-xl mx-auto">
            {t.pricing.subtitle}
          </p>

          {/* Monthly / Yearly Segmented Toggle */}
          <div className="pt-4 flex justify-center">
            <div
              className="inline-flex items-center p-1.5 rounded-2xl bg-neutral-100 border border-neutral-200/80"
              role="group"
              aria-label="Billing Period"
            >
              <button
                type="button"
                onClick={() => setBillingPeriod('monthly')}
                className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                  !isYearly
                    ? 'bg-white text-neutral-950 shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-950'
                }`}
              >
                {t.pricing.monthlyLabel}
              </button>

              <button
                type="button"
                onClick={() => setBillingPeriod('yearly')}
                className={`inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isYearly
                    ? 'bg-white text-neutral-950 shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-950'
                }`}
              >
                <span>{t.pricing.yearlyLabel}</span>
                <span
                  className="px-2 py-0.5 rounded-lg text-[11px] font-extrabold text-white"
                  style={{ backgroundColor: config.colors.primary }}
                >
                  {t.pricing.discountBadge}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Single Plan Card: Pack Menu QR */}
        <div className="rounded-[32px] border-2 border-[#6BBF3A] bg-white p-6 sm:p-10 shadow-xl relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            {/* Left / Top: Plan Header, Price, Setup Fee, CTA */}
            <div className="lg:col-span-5 space-y-5 border-b lg:border-b-0 lg:border-e border-neutral-200/80 pb-7 lg:pb-0 lg:pe-8">
              <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#3F7A1E] bg-[#6BBF3A]/15 px-3 py-1 rounded-lg">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{t.pricing.planName}</span>
              </div>

              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                {t.pricing.planTagline}
              </p>

              <div className="pt-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl sm:text-5xl font-extrabold text-neutral-950 tabular-nums tracking-tight">
                    {displayedPrice}
                  </span>
                  <span className="text-base font-bold text-neutral-600">
                    {periodLabel}
                  </span>
                </div>
                {isYearly && (
                  <p className="text-xs font-semibold text-[#5aa630] mt-1">
                    {t.pricing.equivalentMonthly}
                  </p>
                )}
              </div>

              {/* Setup Fee Box */}
              <div className="rounded-2xl bg-neutral-50 border border-neutral-200/80 p-3.5 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-neutral-700">
                    {t.pricing.setupFeeTitle}
                  </span>
                  <span className="text-xs font-extrabold text-neutral-950 tabular-nums whitespace-nowrap">
                    {t.pricing.setupFeeValue}
                  </span>
                </div>
                <p className="text-[11px] text-neutral-500 leading-snug">
                  {t.pricing.setupFeeNote}
                </p>
              </div>

              <a
                href={orderWhatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl text-sm sm:text-base font-bold text-white shadow-md hover:opacity-95 transition-opacity whitespace-nowrap"
                style={{ backgroundColor: config.colors.primary }}
              >
                <MessageCircle className="w-5 h-5 shrink-0" />
                <span>{t.pricing.ctaButton}</span>
              </a>
            </div>

            {/* Right / Bottom: Feature Checklist */}
            <div className="lg:col-span-7">
              <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3.5">
                {t.pricing.features.map((feat) => (
                  <li key={feat} className="flex items-start gap-3 text-sm text-neutral-700 font-medium">
                    <span
                      className="w-5 h-5 rounded-full inline-flex items-center justify-center text-white shrink-0 mt-0.5"
                      style={{ backgroundColor: config.colors.primary }}
                    >
                      <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
