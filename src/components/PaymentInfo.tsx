import React, { useState } from 'react';
import {
  Landmark,
  Banknote,
  Building2,
  Smartphone,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  ShieldCheck,
} from 'lucide-react';
import { config, type PaymentMethodId } from '../config';
import { useLanguage } from '../i18n/LanguageContext';

export const PaymentInfo: React.FC = () => {
  const { t } = useLanguage();
  const [showDetails, setShowDetails] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyRib = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(config.payment.rib);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const renderMethodIcon = (method: PaymentMethodId) => {
    switch (method) {
      case 'virement':
        return <Landmark className="w-5 h-5 text-[#6BBF3A]" />;
      case 'especes':
        return <Banknote className="w-5 h-5 text-[#6BBF3A]" />;
      case 'cih_pay_wafacash_cashplus':
        return <Building2 className="w-5 h-5 text-[#6BBF3A]" />;
      case 'mobile_wallet':
        return <Smartphone className="w-5 h-5 text-[#6BBF3A]" />;
    }
  };

  return (
    <section className="py-14 lg:py-20 bg-neutral-50 border-y border-neutral-200/80">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center space-y-3 mb-10">
          <p className="text-xs sm:text-sm font-bold text-[#5aa630]">
            {t.payment.kicker}
          </p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 tracking-tight">
            {t.payment.title}
          </h2>
          <div className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-[#6BBF3A]/12 border border-[#6BBF3A]/25 text-xs sm:text-sm font-bold text-neutral-800">
            <ShieldCheck className="w-5 h-5 text-[#5aa630] shrink-0" />
            <span>{t.payment.banner}</span>
          </div>
        </div>

        {/* 4 Payment Method Icon Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {config.payment.methods.map((methodKey) => {
            const info = t.payment.methods[methodKey];
            return (
              <div
                key={methodKey}
                className="bg-white rounded-2xl p-5 border border-neutral-200/90 flex flex-col justify-between space-y-3"
              >
                <div className="w-10 h-10 rounded-xl bg-[#6BBF3A]/12 flex items-center justify-center">
                  {renderMethodIcon(methodKey)}
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-extrabold text-neutral-950">
                    {info.title}
                  </h3>
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    {info.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Collapsible Bank Details (RIB & Holder from config) */}
        <div className="mt-8 max-w-xl mx-auto">
          <button
            type="button"
            onClick={() => setShowDetails((prev) => !prev)}
            aria-expanded={showDetails}
            className="w-full flex items-center justify-between px-5 py-3.5 rounded-2xl bg-white border border-neutral-300 hover:border-[#6BBF3A] text-sm font-bold text-neutral-900 transition-colors cursor-pointer"
          >
            <span>
              {showDetails ? t.payment.toggleHideDetails : t.payment.toggleShowDetails}
            </span>
            {showDetails ? (
              <ChevronUp className="w-4 h-4 text-neutral-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-neutral-500" />
            )}
          </button>

          {showDetails && (
            <div className="mt-3 rounded-2xl bg-white border border-neutral-200 p-5 space-y-4 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-neutral-100">
                <div>
                  <span className="text-xs text-neutral-500 block">
                    {t.payment.ribLabel}
                  </span>
                  <span className="text-sm font-mono font-bold text-neutral-950 tabular-nums">
                    {config.payment.rib}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyRib}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-xs font-bold text-neutral-800 cursor-pointer self-start sm:self-auto"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#5aa630]" />
                      <span>{t.payment.copiedRib}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>{t.payment.copyRib}</span>
                    </>
                  )}
                </button>
              </div>

              <div>
                <span className="text-xs text-neutral-500 block">
                  {t.payment.holderLabel}
                </span>
                <span className="text-sm font-bold text-neutral-950">
                  {config.payment.holder}
                </span>
              </div>

              <p className="text-xs text-neutral-500 pt-1">
                {t.payment.paymentHelpNote}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
