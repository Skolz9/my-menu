import React, { useState } from 'react';
import { Plus, Minus, Utensils, Flame, Leaf, Sparkles } from 'lucide-react';
import { getLocalized, type Language, type MenuBadge, type MenuItem } from '../menus';
import { translations } from '../i18n/translations';

export const MenuItemCard: React.FC<{
  item: MenuItem;
  lang: Language;
  currency: string;
  primaryColor: string;
  quantity: number;
  onAdd: () => void;
  onRemove: () => void;
}> = ({ item, lang, currency, primaryColor, quantity, onAdd, onRemove }) => {
  const [imgError, setImgError] = useState(false);
  const t = translations[lang].menuPage;
  const isSoldOut = Boolean(item.badges?.includes('soldout'));

  const renderBadge = (badge: MenuBadge) => {
    switch (badge) {
      case 'new':
        return (
          <span
            key={badge}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100/90 px-2 py-0.5 rounded-md"
          >
            <Sparkles className="w-3 h-3" />
            <span>{t.badges.new}</span>
          </span>
        );
      case 'vegetarian':
        return (
          <span
            key={badge}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-md"
          >
            <Leaf className="w-3 h-3" />
            <span>{t.badges.vegetarian}</span>
          </span>
        );
      case 'spicy':
        return (
          <span
            key={badge}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-800 bg-rose-100/90 px-2 py-0.5 rounded-md"
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
      className={`rounded-2xl bg-white border border-neutral-200/85 p-3.5 sm:p-4 flex items-start justify-between gap-3.5 transition-all ${
        isSoldOut ? 'opacity-60 grayscale select-none bg-neutral-50' : 'hover:border-neutral-300 shadow-2xs'
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
          className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover shrink-0 bg-neutral-100 border border-neutral-200/60"
        />
      ) : (
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-neutral-100 border border-neutral-200/60 flex items-center justify-center shrink-0 text-neutral-400">
          <Utensils className="w-6 h-6" />
        </div>
      )}

      {/* Dish Info & Price */}
      <div className="flex-1 min-w-0 flex flex-col justify-between min-h-20 sm:min-h-24">
        <div className="space-y-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm sm:text-base font-extrabold text-neutral-950 leading-snug">
              {getLocalized(item.name, lang)}
            </h3>
          </div>

          {item.badges && item.badges.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              {item.badges.map((b) => renderBadge(b))}
            </div>
          )}

          <p className="text-xs sm:text-sm text-neutral-500 leading-relaxed line-clamp-2 pt-0.5">
            {getLocalized(item.description, lang)}
          </p>
        </div>

        {/* Bottom Row: Price in MAD + Optional Cart Controls */}
        <div className="pt-3 flex items-center justify-between gap-2">
          <span
            className="text-sm sm:text-base font-extrabold tabular-nums tracking-tight"
            style={{ color: isSoldOut ? '#737373' : primaryColor }}
          >
            {item.price} {currency}
          </span>

          {!isSoldOut && (
            <div className="flex items-center gap-1.5">
              {quantity > 0 ? (
                <div className="inline-flex items-center gap-2 bg-neutral-100 rounded-xl p-1 border border-neutral-200">
                  <button
                    type="button"
                    onClick={onRemove}
                    aria-label="Decrease quantity"
                    className="w-6 h-6 rounded-lg bg-white text-neutral-800 flex items-center justify-center shadow-2xs hover:bg-neutral-50 cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-xs font-extrabold text-neutral-950 tabular-nums px-1">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={onAdd}
                    aria-label="Increase quantity"
                    className="w-6 h-6 rounded-lg text-white flex items-center justify-center shadow-2xs cursor-pointer"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={onAdd}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-white shadow-2xs hover:opacity-95 transition-opacity cursor-pointer whitespace-nowrap"
                  style={{ backgroundColor: primaryColor }}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t.addToOrder}</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
};
