import React from 'react';
import { MessageCircle, Palette, QrCode } from 'lucide-react';
import { config, getWhatsAppUrl } from '../config';
import { useLanguage } from '../i18n/LanguageContext';

export const Steps: React.FC = () => {
  const { t } = useLanguage();
  const whatsappUrl = getWhatsAppUrl(t.nav.whatsappDefaultMsg, config.whatsappNumber);

  const stepIcons = [
    <MessageCircle className="w-6 h-6 text-[#6BBF3A]" key="s1" />,
    <Palette className="w-6 h-6 text-[#6BBF3A]" key="s2" />,
    <QrCode className="w-6 h-6 text-[#6BBF3A]" key="s3" />,
  ];

  return (
    <section id="how-it-works" className="py-16 lg:py-24 bg-[#F6FBF3]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center space-y-3 mb-14">
          <p className="text-xs sm:text-sm font-bold text-[#5aa630]">
            {t.steps.kicker}
          </p>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-neutral-950 tracking-tight text-balance">
            {t.steps.title}
          </h2>
          <p className="text-sm sm:text-base text-neutral-600 leading-relaxed">
            {t.steps.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {t.steps.items.map((step, idx) => (
            <div
              key={step.num}
              className="relative bg-white rounded-3xl p-7 sm:p-8 border border-neutral-200/80 shadow-xs flex flex-col items-center text-center"
            >
              <div className="relative mb-5">
                <div className="w-14 h-14 rounded-2xl bg-[#6BBF3A]/12 flex items-center justify-center">
                  {stepIcons[idx]}
                </div>
                <span className=" -top-2 -right-2 absolute w-6 h-6 rounded-full bg-neutral-950 text-white text-xs font-extrabold inline-flex items-center justify-center tabular-nums">
                  {step.num}
                </span>
              </div>

              <h3 className="text-lg font-extrabold text-neutral-950 mb-2.5">
                {step.title}
              </h3>

              <p className="text-sm text-neutral-600 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 px-7 py-4 rounded-2xl text-sm sm:text-base font-bold text-white shadow-md hover:opacity-95 transition-opacity whitespace-nowrap"
            style={{ backgroundColor: config.colors.primary }}
          >
            <MessageCircle className="w-5 h-5 shrink-0" />
            <span>{t.steps.cta}</span>
          </a>
        </div>
      </div>
    </section>
  );
};
