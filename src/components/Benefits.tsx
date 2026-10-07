import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Zap, Camera, Languages, Check, ArrowUpRight } from 'lucide-react';
import { config } from '../config';
import { useLanguage } from '../i18n/LanguageContext';
import { demoMenu, getLocalized, type Language } from '../menus';

const SHOWCASE_COLORS = [
  '#6BBF3A',
  '#D97706',
  '#0EA5E9',
  '#E11D48',
  '#10B981',
];

export const Benefits: React.FC = () => {
  const { t, lang } = useLanguage();
  const [previewLang, setPreviewLang] = useState<Language>(lang);
  const [previewColor, setPreviewColor] = useState<string>(config.colors.primary);
  const [activeCategoryIdx, setActiveCategoryIdx] = useState<number>(0);

  const benefitIcons = [
    <Zap className="w-5 h-5 text-[#6BBF3A]" key="zap" />,
    <Camera className="w-5 h-5 text-[#6BBF3A]" key="cam" />,
    <Languages className="w-5 h-5 text-[#6BBF3A]" key="lang" />,
  ];

  const activeCategory = demoMenu.categories[activeCategoryIdx] || demoMenu.categories[0];

  return (
    <>
      {/* 3 Benefits Section */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center space-y-3 mb-12 lg:mb-16">
            <p className="text-xs sm:text-sm font-bold text-[#5aa630]">
              {t.benefits.kicker}
            </p>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-neutral-950 tracking-tight text-balance">
              {t.benefits.title}
            </h2>
            <p className="text-sm sm:text-base text-neutral-600 leading-relaxed">
              {t.benefits.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {t.benefits.cards.map((card, index) => (
              <div
                key={card.title}
                className="rounded-3xl border border-neutral-200/90 bg-neutral-50/40 p-7 sm:p-8 flex flex-col justify-between hover:border-[#6BBF3A]/60 transition-colors"
              >
                <div className="space-y-4">
                  <div className="w-11 h-11 rounded-2xl bg-[#6BBF3A]/12 flex items-center justify-center">
                    {benefitIcons[index]}
                  </div>
                  <h3 className="text-lg sm:text-xl font-extrabold text-neutral-950">
                    {card.title}
                  </h3>
                  <p className="text-sm text-neutral-600 leading-relaxed">
                    {card.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dark Section: "Voici ce que verra votre client" */}
      <section className="py-12 lg:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className="rounded-[32px] p-6 sm:p-10 lg:p-14 text-white overflow-hidden relative"
            style={{ backgroundColor: config.colors.darkSection }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
              {/* Explanation & 4 Green Ticks */}
              <div className="lg:col-span-6 space-y-6">
                <span className="inline-block text-xs font-bold text-[#6BBF3A] bg-[#6BBF3A]/15 px-3 py-1 rounded-lg">
                  {t.showcase.kicker}
                </span>

                <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white text-balance">
                  {t.showcase.title}
                </h2>

                <p className="text-sm sm:text-base text-neutral-300 leading-relaxed">
                  {t.showcase.subtitle}
                </p>

                <ul className="space-y-3.5 pt-2">
                  {t.showcase.ticks.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm sm:text-base text-neutral-200">
                      <span
                        className="w-5 h-5 rounded-full inline-flex items-center justify-center text-neutral-950 shrink-0 mt-0.5"
                        style={{ backgroundColor: config.colors.primary }}
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                {/* Interactive Category Quick-Switchers */}
                <div className="pt-2 space-y-2.5">
                  <p className="text-xs font-semibold text-neutral-400">
                    {t.showcase.sampleCafesTitle}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {demoMenu.categories.map((cat, idx) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setActiveCategoryIdx(idx)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer whitespace-nowrap ${
                          activeCategoryIdx === idx
                            ? 'bg-white text-neutral-950 border-white'
                            : 'bg-white/5 text-neutral-300 border-white/15 hover:bg-white/10'
                        }`}
                      >
                        {getLocalized(cat.name, previewLang)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-3">
                  <Link
                    to="/m/demo"
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-bold text-neutral-950 shadow-md hover:opacity-95 transition-opacity whitespace-nowrap"
                    style={{ backgroundColor: config.colors.primary }}
                  >
                    <span>{t.showcase.demoCta}</span>
                    <ArrowUpRight className="w-4 h-4 shrink-0" />
                  </Link>
                </div>
              </div>

              {/* Interactive Phone Mockup */}
              <div className="lg:col-span-6 flex flex-col items-center">
                <div
                  className="w-full max-w-md bg-white text-neutral-900 rounded-3xl p-4 sm:p-5 shadow-2xl border-4 border-neutral-800"
                  dir={previewLang === 'ar' ? 'rtl' : 'ltr'}
                >
                  {/* Top Bar inside Phone Mockup */}
                  <div className="flex items-center justify-between gap-2 pb-3 border-b border-neutral-100">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={demoMenu.logo}
                        alt={demoMenu.name}
                        referrerPolicy="no-referrer"
                        loading="lazy"
                        className="w-10 h-10 rounded-xl object-cover border border-neutral-200"
                      />
                      <div>
                        <p className="text-sm font-extrabold text-neutral-950">{demoMenu.name}</p>
                        <p className="text-[11px] text-neutral-500">{demoMenu.city}</p>
                      </div>
                    </div>

                    {/* Mini Language Switcher inside Phone */}
                    <div className="inline-flex items-center gap-1 bg-neutral-100 p-1 rounded-xl">
                      {(['ar', 'fr', 'en'] as Language[]).map((code) => (
                        <button
                          key={code}
                          type="button"
                          onClick={() => setPreviewLang(code)}
                          className={`px-2 py-0.5 text-[11px] font-bold rounded-lg cursor-pointer transition-colors ${
                            previewLang === code
                              ? 'text-white'
                              : 'text-neutral-600 hover:text-neutral-900'
                          }`}
                          style={previewLang === code ? { backgroundColor: previewColor } : undefined}
                        >
                          {code.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Category Tabs inside Phone */}
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-3">
                    {demoMenu.categories.map((cat, idx) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setActiveCategoryIdx(idx)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition-colors ${
                          activeCategoryIdx === idx
                            ? 'text-white'
                            : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                        }`}
                        style={activeCategoryIdx === idx ? { backgroundColor: previewColor } : undefined}
                      >
                        {getLocalized(cat.name, previewLang)}
                      </button>
                    ))}
                  </div>

                  {/* Items inside Phone */}
                  <div className="space-y-2.5 max-h-72 overflow-y-auto pr-0.5">
                    {activeCategory.items.slice(0, 3).map((item) => {
                      const isSoldOut = item.badges?.includes('soldout');
                      return (
                        <div
                          key={item.id}
                          className={`flex items-center justify-between gap-3 p-2.5 rounded-2xl border border-neutral-200/80 bg-neutral-50/60 ${
                            isSoldOut ? 'opacity-55 grayscale' : ''
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {item.image && (
                              <img
                                src={item.image}
                                alt={getLocalized(item.name, previewLang)}
                                referrerPolicy="no-referrer"
                                loading="lazy"
                                className="w-12 h-12 rounded-xl object-cover shrink-0 bg-neutral-200"
                              />
                            )}
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-neutral-900 truncate">
                                {getLocalized(item.name, previewLang)}
                              </p>
                              <p className="text-[11px] text-neutral-500 line-clamp-1">
                                {getLocalized(item.description, previewLang)}
                              </p>
                            </div>
                          </div>
                          <span
                            className="text-xs font-extrabold px-2.5 py-1 rounded-lg text-white tabular-nums shrink-0"
                            style={{ backgroundColor: previewColor }}
                          >
                            {item.price} MAD
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Interactive Brand Color Picker inside Phone Footer */}
                  <div className="mt-3 pt-3 border-t border-neutral-100 flex items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold text-neutral-500">
                      {t.showcase.colorLabel}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {SHOWCASE_COLORS.map((hex) => (
                        <button
                          key={hex}
                          type="button"
                          onClick={() => setPreviewColor(hex)}
                          aria-label={`Select color ${hex}`}
                          className={`w-5 h-5 rounded-full cursor-pointer transition-transform ${
                            previewColor === hex ? 'scale-125 ring-2 ring-offset-1 ring-neutral-900' : ''
                          }`}
                          style={{ backgroundColor: hex }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
