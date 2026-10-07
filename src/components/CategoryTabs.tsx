import React from 'react';
import { getLocalized, type Language, type MenuCategory } from '../menus';

export const CategoryTabs: React.FC<{
  categories: MenuCategory[];
  activeCategoryId: string;
  onSelectCategory: (categoryId: string) => void;
  lang: Language;
  primaryColor: string;
}> = ({ categories, activeCategoryId, onSelectCategory, lang, primaryColor }) => {
  return (
    <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-neutral-200/80 shadow-2xs">
      <div className="max-w-3xl mx-auto px-4 py-2.5 flex items-center gap-2 overflow-x-auto no-scrollbar">
        {categories.map((cat) => {
          const isActive = activeCategoryId === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-150 cursor-pointer shrink-0 ${
                isActive
                  ? 'text-white shadow-xs'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200/70 hover:text-neutral-900'
              }`}
              style={isActive ? { backgroundColor: primaryColor } : undefined}
            >
              {getLocalized(cat.name, lang)}
            </button>
          );
        })}
      </div>
    </div>
  );
};
