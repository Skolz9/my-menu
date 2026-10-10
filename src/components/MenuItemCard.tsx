import React, { useState } from 'react';
import { Plus, Minus, Utensils, Flame, Leaf, Sparkles, Star } from 'lucide-react';
import { getLocalized, type Language, type MenuBadge, type MenuItem } from '../menus';
import { translations } from '../i18n/translations';
import { PriceDisplay } from './PriceDisplay';

export const MenuItemCard: React.FC<{
  item: MenuItem;
  lang: Language;
  primaryColor: string;
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  onOpenDetail: () => void;
}> = ({
  item,
  lang,
  primaryColor,
  quantity,
  onIncrement,
  onDecrement,
  onOpenDetail,
}) => {
  const [imgError, setImgError] = useState(false);
  const t = translations[lang].menuPage;
  const isSoldOut = Boolean(item.badges?.includes('soldout'));

  // Combine explicit badges with popular flag if not already included
  const badgesList: MenuBadge[] = React.useMemo(() => {
    const set = new Set<MenuBadge>(item.badges || []);
    if (item.popular) {
      set.add('popular');
    }
    return Array.from(set);
  }, [item.badges, item.popular]);

  const renderBadge = (badge: MenuBadge) => {
    switch (badge) {
      case 'popular':
        return (
          <span
            key={badge}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-white px-2 py-0.5 rounded-md shadow-2xs"
            style={{ backgroundColor: primaryColor }}
          >
            <Star className="w-2.5 h-2.5 fill-current" />
            <span>{t.badges.popular}</span>
          </span>
        );
      case 'new':
        return (
          <span
            key={badge}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-md"
          >
            <Sparkles className="w-3 h-3" />
            <span>{t.badges.new}</span>
          </span>
        );
      case 'vegetarian':
        return (
          <span
            key={badge}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded-md"
          >
            <Leaf className="w-3 h-3" />
            <span>{t.badges.vegetarian}</span>
          </span>
        );
      case 'spicy':
        return (
          <span
            key={badge}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-900 bg-rose-100 px-2 py-0.5 rounded-md"
          >
            <Flame className="w-3 h-3" />
            <span>{t.badges.spicy}</span>
          </span>
        );
      case 'soldout':
        return (
          <span
            key={badge}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-neutral-700 bg-neutral-200 px-2 py-0.5 rounded-md"
          >
            <span>{t.badges.soldout}</span>
          </span>
        );
    }
  };

  return (
    <article
      onClick={() => {
        if (!isSoldOut) {
          onOpenDetail();
        }
      }}
      role={isSoldOut ? undefined : 'button'}
      tabIndex={isSoldOut ? -1 : 0}
      onKeyDown={(e) => {
        if (!isSoldOut && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onOpenDetail();
        }
      }}
      style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
      className={`rounded-2xl bg-white border border-neutral-200/90 p-3.5 sm:p-4 flex items-start justify-between gap-3.5 transition-all focus:outline-none focus-visible:ring-2 ${
        isSoldOut
          ? 'opacity-60 grayscale select-none bg-neutral-50 cursor-not-allowed'
          : 'hover:border-neutral-300 shadow-2xs cursor-pointer'
      }`}
    >
      {/* Dish Photo */}
      {item.image && !imgError ? (
        <img
          src={item.image}
          alt={getLocalized(item.name, lang)}
          referrerPolicy="no-referrer"
          loading="lazy"
          onError={() => setImgError(true)}
          className="w-22 h-22 sm:w-24 sm:h-24 rounded-xl object-cover shrink-0 bg-neutral-100 border border-neutral-200/60"
        />
      ) : (
        <div className="w-22 h-22 sm:w-24 sm:h-24 rounded-xl bg-neutral-100 border border-neutral-200/60 flex items-center justify-center shrink-0 text-neutral-400">
          <Utensils className="w-6 h-6" />
        </div>
      )}

      {/* Dish Info, Price & Direct Stepper */}
      <div className="flex-1 min-w-0 flex flex-col justify-between min-h-22 sm:min-h-24">
        <div className="space-y-1">
          {/* Full Product Name: wraps up to 2 lines, never single-line truncated */}
          <h3 className="text-sm sm:text-base font-extrabold text-neutral-950 leading-snug line-clamp-2">
            {getLocalized(item.name, lang)}
          </h3>

          {badgesList.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              {badgesList.map((b) => renderBadge(b))}
            </div>
          )}

          {/* 2-line Description */}
          <p className="text-xs sm:text-sm text-neutral-500 leading-relaxed line-clamp-2 pt-0.5">
            {getLocalized(item.description, lang)}
          </p>
        </div>

        {/* Bottom Row: Price + Direct Quantity Stepper (- 1 +) */}
        <div className="pt-3 flex items-center justify-between gap-2">
          <PriceDisplay
            amount={item.price}
            lang={lang}
            className="text-sm sm:text-base font-extrabold"
            style={{ color: isSoldOut ? '#737373' : primaryColor }}
          />

          {!isSoldOut && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1.5 bg-neutral-100 rounded-xl p-1 border border-neutral-200/90"
            >
              <button
                type="button"
                onClick={onDecrement}
                disabled={quantity === 0}
                aria-label="Decrease quantity"
                className="w-7 h-7 rounded-lg bg-white text-neutral-800 flex items-center justify-center shadow-2xs hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-opacity"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>

              <span
                dir="ltr"
                className="min-w-[20px] text-center text-xs sm:text-sm font-extrabold text-neutral-950 tabular-nums"
              >
                {quantity}
              </span>

              <button
                type="button"
                onClick={onIncrement}
                aria-label="Increase quantity"
                className="w-7 h-7 rounded-lg text-white flex items-center justify-center shadow-2xs hover:opacity-95 cursor-pointer transition-opacity"
                style={{ backgroundColor: primaryColor }}
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
};
