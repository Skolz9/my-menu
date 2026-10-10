import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import {
  X,
  Plus,
  Minus,
  Check,
  Copy,
  AlertCircle,
  Utensils,
  UserCheck,
} from 'lucide-react';
import {
  getLocalized,
  formatPriceText,
  type ClientMenu,
  type Language,
  type MenuItem,
} from '../menus';
import { translations } from '../i18n/translations';
import { PriceDisplay, LinePriceEquation } from './PriceDisplay';

export interface CartLineItem {
  cartKey: string;
  item: MenuItem;
  quantity: number;
  selectedOptions: Record<string, string[]>;
  note: string;
}

export function getDefaultSelectedOptions(item: MenuItem): Record<string, string[]> {
  const defaults: Record<string, string[]> = {};
  if (!item.options) return defaults;
  for (const group of item.options) {
    if (group.type === 'single' && group.choices.length > 0) {
      defaults[group.id] = [group.choices[0].id];
    } else {
      defaults[group.id] = [];
    }
  }
  return defaults;
}

export function buildCartKey(
  itemId: string,
  selectedOptions: Record<string, string[]>
): string {
  const optionEntries = Object.entries(selectedOptions)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([groupId, choiceIds]) => `${groupId}:${[...choiceIds].sort().join(',')}`)
    .join('|');
  return `${itemId}__${optionEntries}`;
}

export function computeItemUnitPrice(
  item: MenuItem,
  selectedOptions: Record<string, string[]>
): number {
  let extra = 0;
  if (item.options) {
    for (const group of item.options) {
      const chosenIds = selectedOptions[group.id] || [];
      for (const choice of group.choices) {
        if (chosenIds.includes(choice.id)) {
          extra += choice.price;
        }
      }
    }
  }
  return item.price + extra;
}

export function formatSelectedOptionsList(
  item: MenuItem,
  selectedOptions: Record<string, string[]>,
  lang: Language
): string[] {
  if (!item.options) return [];
  const list: string[] = [];
  for (const group of item.options) {
    const chosenIds = selectedOptions[group.id] || [];
    for (const choice of group.choices) {
      if (chosenIds.includes(choice.id)) {
        const name = getLocalized(choice.name, lang);
        if (choice.price > 0) {
          list.push(`${name} (+${formatPriceText(choice.price, lang)})`);
        } else {
          list.push(name);
        }
      }
    }
  }
  return list;
}

export const ItemDetailModal: React.FC<{
  item: MenuItem | null;
  lang: Language;
  primaryColor: string;
  onClose: () => void;
  onConfirmAdd: (
    item: MenuItem,
    quantity: number,
    selectedOptions: Record<string, string[]>,
    note: string
  ) => void;
}> = ({ item, lang, primaryColor, onClose, onConfirmAdd }) => {
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string[]>>({});
  const [quantity, setQuantity] = useState<number>(1);
  const [note, setNote] = useState<string>('');
  const [imgError, setImgError] = useState<boolean>(false);

  useEffect(() => {
    if (item) {
      setSelectedOptions(getDefaultSelectedOptions(item));
      setQuantity(1);
      setNote('');
      setImgError(false);
    }
  }, [item]);

  if (!item) return null;

  const t = translations[lang].menuPage;
  const dir = lang === 'ar' ? 'rtl' : 'ltr';
  const allergens = item.allergens?.[lang] || [];
  const unitPrice = computeItemUnitPrice(item, selectedOptions);
  const totalPrice = unitPrice * quantity;

  const handleToggleOption = (
    groupId: string,
    choiceId: string,
    type: 'single' | 'multiple'
  ) => {
    setSelectedOptions((prev) => {
      if (type === 'single') {
        return { ...prev, [groupId]: [choiceId] };
      }
      const current = prev[groupId] || [];
      const exists = current.includes(choiceId);
      const next = exists
        ? current.filter((id) => id !== choiceId)
        : [...current, choiceId];
      return { ...prev, [groupId]: next };
    });
  };

  return (
    <div
      dir={dir}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Large Photo Header */}
        <div className="relative h-56 sm:h-64 bg-neutral-100 shrink-0">
          {item.image && !imgError ? (
            <img
              src={item.image}
              alt={getLocalized(item.name, lang)}
              referrerPolicy="no-referrer"
              onError={() => setImgError(true)}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-neutral-400">
              <Utensils className="w-12 h-12" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/25 pointer-events-none" />
          <button
            type="button"
            onClick={onClose}
            aria-label={t.closeBtn}
            className={`absolute top-4 ${
              dir === 'rtl' ? 'left-4' : 'right-4'
            } w-10 h-10 rounded-full bg-white/95 text-neutral-900 flex items-center justify-center shadow-md hover:bg-white cursor-pointer`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Details, Allergens & Options */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-lg sm:text-xl font-extrabold text-neutral-950 leading-snug">
                {getLocalized(item.name, lang)}
              </h2>
              <PriceDisplay
                amount={item.price}
                lang={lang}
                className="text-base sm:text-lg font-extrabold shrink-0"
                style={{ color: primaryColor }}
              />
            </div>
            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
              {getLocalized(item.description, lang)}
            </p>
          </div>

          {/* Allergens Info */}
          {allergens.length > 0 && (
            <div className="rounded-2xl bg-neutral-100 border border-neutral-200/80 p-3.5 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-neutral-800">
                <AlertCircle className="w-4 h-4 text-neutral-600 shrink-0" />
                <span>{t.allergensTitle}</span>
              </div>
              <p className="text-xs text-neutral-600">
                {allergens.join(' · ')}
              </p>
            </div>
          )}

          {/* Option Groups (Single & Multiple Choice) */}
          {item.options &&
            item.options.map((group) => {
              const selectedIds = selectedOptions[group.id] || [];
              return (
                <div key={group.id} className="space-y-2.5 pt-2 border-t border-neutral-100">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-extrabold text-neutral-950">
                      {getLocalized(group.name, lang)}
                    </h3>
                    <span className="text-[11px] font-bold text-neutral-500">
                      {group.type === 'single'
                        ? t.singleChoiceHint
                        : t.multipleChoiceHint}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {group.choices.map((choice) => {
                      const isSelected = selectedIds.includes(choice.id);
                      return (
                        <button
                          key={choice.id}
                          type="button"
                          onClick={() =>
                            handleToggleOption(group.id, choice.id, group.type)
                          }
                          className={`w-full flex items-center justify-between gap-3 p-3 rounded-xl border text-start transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-neutral-50 border-2'
                              : 'bg-white border-neutral-200 hover:border-neutral-300'
                          }`}
                          style={
                            isSelected ? { borderColor: primaryColor } : undefined
                          }
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span
                              className={`w-5 h-5 ${
                                group.type === 'single' ? 'rounded-full' : 'rounded-md'
                              } border flex items-center justify-center shrink-0 ${
                                isSelected
                                  ? 'text-white border-transparent'
                                  : 'border-neutral-300 bg-white'
                              }`}
                              style={
                                isSelected
                                  ? { backgroundColor: primaryColor }
                                  : undefined
                              }
                            >
                              {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                            </span>
                            <span className="text-xs sm:text-sm font-bold text-neutral-900">
                              {getLocalized(choice.name, lang)}
                            </span>
                          </div>

                          {choice.price > 0 ? (
                            <PriceDisplay
                              amount={choice.price}
                              lang={lang}
                              prefix="+"
                              className="text-xs font-extrabold text-neutral-700"
                            />
                          ) : (
                            <span className="text-xs font-semibold text-neutral-400">
                              {t.freeOption}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}

          {/* Per-item Special Note */}
          <div className="space-y-1.5 pt-2 border-t border-neutral-100">
            <label className="block text-xs font-extrabold text-neutral-800">
              {t.itemNoteLabel}
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t.itemNotePlaceholder}
              style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
              className="w-full rounded-xl bg-neutral-50 border border-neutral-200 px-3.5 py-2.5 text-xs sm:text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:bg-white focus:ring-2"
            />
          </div>
        </div>

        {/* Sticky Bottom Action Bar inside Modal */}
        <div className="p-4 sm:p-5 border-t border-neutral-200 bg-white flex items-center gap-3">
          <div className="inline-flex items-center gap-2 bg-neutral-100 rounded-2xl p-1.5 border border-neutral-200">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="w-9 h-9 rounded-xl bg-white text-neutral-800 flex items-center justify-center shadow-2xs hover:bg-neutral-50 cursor-pointer"
              aria-label="Decrease quantity"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span
              dir="ltr"
              className="min-w-[24px] text-center text-sm font-extrabold text-neutral-950 tabular-nums"
            >
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity((q) => q + 1)}
              className="w-9 h-9 rounded-xl text-white flex items-center justify-center shadow-2xs cursor-pointer"
              style={{ backgroundColor: primaryColor }}
              aria-label="Increase quantity"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              onConfirmAdd(item, quantity, selectedOptions, note);
              onClose();
            }}
            className="flex-1 py-3.5 px-5 rounded-2xl text-white font-extrabold text-sm flex items-center justify-between gap-2 shadow-md hover:opacity-95 transition-opacity cursor-pointer"
            style={{ backgroundColor: primaryColor }}
          >
            <span>{t.addToOrderBtn}</span>
            <PriceDisplay amount={totalPrice} lang={lang} className="text-sm font-extrabold" />
          </button>
        </div>
      </div>
    </div>
  );
};

export const ShowToWaiterModal: React.FC<{
  open: boolean;
  onClose: () => void;
  cartItems: CartLineItem[];
  tableNumber: string;
  onTableNumberChange: (val: string) => void;
  totalAmount: number;
  lang: Language;
  menu: ClientMenu;
}> = ({
  open,
  onClose,
  cartItems,
  tableNumber,
  onTableNumberChange,
  totalAmount,
  lang,
  menu,
}) => {
  if (!open) return null;
  const t = translations[lang].menuPage;
  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  return (
    <div
      dir={dir}
      className="fixed inset-0 z-50 bg-neutral-950 text-white flex flex-col justify-between overflow-y-auto p-5 sm:p-8"
    >
      <div className="max-w-2xl w-full mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-white/15 pb-5">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider px-3 py-1 rounded-lg bg-white/10 text-white">
              <UserCheck className="w-4 h-4" />
              <span>{menu.name}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight pt-1">
              {t.waiterModalTitle}
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400">
              {t.waiterModalSubtitle}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={t.closeBtn}
            className="w-11 h-11 rounded-2xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer shrink-0"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Optional Table Number Input */}
        <div className="flex items-center justify-between gap-4 bg-white/5 border border-white/15 rounded-2xl p-4">
          <label className="text-sm sm:text-base font-bold text-neutral-200">
            {t.tableNumberLabel}
          </label>
          <input
            type="text"
            value={tableNumber}
            onChange={(e) => onTableNumberChange(e.target.value)}
            placeholder={t.tableNumberPlaceholder}
            className="w-40 rounded-xl bg-white/10 border border-white/20 px-3.5 py-2 text-base font-extrabold text-white placeholder:text-neutral-500 text-center focus:outline-none focus:border-white"
          />
        </div>

        {/* Large Text Order Items List */}
        <div className="space-y-4">
          {cartItems.map((line) => {
            const unitPrice = computeItemUnitPrice(line.item, line.selectedOptions);
            const optionLabels = formatSelectedOptionsList(
              line.item,
              line.selectedOptions,
              lang
            );
            return (
              <div
                key={line.cartKey}
                className="rounded-2xl bg-white/8 border border-white/15 p-4 sm:p-5 space-y-2"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <span
                      dir="ltr"
                      className="px-3 py-1 rounded-xl text-lg sm:text-xl font-extrabold text-white shrink-0 tabular-nums"
                      style={{ backgroundColor: menu.colors.primary }}
                    >
                      {line.quantity}×
                    </span>
                    <div className="space-y-1 min-w-0">
                      <h3 className="text-lg sm:text-xl font-extrabold text-white leading-snug">
                        {getLocalized(line.item.name, lang)}
                      </h3>
                      {optionLabels.length > 0 && (
                        <p className="text-sm font-semibold text-neutral-300">
                          {optionLabels.join(' · ')}
                        </p>
                      )}
                      {line.note && (
                        <p className="text-sm font-bold text-amber-300">
                          {t.waiterNotePrefix} {line.note}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/10 flex justify-end">
                  <LinePriceEquation
                    unitPrice={unitPrice}
                    quantity={line.quantity}
                    lang={lang}
                    className="text-sm sm:text-base text-neutral-300"
                    totalClassName="font-extrabold text-white text-base sm:text-lg"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Total & Close Button */}
      <div className="max-w-2xl w-full mx-auto pt-6 mt-6 border-t border-white/15 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-lg sm:text-xl font-bold text-neutral-300">
            {t.totalLabel}
          </span>
          <PriceDisplay
            amount={totalAmount}
            lang={lang}
            className="text-3xl sm:text-4xl font-extrabold text-white"
          />
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-4 rounded-2xl text-base font-extrabold text-white cursor-pointer"
          style={{ backgroundColor: menu.colors.primary }}
        >
          {t.closeBtn}
        </button>
      </div>
    </div>
  );
};

export const MenuQrModal: React.FC<{
  open: boolean;
  onClose: () => void;
  menu: ClientMenu;
  menuUrl: string;
  lang: Language;
}> = ({ open, onClose, menu, menuUrl, lang }) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (!open) return;
    let active = true;
    QRCode.toDataURL(menuUrl, {
      width: 480,
      margin: 2,
      color: {
        dark: menu.colors.primary,
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'H',
    })
      .then((url) => {
        if (active) setQrDataUrl(url);
      })
      .catch((err) => console.error('QR modal error:', err));

    return () => {
      active = false;
    };
  }, [open, menuUrl, menu.colors.primary]);

  if (!open) return null;

  const t = translations[lang].menuPage;
  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  const handleCopy = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(menuUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      dir={dir}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-sm rounded-3xl p-6 text-center space-y-5 shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label={t.closeBtn}
          className={`absolute top-4 ${
            dir === 'rtl' ? 'left-4' : 'right-4'
          } w-9 h-9 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 flex items-center justify-center cursor-pointer`}
        >
          <X className="w-4 h-4" />
        </button>

        <div className="space-y-1 pt-2">
          <h2 className="text-lg font-extrabold text-neutral-950">
            {t.qrModalTitle} — {menu.name}
          </h2>
          <p className="text-xs text-neutral-500">{t.qrModalSubtitle}</p>
        </div>

        <div className="inline-block p-3 rounded-2xl border-2 border-neutral-200 bg-white shadow-xs">
          {qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt={`${menu.name} QR Code`}
              className="w-52 h-52 mx-auto object-contain"
            />
          ) : (
            <div className="w-52 h-52 flex items-center justify-center text-xs text-neutral-400">
              ...
            </div>
          )}
        </div>

        <div className="space-y-2">
          <p dir="ltr" className="text-xs font-mono text-neutral-500 break-all px-2">
            {menuUrl}
          </p>
          <button
            type="button"
            onClick={handleCopy}
            className="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold text-white inline-flex items-center justify-center gap-2 shadow-sm hover:opacity-95 transition-opacity cursor-pointer"
            style={{ backgroundColor: menu.colors.primary }}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                <span>{t.linkCopiedBtn}</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>{t.copyLinkBtn}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
