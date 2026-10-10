import React from 'react';
import { Flame, Search, X } from 'lucide-react';
import { getLocalized, type Language, type MenuCategory } from '../menus';
import { translations } from '../i18n/translations';

export const CategoryTabs: React.FC<{
  categories: MenuCategory[];
  hasPopularSection: boolean;
  activeCategoryId: string;
  onSelectCategory: (categoryId: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  lang: Language;
  primaryColor: string;
}> = ({
  categories,
  hasPopularSection,
  activeCategoryId,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  lang,
  primaryColor,
}) => {
  const t = translations[lang].menuPage;
  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  return (
    <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-neutral-200/90 shadow-2xs">
      <div className="px-4 pt-3 pb-2.5 space-y-2.5">
        {/* Search Box */}
        <div className="relative">
          <Search
            className={`w-4 h-4 text-neutral-400 pointer-events-none absolute top-1/2 -translate-y-1/2 ${
              dir === 'rtl' ? 'right-3.5' : 'left-3.5'
            }`}
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t.searchPlaceholder}
            style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
            className={`w-full rounded-xl bg-neutral-100 border border-neutral-200/90 py-2 text-xs sm:text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:bg-white focus:ring-2 transition-all ${
              dir === 'rtl' ? 'pr-9 pl-9' : 'pl-9 pr-9'
            }`}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              aria-label={t.clearSearch}
              className={`absolute top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-700 cursor-pointer ${
                dir === 'rtl' ? 'left-2.5' : 'right-2.5'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Horizontal Scrollable Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-0.5">
          {hasPopularSection && !searchQuery && (
            <button
              type="button"
              onClick={() => onSelectCategory('popular')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-150 cursor-pointer shrink-0 ${
                activeCategoryId === 'popular'
                  ? 'text-white shadow-xs'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200/70 hover:text-neutral-950'
              }`}
              style={
                activeCategoryId === 'popular'
                  ? { backgroundColor: primaryColor }
                  : undefined
              }
            >
              <Flame className="w-3.5 h-3.5 shrink-0" />
              <span>{t.mostPopularTitle}</span>
            </button>
          )}

          {categories.map((cat) => {
            const isActive = activeCategoryId === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onSelectCategory(cat.id)}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-150 cursor-pointer shrink-0 ${
                  isActive
                    ? 'text-white shadow-xs'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200/70 hover:text-neutral-950'
                }`}
                style={isActive ? { backgroundColor: primaryColor } : undefined}
              >
                {getLocalized(cat.name, lang)}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
