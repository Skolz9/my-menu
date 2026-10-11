import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  Edit3,
  Upload,
  Check,
  Flame,
  Sparkles,
  Percent,
  Clock,
  Truck,
  Palette,
  BarChart3,
  Settings,
  Utensils,
  X,
} from 'lucide-react';
import {
  getLocalized,
  type ClientMenu,
  type DayOfWeek,
  type DeliveryZone,
  type Language,
  type MenuBadge,
  type MenuCategory,
  type MenuItem,
  type MenuItemOptionGroup,
} from '../menus';
import { PriceDisplay } from './PriceDisplay';
import { uploadMenuImage } from '../lib/supabase';
import type { MenuEventRecord, OrderRecord } from '../lib/store';

const DAYS_LIST: DayOfWeek[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

const DAY_NAMES: Record<Language, Record<DayOfWeek, string>> = {
  ar: {
    monday: 'الإثنين',
    tuesday: 'الثلاثاء',
    wednesday: 'الأربعاء',
    thursday: 'الخميس',
    friday: 'الجمعة',
    saturday: 'السبت',
    sunday: 'الأحد',
  },
  fr: {
    monday: 'Lundi',
    tuesday: 'Mardi',
    wednesday: 'Mercredi',
    thursday: 'Jeudi',
    friday: 'Vendredi',
    saturday: 'Samedi',
    sunday: 'Dimanche',
  },
  en: {
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday',
  },
};

const COLOR_PRESETS = [
  { name: 'My Menu Green', primary: '#6BBF3A', accent: '#18181B', background: '#FAF8F5' },
  { name: 'Terracotta Agadir', primary: '#C25E28', accent: '#18181B', background: '#FAF8F5' },
  { name: 'Émeraude Médina', primary: '#059669', accent: '#18181B', background: '#F7FAF8' },
  { name: 'Bleu Majorelle', primary: '#1D4ED8', accent: '#0F172A', background: '#F8FAFC' },
  { name: 'Safran d’Or', primary: '#D97706', accent: '#1C1917', background: '#FFFBEB' },
  { name: 'Noir Ébène', primary: '#18181B', accent: '#27272A', background: '#FAFAFA' },
];

// ============================================================================
// 1. PRODUCTS TAB (Categories & Items CRUD, 3 Languages, Image Compression,
//    Options, Popular, Upsell, Big Sold Out Switch, Bulk Price Change)
// ============================================================================

export const ProductsTabPanel: React.FC<{
  menu: ClientMenu;
  lang: Language;
  onSaveMenu: (updater: (cur: ClientMenu) => ClientMenu) => Promise<void>;
}> = ({ menu, lang, onSaveMenu }) => {
  const [selectedCatId, setSelectedCatId] = useState<string>(
    menu.categories[0]?.id || ''
  );
  const [newCatOpen, setNewCatOpen] = useState(false);
  const [catNameAr, setCatNameAr] = useState('');
  const [catNameFr, setCatNameFr] = useState('');
  const [catNameEn, setCatNameEn] = useState('');

  // Bulk price state
  const [bulkMode, setBulkMode] = useState<'percent' | 'fixed'>('percent');
  const [bulkValue, setBulkValue] = useState<string>('10');
  const [bulkScope, setBulkScope] = useState<string>('all');
  const [bulkSuccess, setBulkSuccess] = useState(false);

  // Item modal state
  const [editingItem, setEditingItem] = useState<{
    categoryId: string;
    item: MenuItem;
    isNew: boolean;
    isUpsell: boolean;
  } | null>(null);
  const [uploadingImg, setUploadingImg] = useState(false);

  const primaryColor = menu.colors.primary || '#6BBF3A';
  const upsellSet = new Set(menu.upsellItemIds || []);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catNameFr.trim() && !catNameAr.trim() && !catNameEn.trim()) return;
    const newId = `cat-${Date.now()}`;
    const newCat: MenuCategory = {
      id: newId,
      name: {
        ar: catNameAr.trim() || catNameFr.trim() || catNameEn.trim(),
        fr: catNameFr.trim() || catNameAr.trim() || catNameEn.trim(),
        en: catNameEn.trim() || catNameFr.trim() || catNameAr.trim(),
      },
      items: [],
    };
    await onSaveMenu((cur) => ({
      ...cur,
      categories: [...cur.categories, newCat],
    }));
    setSelectedCatId(newId);
    setCatNameAr('');
    setCatNameFr('');
    setCatNameEn('');
    setNewCatOpen(false);
  };

  const handleDeleteCategory = async (catId: string) => {
    await onSaveMenu((cur) => ({
      ...cur,
      categories: cur.categories.filter((c) => c.id !== catId),
    }));
    if (selectedCatId === catId) {
      setSelectedCatId(menu.categories.find((c) => c.id !== catId)?.id || '');
    }
  };

  // Big 1-tap Sold Out switch
  const handleToggleSoldOut = async (catId: string, itemId: string) => {
    await onSaveMenu((cur) => ({
      ...cur,
      categories: cur.categories.map((cat) => {
        if (cat.id !== catId) return cat;
        return {
          ...cat,
          items: cat.items.map((it) => {
            if (it.id !== itemId) return it;
            const badges = new Set<MenuBadge>(it.badges || []);
            if (badges.has('soldout')) {
              badges.delete('soldout');
            } else {
              badges.add('soldout');
            }
            return { ...it, badges: Array.from(badges) };
          }),
        };
      }),
    }));
  };

  const handleTogglePopular = async (catId: string, itemId: string) => {
    await onSaveMenu((cur) => ({
      ...cur,
      categories: cur.categories.map((cat) => {
        if (cat.id !== catId) return cat;
        return {
          ...cat,
          items: cat.items.map((it) => {
            if (it.id !== itemId) return it;
            const nextPop = !it.popular;
            const badges = new Set<MenuBadge>(it.badges || []);
            if (nextPop) badges.add('popular');
            else badges.delete('popular');
            return { ...it, popular: nextPop, badges: Array.from(badges) };
          }),
        };
      }),
    }));
  };

  const handleToggleUpsell = async (itemId: string) => {
    await onSaveMenu((cur) => {
      const currentIds = new Set(cur.upsellItemIds || []);
      if (currentIds.has(itemId)) currentIds.delete(itemId);
      else currentIds.add(itemId);
      return { ...cur, upsellItemIds: Array.from(currentIds) };
    });
  };

  const handleDeleteItem = async (catId: string, itemId: string) => {
    await onSaveMenu((cur) => ({
      ...cur,
      upsellItemIds: (cur.upsellItemIds || []).filter((id) => id !== itemId),
      categories: cur.categories.map((c) =>
        c.id === catId
          ? { ...c, items: c.items.filter((i) => i.id !== itemId) }
          : c
      ),
    }));
  };

  const handleBulkPriceChange = async (direction: 1 | -1) => {
    const num = Number(bulkValue);
    if (!Number.isFinite(num) || num <= 0) return;

    await onSaveMenu((cur) => ({
      ...cur,
      categories: cur.categories.map((cat) => {
        if (bulkScope !== 'all' && cat.id !== bulkScope) return cat;
        return {
          ...cat,
          items: cat.items.map((it) => {
            let nextPrice = it.price;
            if (bulkMode === 'percent') {
              nextPrice = Math.round(it.price * (1 + (direction * num) / 100));
            } else {
              nextPrice = Math.round(it.price + direction * num);
            }
            return { ...it, price: Math.max(1, nextPrice) };
          }),
        };
      }),
    }));

    setBulkSuccess(true);
    setTimeout(() => setBulkSuccess(false), 2000);
  };

  const openNewItemModal = (catId: string) => {
    const targetCat = catId || menu.categories[0]?.id || '';
    if (!targetCat) return;
    setEditingItem({
      categoryId: targetCat,
      isNew: true,
      isUpsell: false,
      item: {
        id: `item-${Date.now()}`,
        name: { ar: '', fr: '', en: '' },
        description: { ar: '', fr: '', en: '' },
        price: 25,
        image: '',
        popular: false,
        badges: [],
        options: [],
      },
    });
  };

  const handleSaveItemModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    const { categoryId, item, isNew, isUpsell } = editingItem;
    const fallbackName =
      item.name.fr.trim() || item.name.ar.trim() || item.name.en.trim() || 'Article';

    const cleanItem: MenuItem = {
      ...item,
      name: {
        ar: item.name.ar.trim() || fallbackName,
        fr: item.name.fr.trim() || fallbackName,
        en: item.name.en.trim() || fallbackName,
      },
      description: {
        ar: item.description.ar.trim(),
        fr: item.description.fr.trim(),
        en: item.description.en.trim(),
      },
      price: Math.max(0, Number(item.price) || 0),
    };

    await onSaveMenu((cur) => {
      const nextUpsell = new Set(cur.upsellItemIds || []);
      if (isUpsell) nextUpsell.add(cleanItem.id);
      else nextUpsell.delete(cleanItem.id);

      return {
        ...cur,
        upsellItemIds: Array.from(nextUpsell),
        categories: cur.categories.map((cat) => {
          if (cat.id !== categoryId) {
            return {
              ...cat,
              items: cat.items.filter((i) => i.id !== cleanItem.id),
            };
          }
          const exists = cat.items.some((i) => i.id === cleanItem.id);
          return {
            ...cat,
            items: isNew && !exists
              ? [...cat.items, cleanItem]
              : cat.items.map((i) => (i.id === cleanItem.id ? cleanItem : i)),
          };
        }),
      };
    });

    setEditingItem(null);
  };

  const handleUploadItemPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingItem) return;
    setUploadingImg(true);
    try {
      const url = await uploadMenuImage(menu.id || menu.slug, file);
      setEditingItem((prev) =>
        prev ? { ...prev, item: { ...prev.item, image: url } } : null
      );
    } catch {
      // Ignore error
    } finally {
      setUploadingImg(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Bulk Price Change Bar */}
      <div className="rounded-3xl bg-white border border-neutral-200/90 p-5 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-0.5">
          <div className="inline-flex items-center gap-2">
            <Percent className="w-4 h-4" style={{ color: primaryColor }} />
            <h3 className="text-sm font-extrabold text-neutral-950">
              {lang === 'ar'
                ? 'تعديل جماعي للأسعار'
                : lang === 'fr'
                ? 'Modification groupée des prix'
                : 'Bulk Price Adjustment'}
            </h3>
          </div>
          <p className="text-xs text-neutral-500">
            {lang === 'ar'
              ? 'ارفع أو خفض أسعار جميع الأصناف أو قسم معين بضغطة واحدة.'
              : lang === 'fr'
              ? 'Augmentez ou réduisez tous vos prix en MAD ou en % en un clic.'
              : 'Increase or decrease item prices by % or fixed MAD in one click.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={bulkScope}
            onChange={(e) => setBulkScope(e.target.value)}
            className="rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs font-bold text-neutral-800"
          >
            <option value="all">
              {lang === 'ar' ? 'جميع الأقسام' : 'Toutes les catégories'}
            </option>
            {menu.categories.map((c) => (
              <option key={c.id} value={c.id}>
                {getLocalized(c.name, lang)}
              </option>
            ))}
          </select>

          <select
            value={bulkMode}
            onChange={(e) => setBulkMode(e.target.value as 'percent' | 'fixed')}
            className="rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs font-bold text-neutral-800"
          >
            <option value="percent">% (Pourcentage)</option>
            <option value="fixed">MAD (Montant fixe)</option>
          </select>

          <input
            type="number"
            min={1}
            max={200}
            dir="ltr"
            value={bulkValue}
            onChange={(e) => setBulkValue(e.target.value)}
            className="w-20 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs font-extrabold text-neutral-900 text-center"
          />

          <button
            type="button"
            onClick={() => handleBulkPriceChange(1)}
            className="px-3.5 py-2 rounded-xl text-xs font-extrabold text-white cursor-pointer"
            style={{ backgroundColor: primaryColor }}
          >
            + {bulkValue} {bulkMode === 'percent' ? '%' : 'MAD'}
          </button>

          <button
            type="button"
            onClick={() => handleBulkPriceChange(-1)}
            className="px-3.5 py-2 rounded-xl text-xs font-extrabold text-neutral-800 bg-neutral-100 hover:bg-neutral-200 cursor-pointer"
          >
            - {bulkValue} {bulkMode === 'percent' ? '%' : 'MAD'}
          </button>

          {bulkSuccess && (
            <span className="inline-flex items-center gap-1 text-xs font-extrabold text-emerald-700">
              <Check className="w-4 h-4" />
              <span>OK</span>
            </span>
          )}
        </div>
      </div>

      {/* Categories Strip + Add Category / Add Product */}
      <div className="rounded-3xl bg-white border border-neutral-200/90 p-5 shadow-2xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {menu.categories.map((cat) => {
              const active = cat.id === selectedCatId;
              return (
                <div
                  key={cat.id}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-colors ${
                    active
                      ? 'text-white shadow-2xs'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  }`}
                  style={active ? { backgroundColor: primaryColor } : undefined}
                >
                  <button
                    type="button"
                    onClick={() => setSelectedCatId(cat.id)}
                    className="cursor-pointer"
                  >
                    {getLocalized(cat.name, lang)} ({cat.items.length})
                  </button>
                  {menu.categories.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleDeleteCategory(cat.id)}
                      className="opacity-70 hover:opacity-100 cursor-pointer"
                      title="Supprimer catégorie"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}

            <button
              type="button"
              onClick={() => setNewCatOpen((p) => !p)}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-dashed border-neutral-300 text-xs font-bold text-neutral-700 hover:bg-neutral-50 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>
                {lang === 'ar' ? 'قسم جديد' : '+ Catégorie'}
              </span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => openNewItemModal(selectedCatId)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-extrabold text-white shadow-xs cursor-pointer"
            style={{ backgroundColor: primaryColor }}
          >
            <Plus className="w-4 h-4" />
            <span>
              {lang === 'ar'
                ? 'إضافة صنف جديد'
                : lang === 'fr'
                ? 'Nouvel article'
                : 'Add Item'}
            </span>
          </button>
        </div>

        {/* Add Category Form */}
        {newCatOpen && (
          <form
            onSubmit={handleAddCategory}
            className="rounded-2xl bg-neutral-50 border border-neutral-200 p-4 grid grid-cols-1 sm:grid-cols-4 gap-3 items-end"
          >
            <div>
              <label className="block text-[11px] font-bold text-neutral-600 mb-1">
                Nom (FR)
              </label>
              <input
                type="text"
                value={catNameFr}
                onChange={(e) => setCatNameFr(e.target.value)}
                placeholder="Ex: Burgers & Tacos"
                className="w-full rounded-xl bg-white border border-neutral-200 px-3 py-2 text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-neutral-600 mb-1">
                الاسم (AR)
              </label>
              <input
                type="text"
                dir="rtl"
                value={catNameAr}
                onChange={(e) => setCatNameAr(e.target.value)}
                placeholder="مثال: برغر وطاكوس"
                className="w-full rounded-xl bg-white border border-neutral-200 px-3 py-2 text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-neutral-600 mb-1">
                Name (EN)
              </label>
              <input
                type="text"
                value={catNameEn}
                onChange={(e) => setCatNameEn(e.target.value)}
                placeholder="e.g. Burgers & Tacos"
                className="w-full rounded-xl bg-white border border-neutral-200 px-3 py-2 text-xs"
              />
            </div>
            <button
              type="submit"
              className="py-2 px-4 rounded-xl text-xs font-extrabold text-white cursor-pointer"
              style={{ backgroundColor: primaryColor }}
            >
              {lang === 'ar' ? 'حفظ القسم' : 'Créer la catégorie'}
            </button>
          </form>
        )}

        {/* Items List for Selected Category */}
        <div className="space-y-3 pt-2">
          {(
            menu.categories.find((c) => c.id === selectedCatId) ||
            menu.categories[0]
          )?.items.map((item) => {
            const catId =
              menu.categories.find((c) => c.id === selectedCatId)?.id ||
              menu.categories[0].id;
            const isSoldOut = Boolean(item.badges?.includes('soldout'));
            const isPopular = Boolean(item.popular || item.badges?.includes('popular'));
            const isUpsell = upsellSet.has(item.id);

            return (
              <div
                key={item.id}
                className={`rounded-2xl border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                  isSoldOut
                    ? 'bg-neutral-100/80 border-neutral-200 opacity-75'
                    : 'bg-white border-neutral-200/90'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={getLocalized(item.name, lang)}
                      referrerPolicy="no-referrer"
                      className="w-16 h-16 rounded-2xl object-cover bg-neutral-100 shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-400 shrink-0">
                      <Utensils className="w-6 h-6" />
                    </div>
                  )}

                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-extrabold text-neutral-950">
                        {getLocalized(item.name, lang)}
                      </h4>
                      <PriceDisplay
                        amount={item.price}
                        lang={lang}
                        className="text-xs font-extrabold px-2 py-0.5 rounded-lg bg-neutral-100 text-neutral-900"
                      />
                    </div>
                    <p className="text-xs text-neutral-500 line-clamp-1">
                      {getLocalized(item.description, lang)}
                    </p>

                    {/* Quick Flags: Popular & Upsell */}
                    <div className="flex flex-wrap items-center gap-2 pt-0.5">
                      <button
                        type="button"
                        onClick={() => handleTogglePopular(catId, item.id)}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold cursor-pointer ${
                          isPopular
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-neutral-100 text-neutral-500'
                        }`}
                      >
                        <Flame className="w-3 h-3" />
                        <span>Populaire</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleUpsell(item.id)}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold cursor-pointer ${
                          isUpsell
                            ? 'bg-emerald-100 text-emerald-900'
                            : 'bg-neutral-100 text-neutral-500'
                        }`}
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>Upsell Panier</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right Controls: BIG Sold Out Switch + Edit + Delete */}
                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-neutral-200/60">
                  {/* Prominent Big Sold-Out Switch */}
                  <button
                    type="button"
                    onClick={() => handleToggleSoldOut(catId, item.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                      isSoldOut
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200'
                    }`}
                  >
                    {isSoldOut
                      ? lang === 'ar'
                        ? 'نفذت الكمية (Sold out)'
                        : 'Épuisé (Sold out)'
                      : lang === 'ar'
                      ? 'متوفر ✓'
                      : 'Disponible ✓'}
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setEditingItem({
                        categoryId: catId,
                        item: JSON.parse(JSON.stringify(item)),
                        isNew: false,
                        isUpsell,
                      })
                    }
                    className="p-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 cursor-pointer"
                    title="Modifier"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteItem(catId, item.id)}
                    className="p-2 rounded-xl bg-neutral-100 hover:bg-rose-50 hover:text-rose-600 text-neutral-500 cursor-pointer"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add / Edit Item Modal (3 Languages, Image Compression Upload, Options) */}
      {editingItem && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setEditingItem(null)}
        >
          <div
            className="bg-white w-full max-w-2xl rounded-3xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h3 className="text-lg font-extrabold text-neutral-950">
                {editingItem.isNew ? 'Ajouter un article' : 'Modifier l’article'}
              </h3>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="p-2 rounded-xl bg-neutral-100 text-neutral-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveItemModal} className="space-y-4">
              {/* Category & Price */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-extrabold text-neutral-700 mb-1">
                    Catégorie
                  </label>
                  <select
                    value={editingItem.categoryId}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        categoryId: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs font-bold"
                  >
                    {menu.categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {getLocalized(c.name, lang)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-neutral-700 mb-1">
                    Prix (MAD)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step="0.5"
                    required
                    dir="ltr"
                    value={editingItem.item.price}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        item: {
                          ...editingItem.item,
                          price: Number(e.target.value),
                        },
                      })
                    }
                    className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs font-extrabold"
                  />
                </div>
              </div>

              {/* Names in FR / AR / EN */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Nom (FR)
                  </label>
                  <input
                    type="text"
                    value={editingItem.item.name.fr}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        item: {
                          ...editingItem.item,
                          name: { ...editingItem.item.name, fr: e.target.value },
                        },
                      })
                    }
                    className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    الاسم (AR)
                  </label>
                  <input
                    type="text"
                    dir="rtl"
                    value={editingItem.item.name.ar}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        item: {
                          ...editingItem.item,
                          name: { ...editingItem.item.name, ar: e.target.value },
                        },
                      })
                    }
                    className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Name (EN)
                  </label>
                  <input
                    type="text"
                    value={editingItem.item.name.en}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        item: {
                          ...editingItem.item,
                          name: { ...editingItem.item.name, en: e.target.value },
                        },
                      })
                    }
                    className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-xs"
                  />
                </div>
              </div>

              {/* Descriptions in FR / AR / EN */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Description (FR)
                  </label>
                  <textarea
                    rows={2}
                    value={editingItem.item.description.fr}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        item: {
                          ...editingItem.item,
                          description: {
                            ...editingItem.item.description,
                            fr: e.target.value,
                          },
                        },
                      })
                    }
                    className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    الوصف (AR)
                  </label>
                  <textarea
                    rows={2}
                    dir="rtl"
                    value={editingItem.item.description.ar}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        item: {
                          ...editingItem.item,
                          description: {
                            ...editingItem.item.description,
                            ar: e.target.value,
                          },
                        },
                      })
                    }
                    className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Description (EN)
                  </label>
                  <textarea
                    rows={2}
                    value={editingItem.item.description.en}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        item: {
                          ...editingItem.item,
                          description: {
                            ...editingItem.item.description,
                            en: e.target.value,
                          },
                        },
                      })
                    }
                    className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-xs"
                  />
                </div>
              </div>

              {/* Image Upload with Client-Side Compression (< 2 MB) */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-neutral-700">
                  Photo de l’article (compression WebP automatique &lt; 2 Mo)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    dir="ltr"
                    value={editingItem.item.image || ''}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        item: { ...editingItem.item, image: e.target.value },
                      })
                    }
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 rounded-xl border border-neutral-200 px-3 py-2 text-xs"
                  />
                  <label className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-neutral-900 text-white text-xs font-bold cursor-pointer shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploadingImg ? 'Compression...' : 'Uploader'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleUploadItemPhoto}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Popular & Upsell Flags */}
              <div className="flex flex-wrap gap-4 pt-1">
                <label className="inline-flex items-center gap-2 text-xs font-bold text-neutral-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(editingItem.item.popular)}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        item: { ...editingItem.item, popular: e.target.checked },
                      })
                    }
                  />
                  <span>Afficher dans "Les plus populaires"</span>
                </label>

                <label className="inline-flex items-center gap-2 text-xs font-bold text-neutral-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingItem.isUpsell}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        isUpsell: e.target.checked,
                      })
                    }
                  />
                  <span>Suggérer en Upsell ("Complétez votre commande")</span>
                </label>
              </div>

              {/* Simple Option Group Builder */}
              <div className="rounded-2xl bg-neutral-50 border border-neutral-200 p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-neutral-800">
                    Options & Suppléments ({(editingItem.item.options || []).length})
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const newGroup: MenuItemOptionGroup = {
                        id: `opt-${Date.now()}`,
                        name: { fr: 'Suppléments', ar: 'إضافات', en: 'Extras' },
                        type: 'multiple',
                        choices: [
                          {
                            id: `ch-${Date.now()}`,
                            name: { fr: 'Extra fromage', ar: 'جبن إضافي', en: 'Extra cheese' },
                            price: 5,
                          },
                        ],
                      };
                      setEditingItem({
                        ...editingItem,
                        item: {
                          ...editingItem.item,
                          options: [...(editingItem.item.options || []), newGroup],
                        },
                      });
                    }}
                    className="text-xs font-bold text-[#6BBF3A] hover:underline cursor-pointer"
                  >
                    + Ajouter un groupe d’options
                  </button>
                </div>

                {(editingItem.item.options || []).map((grp, gIdx) => (
                  <div
                    key={grp.id}
                    className="rounded-xl bg-white border border-neutral-200 p-3 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <input
                        type="text"
                        value={grp.name.fr}
                        onChange={(e) => {
                          const val = e.target.value;
                          const nextOpts = [...(editingItem.item.options || [])];
                          nextOpts[gIdx] = {
                            ...grp,
                            name: { fr: val, ar: val, en: val },
                          };
                          setEditingItem({
                            ...editingItem,
                            item: { ...editingItem.item, options: nextOpts },
                          });
                        }}
                        className="rounded-lg border border-neutral-200 px-2.5 py-1 text-xs font-bold"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const nextOpts = (editingItem.item.options || []).filter(
                            (_, idx) => idx !== gIdx
                          );
                          setEditingItem({
                            ...editingItem,
                            item: { ...editingItem.item, options: nextOpts },
                          });
                        }}
                        className="text-xs text-rose-600 font-bold cursor-pointer"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2.5 rounded-xl bg-neutral-100 text-xs font-bold text-neutral-700 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-extrabold text-white cursor-pointer"
                  style={{ backgroundColor: primaryColor }}
                >
                  Enregistrer l’article
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 2. HOURS & ORDERING TAB (Weekly Hours, Order Types, Delivery Zones, Min Order)
// ============================================================================

export const HoursAndOrderingTabPanel: React.FC<{
  menu: ClientMenu;
  lang: Language;
  onSaveMenu: (updater: (cur: ClientMenu) => ClientMenu) => Promise<void>;
}> = ({ menu, lang, onSaveMenu }) => {
  const primaryColor = menu.colors.primary || '#6BBF3A';
  const [zoneNameFr, setZoneNameFr] = useState('');
  const [zoneFee, setZoneFee] = useState('15');
  const [zoneTime, setZoneTime] = useState('25 à 35 min');

  const handleToggleOrderType = async (key: 'dineIn' | 'takeaway' | 'delivery') => {
    await onSaveMenu((cur) => ({
      ...cur,
      orderTypes: {
        ...cur.orderTypes,
        [key]: !cur.orderTypes[key],
      },
    }));
  };

  const handleAddZone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!zoneNameFr.trim()) return;
    const newZone: DeliveryZone = {
      id: `zone-${Date.now()}`,
      name: {
        fr: zoneNameFr.trim(),
        ar: zoneNameFr.trim(),
        en: zoneNameFr.trim(),
      },
      fee: Math.max(0, Number(zoneFee) || 0),
      estimatedTime: {
        fr: zoneTime.trim() || '30 min',
        ar: zoneTime.trim() || '30 دقيقة',
        en: zoneTime.trim() || '30 mins',
      },
    };
    await onSaveMenu((cur) => ({
      ...cur,
      delivery: {
        ...cur.delivery,
        zones: [...cur.delivery.zones, newZone],
      },
    }));
    setZoneNameFr('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Order Types & Delivery Rules */}
      <div className="lg:col-span-6 rounded-3xl bg-white border border-neutral-200/90 p-5 sm:p-6 shadow-2xs space-y-5">
        <div className="flex items-center gap-2">
          <Truck className="w-5 h-5" style={{ color: primaryColor }} />
          <h3 className="text-base font-extrabold text-neutral-950">
            Modes de commande & Livraison
          </h3>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {(
            [
              { id: 'dineIn', label: 'Sur place' },
              { id: 'takeaway', label: 'À emporter' },
              { id: 'delivery', label: 'Livraison' },
            ] as const
          ).map((t) => {
            const enabled = menu.orderTypes[t.id];
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => handleToggleOrderType(t.id)}
                className={`p-3 rounded-2xl border text-xs font-extrabold transition-all cursor-pointer ${
                  enabled
                    ? 'text-white border-transparent shadow-2xs'
                    : 'bg-neutral-50 border-neutral-200 text-neutral-500'
                }`}
                style={enabled ? { backgroundColor: primaryColor } : undefined}
              >
                {t.label} {enabled ? '✓' : '✕'}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              Minimum de commande (MAD)
            </label>
            <input
              type="number"
              min={0}
              dir="ltr"
              value={menu.delivery.minimumOrder}
              onChange={(e) =>
                onSaveMenu((cur) => ({
                  ...cur,
                  delivery: {
                    ...cur.delivery,
                    minimumOrder: Math.max(0, Number(e.target.value) || 0),
                  },
                }))
              }
              className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm font-extrabold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              Livraison offerte dès (MAD)
            </label>
            <input
              type="number"
              min={0}
              dir="ltr"
              value={menu.delivery.freeDeliveryThreshold}
              onChange={(e) =>
                onSaveMenu((cur) => ({
                  ...cur,
                  delivery: {
                    ...cur.delivery,
                    freeDeliveryThreshold: Math.max(0, Number(e.target.value) || 0),
                  },
                }))
              }
              className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm font-extrabold"
            />
          </div>
        </div>

        {/* Delivery Zones */}
        <div className="space-y-2.5 pt-2 border-t border-neutral-100">
          <h4 className="text-xs font-extrabold text-neutral-800">
            Zones de livraison ({menu.delivery.zones.length})
          </h4>
          {menu.delivery.zones.map((z) => (
            <div
              key={z.id}
              className="flex items-center justify-between gap-2 rounded-xl bg-neutral-50 border border-neutral-200 px-3 py-2 text-xs"
            >
              <div>
                <span className="font-bold text-neutral-900">
                  {getLocalized(z.name, lang)}
                </span>
                <span className="text-neutral-500 mx-1.5">•</span>
                <span className="font-extrabold" style={{ color: primaryColor }}>
                  {z.fee} MAD
                </span>
              </div>
              <button
                type="button"
                onClick={() =>
                  onSaveMenu((cur) => ({
                    ...cur,
                    delivery: {
                      ...cur.delivery,
                      zones: cur.delivery.zones.filter((item) => item.id !== z.id),
                    },
                  }))
                }
                className="text-neutral-400 hover:text-rose-600 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}

          <form onSubmit={handleAddZone} className="grid grid-cols-3 gap-2 pt-1">
            <input
              type="text"
              value={zoneNameFr}
              onChange={(e) => setZoneNameFr(e.target.value)}
              placeholder="Quartier / Zone..."
              className="rounded-xl border border-neutral-200 px-2.5 py-1.5 text-xs"
            />
            <input
              type="number"
              dir="ltr"
              value={zoneFee}
              onChange={(e) => setZoneFee(e.target.value)}
              placeholder="Frais MAD"
              className="rounded-xl border border-neutral-200 px-2.5 py-1.5 text-xs"
            />
            <button
              type="submit"
              className="rounded-xl text-xs font-extrabold text-white cursor-pointer"
              style={{ backgroundColor: primaryColor }}
            >
              + Ajouter zone
            </button>
          </form>
        </div>
      </div>

      {/* Weekly Opening Hours */}
      <div className="lg:col-span-6 rounded-3xl bg-white border border-neutral-200/90 p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5" style={{ color: primaryColor }} />
          <h3 className="text-base font-extrabold text-neutral-950">
            Horaires d’ouverture hebdomadaires
          </h3>
        </div>

        <div className="space-y-2.5">
          {DAYS_LIST.map((day) => {
            const dh = menu.weeklyHours?.[day] || {
              open: '08:00',
              close: '23:00',
              closed: false,
            };
            return (
              <div
                key={day}
                className="flex items-center justify-between gap-2 rounded-2xl bg-neutral-50 border border-neutral-200/80 px-3.5 py-2 text-xs"
              >
                <span className="font-bold text-neutral-900 w-24">
                  {DAY_NAMES[lang][day]}
                </span>

                {!dh.closed ? (
                  <div className="flex items-center gap-1.5" dir="ltr">
                    <input
                      type="time"
                      value={dh.open}
                      onChange={(e) =>
                        onSaveMenu((cur) => ({
                          ...cur,
                          weeklyHours: {
                            ...cur.weeklyHours,
                            [day]: { ...dh, open: e.target.value },
                          },
                        }))
                      }
                      className="rounded-lg border border-neutral-200 bg-white px-2 py-1 text-xs font-bold"
                    />
                    <span>–</span>
                    <input
                      type="time"
                      value={dh.close}
                      onChange={(e) =>
                        onSaveMenu((cur) => ({
                          ...cur,
                          weeklyHours: {
                            ...cur.weeklyHours,
                            [day]: { ...dh, close: e.target.value },
                          },
                        }))
                      }
                      className="rounded-lg border border-neutral-200 bg-white px-2 py-1 text-xs font-bold"
                    />
                  </div>
                ) : (
                  <span className="text-rose-600 font-extrabold">Fermé</span>
                )}

                <label className="inline-flex items-center gap-1.5 text-[11px] font-bold text-neutral-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(dh.closed)}
                    onChange={(e) =>
                      onSaveMenu((cur) => ({
                        ...cur,
                        weeklyHours: {
                          ...cur.weeklyHours,
                          [day]: { ...dh, closed: e.target.checked },
                        },
                      }))
                    }
                  />
                  <span>Fermé</span>
                </label>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 3. LOOK & THEME TAB (Logo, Cover, Color Presets & Pickers, Promo Banner)
// ============================================================================

export const LookTabPanel: React.FC<{
  menu: ClientMenu;
  lang: Language;
  onSaveMenu: (updater: (cur: ClientMenu) => ClientMenu) => Promise<void>;
}> = ({ menu, onSaveMenu }) => {
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const primaryColor = menu.colors.primary || '#6BBF3A';

  const handleUploadLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    try {
      const url = await uploadMenuImage(menu.id || menu.slug, file);
      await onSaveMenu((cur) => ({ ...cur, logo: url }));
    } finally {
      setUploadingLogo(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Colors & Logo */}
      <div className="lg:col-span-6 rounded-3xl bg-white border border-neutral-200/90 p-5 sm:p-6 shadow-2xs space-y-5">
        <div className="flex items-center gap-2">
          <Palette className="w-5 h-5" style={{ color: primaryColor }} />
          <h3 className="text-base font-extrabold text-neutral-950">
            Identité visuelle & Couleurs
          </h3>
        </div>

        <div className="flex items-center gap-4">
          <img
            src={menu.logo}
            alt={menu.name}
            referrerPolicy="no-referrer"
            className="w-16 h-16 rounded-2xl object-cover border border-neutral-200 bg-neutral-100"
          />
          <div className="flex-1 space-y-1.5">
            <label className="block text-xs font-bold text-neutral-700">
              Logo de l’établissement
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                dir="ltr"
                value={menu.logo}
                onChange={(e) =>
                  onSaveMenu((cur) => ({ ...cur, logo: e.target.value }))
                }
                className="flex-1 rounded-xl border border-neutral-200 px-3 py-1.5 text-xs"
              />
              <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 text-white text-xs font-bold cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                <span>{uploadingLogo ? '...' : 'Upload'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUploadLogo}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Presets */}
        <div className="space-y-2">
          <p className="text-xs font-bold text-neutral-700">Palettes prédéfinies</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {COLOR_PRESETS.map((p) => (
              <button
                key={p.name}
                type="button"
                onClick={() =>
                  onSaveMenu((cur) => ({
                    ...cur,
                    colors: {
                      primary: p.primary,
                      accent: p.accent,
                      background: p.background,
                    },
                  }))
                }
                className="flex items-center gap-2 p-2.5 rounded-xl border border-neutral-200 hover:border-neutral-400 text-xs font-bold text-neutral-800 cursor-pointer"
              >
                <span
                  className="w-5 h-5 rounded-full shrink-0 border border-black/10"
                  style={{ backgroundColor: p.primary }}
                />
                <span className="truncate">{p.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Color Pickers */}
        <div className="grid grid-cols-3 gap-3 pt-2">
          <div>
            <label className="block text-[11px] font-bold text-neutral-600 mb-1">
              Couleur principale
            </label>
            <input
              type="color"
              value={menu.colors.primary}
              onChange={(e) =>
                onSaveMenu((cur) => ({
                  ...cur,
                  colors: { ...cur.colors, primary: e.target.value },
                }))
              }
              className="w-full h-10 rounded-xl border border-neutral-200 cursor-pointer"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-neutral-600 mb-1">
              Couleur d’accent
            </label>
            <input
              type="color"
              value={menu.colors.accent}
              onChange={(e) =>
                onSaveMenu((cur) => ({
                  ...cur,
                  colors: { ...cur.colors, accent: e.target.value },
                }))
              }
              className="w-full h-10 rounded-xl border border-neutral-200 cursor-pointer"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-neutral-600 mb-1">
              Fond de page
            </label>
            <input
              type="color"
              value={menu.colors.background}
              onChange={(e) =>
                onSaveMenu((cur) => ({
                  ...cur,
                  colors: { ...cur.colors, background: e.target.value },
                }))
              }
              className="w-full h-10 rounded-xl border border-neutral-200 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Promo Banner Editor */}
      <div className="lg:col-span-6 rounded-3xl bg-white border border-neutral-200/90 p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold text-neutral-950">
            Bannière promotionnelle
          </h3>
          <label className="inline-flex items-center gap-2 text-xs font-extrabold cursor-pointer">
            <input
              type="checkbox"
              checked={Boolean(menu.promoBanner?.enabled)}
              onChange={(e) =>
                onSaveMenu((cur) => ({
                  ...cur,
                  promoBanner: {
                    ...(cur.promoBanner || {
                      title: { fr: '', ar: '', en: '' },
                      subtitle: { fr: '', ar: '', en: '' },
                      buttonText: { fr: 'Découvrir', ar: 'اكتشف', en: 'Explore' },
                      image: cur.cover || cur.logo,
                    }),
                    enabled: e.target.checked,
                  },
                }))
              }
            />
            <span>Activer la bannière</span>
          </label>
        </div>

        {menu.promoBanner && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                Titre (FR)
              </label>
              <input
                type="text"
                value={menu.promoBanner.title.fr}
                onChange={(e) =>
                  onSaveMenu((cur) => ({
                    ...cur,
                    promoBanner: cur.promoBanner
                      ? {
                          ...cur.promoBanner,
                          title: {
                            ...cur.promoBanner.title,
                            fr: e.target.value,
                          },
                        }
                      : undefined,
                  }))
                }
                className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                العنوان (AR)
              </label>
              <input
                type="text"
                dir="rtl"
                value={menu.promoBanner.title.ar}
                onChange={(e) =>
                  onSaveMenu((cur) => ({
                    ...cur,
                    promoBanner: cur.promoBanner
                      ? {
                          ...cur.promoBanner,
                          title: {
                            ...cur.promoBanner.title,
                            ar: e.target.value,
                          },
                        }
                      : undefined,
                  }))
                }
                className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                Image URL de la bannière
              </label>
              <input
                type="text"
                dir="ltr"
                value={menu.promoBanner.image}
                onChange={(e) =>
                  onSaveMenu((cur) => ({
                    ...cur,
                    promoBanner: cur.promoBanner
                      ? { ...cur.promoBanner, image: e.target.value }
                      : undefined,
                  }))
                }
                className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-xs"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// 4. STATS TAB (Views, Orders per Day, Orders per Table, Busiest Hours)
// ============================================================================

export const StatsTabPanel: React.FC<{
  menu: ClientMenu;
  orders: OrderRecord[];
  events: MenuEventRecord[];
  lang: Language;
}> = ({ menu, orders, events }) => {
  const primaryColor = menu.colors.primary || '#6BBF3A';

  // Orders per table breakdown
  const tableCounts: Record<string, number> = {};
  for (const o of orders) {
    if (o.table_label) {
      tableCounts[o.table_label] = (tableCounts[o.table_label] || 0) + 1;
    }
  }
  for (const ev of events) {
    if (ev.type === 'qr_scan' && ev.table_label) {
      tableCounts[ev.table_label] = (tableCounts[ev.table_label] || 0) + 1;
    }
  }
  const sortedTables = Object.entries(tableCounts).sort((a, b) => b[1] - a[1]);

  // Busiest hours breakdown
  const hourCounts: Record<number, number> = {};
  for (const o of orders) {
    const h = new Date(o.created_at).getHours();
    hourCounts[h] = (hourCounts[h] || 0) + 2;
  }
  for (const ev of events) {
    const h = new Date(ev.created_at).getHours();
    hourCounts[h] = (hourCounts[h] || 0) + 1;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Per-Table Activity */}
      <div className="lg:col-span-6 rounded-3xl bg-white border border-neutral-200/90 p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5" style={{ color: primaryColor }} />
          <h3 className="text-base font-extrabold text-neutral-950">
            Commandes & Scans par Table
          </h3>
        </div>

        <div className="space-y-2.5">
          {sortedTables.length === 0 ? (
            <p className="text-xs text-neutral-500">Aucune donnée de table.</p>
          ) : (
            sortedTables.slice(0, 8).map(([tableLabel, count]) => {
              const max = sortedTables[0][1] || 1;
              const pct = Math.max(12, Math.round((count / max) * 100));
              return (
                <div key={tableLabel} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-neutral-900">Table {tableLabel}</span>
                    <span className="text-neutral-600">{count} actions</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-neutral-100 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${pct}%`, backgroundColor: primaryColor }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Busiest Hours */}
      <div className="lg:col-span-6 rounded-3xl bg-white border border-neutral-200/90 p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5" style={{ color: primaryColor }} />
          <h3 className="text-base font-extrabold text-neutral-950">
            Heures de pointe (Affluence)
          </h3>
        </div>

        <div className="grid grid-cols-6 gap-2 items-end h-44 pt-4">
          {[9, 11, 13, 16, 19, 21].map((hour) => {
            const val = hourCounts[hour] || 2;
            const heightPct = Math.min(100, Math.max(18, val * 12));
            return (
              <div
                key={hour}
                className="flex flex-col items-center justify-end h-full gap-1.5"
              >
                <div
                  className="w-full rounded-t-xl transition-all"
                  style={{
                    height: `${heightPct}%`,
                    backgroundColor: primaryColor,
                  }}
                />
                <span dir="ltr" className="text-[11px] font-bold text-neutral-600">
                  {hour}h
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 5. SETTINGS TAB (Business details, WhatsApp, City, Languages)
// ============================================================================

export const SettingsTabPanel: React.FC<{
  menu: ClientMenu;
  lang: Language;
  onSaveMenu: (updater: (cur: ClientMenu) => ClientMenu) => Promise<void>;
}> = ({ menu, onSaveMenu }) => {
  const primaryColor = menu.colors.primary || '#6BBF3A';
  const [savedNotice, setSavedNotice] = useState(false);

  const triggerSaved = () => {
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  return (
    <div className="rounded-3xl bg-white border border-neutral-200/90 p-5 sm:p-6 shadow-2xs space-y-5 max-w-3xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5" style={{ color: primaryColor }} />
          <h3 className="text-base font-extrabold text-neutral-950">
            Paramètres de l’établissement
          </h3>
        </div>
        {savedNotice && (
          <span className="inline-flex items-center gap-1 text-xs font-extrabold text-emerald-700">
            <Check className="w-4 h-4" />
            <span>Modifications enregistrées</span>
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-neutral-700 mb-1">
            Nom du café / restaurant
          </label>
          <input
            type="text"
            value={menu.name}
            onChange={(e) => {
              onSaveMenu((cur) => ({ ...cur, name: e.target.value }));
              triggerSaved();
            }}
            className="w-full rounded-xl border border-neutral-200 px-3.5 py-2 text-xs font-bold"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-neutral-700 mb-1">
            Ville
          </label>
          <input
            type="text"
            value={menu.city}
            onChange={(e) => {
              onSaveMenu((cur) => ({ ...cur, city: e.target.value }));
              triggerSaved();
            }}
            className="w-full rounded-xl border border-neutral-200 px-3.5 py-2 text-xs font-bold"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-neutral-700 mb-1">
            Numéro WhatsApp (commandes)
          </label>
          <input
            type="text"
            dir="ltr"
            value={menu.contact.whatsapp}
            onChange={(e) => {
              onSaveMenu((cur) => ({
                ...cur,
                contact: { ...cur.contact, whatsapp: e.target.value },
              }));
              triggerSaved();
            }}
            className="w-full rounded-xl border border-neutral-200 px-3.5 py-2 text-xs font-bold"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-neutral-700 mb-1">
            Téléphone d’appel
          </label>
          <input
            type="text"
            dir="ltr"
            value={menu.contact.phone}
            onChange={(e) => {
              onSaveMenu((cur) => ({
                ...cur,
                contact: { ...cur.contact, phone: e.target.value },
              }));
              triggerSaved();
            }}
            className="w-full rounded-xl border border-neutral-200 px-3.5 py-2 text-xs font-bold"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-neutral-700 mb-1">
            Lien Google Maps
          </label>
          <input
            type="text"
            dir="ltr"
            value={menu.contact.mapsLink}
            onChange={(e) => {
              onSaveMenu((cur) => ({
                ...cur,
                contact: { ...cur.contact, mapsLink: e.target.value },
              }));
              triggerSaved();
            }}
            className="w-full rounded-xl border border-neutral-200 px-3.5 py-2 text-xs"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-neutral-700 mb-1">
            Langue par défaut du menu
          </label>
          <select
            value={menu.defaultLanguage}
            onChange={(e) => {
              onSaveMenu((cur) => ({
                ...cur,
                defaultLanguage: e.target.value as Language,
              }));
              triggerSaved();
            }}
            className="w-full rounded-xl border border-neutral-200 px-3.5 py-2 text-xs font-bold"
          >
            <option value="ar">العربية (AR)</option>
            <option value="fr">Français (FR)</option>
            <option value="en">English (EN)</option>
          </select>
        </div>
      </div>
    </div>
  );
};
