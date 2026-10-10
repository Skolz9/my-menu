import React, { useState } from 'react';
import {
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  MessageCircle,
  UserCheck,
  MapPin,
  Clock,
  Utensils,
  Sparkles,
  AlertCircle,
  Check,
  X,
} from 'lucide-react';
import {
  getLocalized,
  formatPriceText,
  type ClientMenu,
  type Language,
  type MenuItem,
  type OrderType,
} from '../menus';
import { getWhatsAppUrl } from '../config';
import { translations } from '../i18n/translations';
import { PriceDisplay, LinePriceEquation } from './PriceDisplay';
import {
  computeItemUnitPrice,
  formatSelectedOptionsList,
  type CartLineItem,
} from './MenuModals';

export interface CustomerDetails {
  name: string;
  phone: string;
  address: string;
  locationLink: string;
  deliveryZoneId: string;
  tableNumber: string;
}

export const CartPanel: React.FC<{
  menu: ClientMenu;
  lang: Language;
  isOpen: boolean;
  cartItems: CartLineItem[];
  upsellItems: MenuItem[];
  orderType: OrderType;
  onOrderTypeChange: (type: OrderType) => void;
  customer: CustomerDetails;
  onCustomerChange: (patch: Partial<CustomerDetails>) => void;
  hasSavedDetails: boolean;
  onForgetDetails: () => void;
  onIncrementLine: (cartKey: string) => void;
  onDecrementLine: (cartKey: string) => void;
  onUpdateLineNote: (cartKey: string, note: string) => void;
  onQuickAddUpsell: (item: MenuItem) => void;
  onClearCart: () => void;
  onOpenWaiterModal: () => void;
  onCloseMobileDrawer?: () => void;
}> = ({
  menu,
  lang,
  isOpen,
  cartItems,
  upsellItems,
  orderType,
  onOrderTypeChange,
  customer,
  onCustomerChange,
  hasSavedDetails,
  onForgetDetails,
  onIncrementLine,
  onDecrementLine,
  onUpdateLineNote,
  onQuickAddUpsell,
  onClearCart,
  onOpenWaiterModal,
  onCloseMobileDrawer,
}) => {
  const t = translations[lang].menuPage;
  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  const [expandedNotes, setExpandedNotes] = useState<Record<string, boolean>>({});
  const [closedOrderMode, setClosedOrderMode] = useState<'whenOpens' | 'slot'>('whenOpens');
  const [selectedSlot, setSelectedSlot] = useState<string>(t.timeSlots[0]);
  const [locating, setLocating] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<boolean>(false);
  const [showValidationWarning, setShowValidationWarning] = useState<boolean>(false);

  const enabledOrderTypes = (['dineIn', 'takeaway', 'delivery'] as OrderType[]).filter(
    (type) => menu.orderTypes[type]
  );

  const subtotal = cartItems.reduce(
    (sum, line) =>
      sum + computeItemUnitPrice(line.item, line.selectedOptions) * line.quantity,
    0
  );

  const selectedZone =
    menu.delivery.zones.find((z) => z.id === customer.deliveryZoneId) ||
    menu.delivery.zones[0];

  const isFreeDelivery =
    menu.delivery.freeDeliveryThreshold > 0 &&
    subtotal >= menu.delivery.freeDeliveryThreshold;

  const deliveryFee =
    orderType === 'delivery'
      ? isFreeDelivery
        ? 0
        : selectedZone?.fee || 0
      : 0;

  const grandTotal = subtotal + deliveryFee;

  const isBelowMinDeliveryOrder =
    orderType === 'delivery' && subtotal < menu.delivery.minimumOrder;

  const isMissingRequiredFields =
    (orderType === 'takeaway' && !customer.name.trim()) ||
    (orderType === 'delivery' &&
      (!customer.name.trim() ||
        !customer.phone.trim() ||
        !customer.address.trim() ||
        !selectedZone));

  const canSubmitOrder =
    cartItems.length > 0 && !isBelowMinDeliveryOrder && !isMissingRequiredFields;

  const handleUseMyLocation = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setLocationError(true);
      return;
    }
    setLocating(true);
    setLocationError(false);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const mapsUrl = `https://maps.google.com/?q=${latitude.toFixed(6)},${longitude.toFixed(6)}`;
        onCustomerChange({ locationLink: mapsUrl });
        setLocating(false);
      },
      () => {
        setLocating(false);
        setLocationError(true);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const buildWhatsAppOrderUrl = () => {
    const now = new Date();
    const datePart = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(
      2,
      '0'
    )}${String(now.getDate()).padStart(2, '0')}`;
    const shortCode = String((now.getMinutes() * 60 + now.getSeconds()) % 900 + 100);
    const orderRef = `MM-${datePart}-${shortCode}`;

    const lines: string[] = [
      `*${t.waNewOrder} — ${menu.name}*`,
      `${t.waRef}: ${orderRef}`,
      `${t.waType}: ${t.orderTypes[orderType]}`,
    ];

    if (!isOpen) {
      const timingText =
        closedOrderMode === 'whenOpens'
          ? t.whenItOpensOption
          : `${t.scheduleSlotOption} (${selectedSlot})`;
      lines.push(`${t.waTiming}: ${timingText}`);
    }

    if (orderType === 'dineIn' && customer.tableNumber.trim()) {
      lines.push(`${t.waTable}: ${customer.tableNumber.trim()}`);
    }

    lines.push('', `*${t.waItems}:*`);

    for (const line of cartItems) {
      const unitPrice = computeItemUnitPrice(line.item, line.selectedOptions);
      const lineTotal = unitPrice * line.quantity;
      const itemName = getLocalized(line.item.name, lang);
      lines.push(
        `• ${line.quantity}x ${itemName} — ${formatPriceText(lineTotal, lang)}`
      );

      const opts = formatSelectedOptionsList(line.item, line.selectedOptions, lang);
      if (opts.length > 0) {
        lines.push(`   + ${opts.join(', ')}`);
      }
      if (line.note.trim()) {
        lines.push(`   (${t.waNote}: ${line.note.trim()})`);
      }
    }

    lines.push('');
    lines.push(`${t.subtotalLabel}: ${formatPriceText(subtotal, lang)}`);

    if (orderType === 'delivery' && selectedZone) {
      const feeStr = isFreeDelivery
        ? t.freeDeliveryBadge
        : formatPriceText(deliveryFee, lang);
      lines.push(
        `${t.deliveryFeeLabel} (${getLocalized(selectedZone.name, lang)}): ${feeStr}`
      );
    }

    lines.push(`*${t.totalLabel}: ${formatPriceText(grandTotal, lang)}*`);

    if (orderType === 'takeaway' || orderType === 'delivery') {
      lines.push('', `*${t.waCustomerInfo}:*`);
      if (customer.name.trim()) {
        lines.push(`${t.waName}: ${customer.name.trim()}`);
      }
      if (orderType === 'delivery') {
        if (customer.phone.trim()) {
          lines.push(`${t.waPhone}: ${customer.phone.trim()}`);
        }
        if (selectedZone) {
          lines.push(
            `${t.waZone}: ${getLocalized(selectedZone.name, lang)} (${getLocalized(
              selectedZone.estimatedTime,
              lang
            )})`
          );
        }
        if (customer.address.trim()) {
          lines.push(`${t.waAddress}: ${customer.address.trim()}`);
        }
        if (customer.locationLink) {
          lines.push(`${t.waGpsLink}: ${customer.locationLink}`);
        }
      }
    }

    return getWhatsAppUrl(lines.join('\n'), menu.contact.whatsapp);
  };

  const handleOrderClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!canSubmitOrder) {
      e.preventDefault();
      setShowValidationWarning(true);
      return;
    }
    setShowValidationWarning(false);
  };

  return (
    <div
      dir={dir}
      className="bg-white rounded-3xl border border-neutral-200/90 shadow-xs flex flex-col overflow-hidden"
    >
      {/* Cart Header */}
      <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span
            className="w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0"
            style={{ backgroundColor: menu.colors.primary }}
          >
            <ShoppingBag className="w-4 h-4" />
          </span>
          <h2 className="text-base sm:text-lg font-extrabold text-neutral-950">
            {t.cartTitle}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {cartItems.length > 0 && (
            <button
              type="button"
              onClick={onClearCart}
              aria-label={t.clearCart}
              className="p-2 rounded-xl text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              title={t.clearCart}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          {onCloseMobileDrawer && (
            <button
              type="button"
              onClick={onCloseMobileDrawer}
              aria-label={t.closeBtn}
              className="p-2 rounded-xl bg-neutral-100 text-neutral-700 hover:bg-neutral-200 cursor-pointer lg:hidden"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* High-Contrast Closed Business Notice & Time Slot Scheduler */}
      {!isOpen && (
        <div className="mx-4 mt-4 rounded-2xl bg-neutral-900 text-white p-4 space-y-3">
          <div className="flex items-start gap-2.5">
            <Clock className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="text-xs sm:text-sm font-extrabold text-white">
                {t.closedNoticeTitle}
              </p>
              <p className="text-xs text-neutral-300 leading-relaxed">
                {t.closedNoticeDesc}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-1.5 pt-1">
            <button
              type="button"
              onClick={() => setClosedOrderMode('whenOpens')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-start transition-colors cursor-pointer ${
                closedOrderMode === 'whenOpens'
                  ? 'bg-white text-neutral-950'
                  : 'bg-white/10 text-neutral-200 hover:bg-white/15'
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                  closedOrderMode === 'whenOpens'
                    ? 'border-neutral-950 bg-neutral-950 text-white'
                    : 'border-white/40'
                }`}
              >
                {closedOrderMode === 'whenOpens' && <Check className="w-2.5 h-2.5 stroke-[3]" />}
              </span>
              <span>{t.whenItOpensOption}</span>
            </button>

            <button
              type="button"
              onClick={() => setClosedOrderMode('slot')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-start transition-colors cursor-pointer ${
                closedOrderMode === 'slot'
                  ? 'bg-white text-neutral-950'
                  : 'bg-white/10 text-neutral-200 hover:bg-white/15'
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                  closedOrderMode === 'slot'
                    ? 'border-neutral-950 bg-neutral-950 text-white'
                    : 'border-white/40'
                }`}
              >
                {closedOrderMode === 'slot' && <Check className="w-2.5 h-2.5 stroke-[3]" />}
              </span>
              <span>{t.scheduleSlotOption}</span>
            </button>
          </div>

          {closedOrderMode === 'slot' && (
            <div className="pt-1 space-y-1">
              <label className="block text-[11px] font-bold text-neutral-300">
                {t.selectSlotLabel}
              </label>
              <select
                value={selectedSlot}
                onChange={(e) => setSelectedSlot(e.target.value)}
                dir="ltr"
                className="w-full rounded-xl bg-white/15 border border-white/25 px-3 py-2 text-xs font-bold text-white focus:outline-none"
              >
                {t.timeSlots.map((slot) => (
                  <option key={slot} value={slot} className="text-neutral-900">
                    {slot}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {/* Order Type Segmented Control */}
      {enabledOrderTypes.length > 0 && (
        <div className="px-4 pt-4">
          <p className="text-xs font-extrabold text-neutral-700 mb-2">
            {t.orderTypeTitle}
          </p>
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-neutral-100 rounded-2xl border border-neutral-200/80">
            {enabledOrderTypes.map((type) => {
              const active = orderType === type;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => {
                    onOrderTypeChange(type);
                    setShowValidationWarning(false);
                  }}
                  className={`py-2 px-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
                    active
                      ? 'text-white shadow-xs'
                      : 'text-neutral-600 hover:text-neutral-950'
                  }`}
                  style={active ? { backgroundColor: menu.colors.primary } : undefined}
                >
                  {t.orderTypes[type]}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Body Content */}
      {cartItems.length === 0 ? (
        <div className="p-8 text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-neutral-100 text-neutral-400 flex items-center justify-center mx-auto">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <p className="text-sm font-extrabold text-neutral-800">
            {t.cartEmptyTitle}
          </p>
          <p className="text-xs text-neutral-500 leading-relaxed max-w-xs mx-auto">
            {t.cartEmptySubtitle}
          </p>
        </div>
      ) : (
        <div className="p-4 space-y-4">
          {/* Cart Line Items */}
          <div className="space-y-3 max-h-80 overflow-y-auto pe-0.5">
            {cartItems.map((line) => {
              const unitPrice = computeItemUnitPrice(
                line.item,
                line.selectedOptions
              );
              const optionLabels = formatSelectedOptionsList(
                line.item,
                line.selectedOptions,
                lang
              );
              const noteExpanded =
                Boolean(expandedNotes[line.cartKey]) || Boolean(line.note);

              return (
                <div
                  key={line.cartKey}
                  className="rounded-2xl bg-neutral-50 border border-neutral-200/80 p-3.5 space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="min-w-0 space-y-1">
                      <h3 className="text-xs sm:text-sm font-extrabold text-neutral-950 leading-snug">
                        {getLocalized(line.item.name, lang)}
                      </h3>
                      {optionLabels.length > 0 && (
                        <p className="text-[11px] font-semibold text-neutral-500">
                          {optionLabels.join(' · ')}
                        </p>
                      )}
                    </div>

                    {/* Quantity Stepper */}
                    <div className="inline-flex items-center gap-1.5 bg-white rounded-xl p-1 border border-neutral-200 shrink-0">
                      <button
                        type="button"
                        onClick={() => onDecrementLine(line.cartKey)}
                        aria-label="Decrease quantity"
                        className="w-6 h-6 rounded-lg bg-neutral-100 text-neutral-800 flex items-center justify-center font-bold hover:bg-neutral-200 cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span
                        dir="ltr"
                        className="min-w-[18px] text-center text-xs font-extrabold tabular-nums text-neutral-950"
                      >
                        {line.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => onIncrementLine(line.cartKey)}
                        aria-label="Increase quantity"
                        className="w-6 h-6 rounded-lg text-white flex items-center justify-center font-bold cursor-pointer"
                        style={{ backgroundColor: menu.colors.primary }}
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Bidi-Safe Line Price Equation + "+ Add a note" trigger */}
                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-neutral-200/60">
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedNotes((prev) => ({
                          ...prev,
                          [line.cartKey]: !prev[line.cartKey],
                        }))
                      }
                      className="text-[11px] font-bold hover:underline cursor-pointer"
                      style={{ color: menu.colors.primary }}
                    >
                      {t.addNoteBtn}
                    </button>

                    <LinePriceEquation
                      unitPrice={unitPrice}
                      quantity={line.quantity}
                      lang={lang}
                      className="text-xs text-neutral-600"
                      totalClassName="font-extrabold text-neutral-950"
                    />
                  </div>

                  {noteExpanded && (
                    <input
                      type="text"
                      value={line.note}
                      onChange={(e) =>
                        onUpdateLineNote(line.cartKey, e.target.value)
                      }
                      placeholder={t.notePlaceholder}
                      style={
                        { '--tw-ring-color': menu.colors.primary } as React.CSSProperties
                      }
                      className="w-full rounded-xl bg-white border border-neutral-200 px-3 py-1.5 text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2"
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Upsell Strip: "Complete your order" suggesting 2 items */}
          {upsellItems.length > 0 && (
            <div className="rounded-2xl bg-neutral-50/90 border border-neutral-200/80 p-3.5 space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-neutral-800">
                <Sparkles
                  className="w-3.5 h-3.5 shrink-0"
                  style={{ color: menu.colors.primary }}
                />
                <span>{t.upsellTitle}</span>
              </div>

              <div className="grid grid-cols-1 gap-2">
                {upsellItems.slice(0, 2).map((uItem) => (
                  <div
                    key={uItem.id}
                    className="flex items-center justify-between gap-2.5 bg-white rounded-xl p-2 border border-neutral-200/80"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {uItem.image ? (
                        <img
                          src={uItem.image}
                          alt={getLocalized(uItem.name, lang)}
                          referrerPolicy="no-referrer"
                          loading="lazy"
                          className="w-10 h-10 rounded-lg object-cover shrink-0 bg-neutral-100"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center shrink-0">
                          <Utensils className="w-4 h-4 text-neutral-400" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-neutral-900 line-clamp-2 leading-tight">
                          {getLocalized(uItem.name, lang)}
                        </p>
                        <PriceDisplay
                          amount={uItem.price}
                          lang={lang}
                          className="text-[11px] font-extrabold"
                          style={{ color: menu.colors.primary }}
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onQuickAddUpsell(uItem)}
                      aria-label={`Add ${getLocalized(uItem.name, lang)}`}
                      className="w-7 h-7 rounded-lg text-white flex items-center justify-center shrink-0 shadow-2xs hover:opacity-95 cursor-pointer"
                      style={{ backgroundColor: menu.colors.primary }}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Order Type Specific Customer Inputs */}
          <div className="space-y-3 pt-2 border-t border-neutral-200/80">
            {orderType === 'dineIn' && (
              <div className="space-y-1">
                <label className="block text-xs font-bold text-neutral-700">
                  {t.tableNumberLabel}
                </label>
                <input
                  type="text"
                  value={customer.tableNumber}
                  onChange={(e) =>
                    onCustomerChange({ tableNumber: e.target.value })
                  }
                  placeholder={t.tableNumberPlaceholder}
                  style={
                    { '--tw-ring-color': menu.colors.primary } as React.CSSProperties
                  }
                  className="w-full rounded-xl bg-neutral-50 border border-neutral-200 px-3.5 py-2 text-xs sm:text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:bg-white focus:ring-2"
                />
              </div>
            )}

            {(orderType === 'takeaway' || orderType === 'delivery') && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-neutral-700">
                    {t.customerNameLabel}
                  </label>
                  <input
                    type="text"
                    value={customer.name}
                    onChange={(e) => onCustomerChange({ name: e.target.value })}
                    placeholder={t.customerNamePlaceholder}
                    style={
                      { '--tw-ring-color': menu.colors.primary } as React.CSSProperties
                    }
                    className="w-full rounded-xl bg-neutral-50 border border-neutral-200 px-3.5 py-2 text-xs sm:text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:bg-white focus:ring-2"
                  />
                </div>

                {orderType === 'delivery' && (
                  <>
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-neutral-700">
                        {t.customerPhoneLabel}
                      </label>
                      <input
                        type="tel"
                        dir="ltr"
                        value={customer.phone}
                        onChange={(e) =>
                          onCustomerChange({ phone: e.target.value })
                        }
                        placeholder={t.customerPhonePlaceholder}
                        style={
                          {
                            '--tw-ring-color': menu.colors.primary,
                          } as React.CSSProperties
                        }
                        className="w-full rounded-xl bg-neutral-50 border border-neutral-200 px-3.5 py-2 text-xs sm:text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:bg-white focus:ring-2"
                      />
                    </div>

                    {/* Delivery Zone Selector */}
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-neutral-700">
                        {t.deliveryZoneLabel}
                      </label>
                      <select
                        value={selectedZone?.id || ''}
                        onChange={(e) =>
                          onCustomerChange({ deliveryZoneId: e.target.value })
                        }
                        style={
                          {
                            '--tw-ring-color': menu.colors.primary,
                          } as React.CSSProperties
                        }
                        className="w-full rounded-xl bg-neutral-50 border border-neutral-200 px-3 py-2 text-xs sm:text-sm font-bold text-neutral-900 focus:outline-none focus:bg-white focus:ring-2"
                      >
                        {menu.delivery.zones.map((z) => (
                          <option key={z.id} value={z.id}>
                            {getLocalized(z.name, lang)} —{' '}
                            {formatPriceText(z.fee, lang)} (
                            {getLocalized(z.estimatedTime, lang)})
                          </option>
                        ))}
                      </select>
                      {selectedZone && (
                        <p className="text-[11px] text-neutral-500 pt-0.5">
                          {t.estimatedTimeLabel}{' '}
                          <strong className="text-neutral-800">
                            {getLocalized(selectedZone.estimatedTime, lang)}
                          </strong>
                        </p>
                      )}
                    </div>

                    {/* Delivery Address + Use My Location */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-neutral-700">
                        {t.customerAddressLabel}
                      </label>
                      <textarea
                        rows={2}
                        value={customer.address}
                        onChange={(e) =>
                          onCustomerChange({ address: e.target.value })
                        }
                        placeholder={t.customerAddressPlaceholder}
                        style={
                          {
                            '--tw-ring-color': menu.colors.primary,
                          } as React.CSSProperties
                        }
                        className="w-full rounded-xl bg-neutral-50 border border-neutral-200 px-3.5 py-2 text-xs sm:text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:bg-white focus:ring-2 resize-none"
                      />

                      <button
                        type="button"
                        onClick={handleUseMyLocation}
                        disabled={locating}
                        className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-neutral-300 bg-white hover:bg-neutral-50 text-xs font-bold text-neutral-800 transition-colors cursor-pointer"
                      >
                        <MapPin
                          className="w-3.5 h-3.5 shrink-0"
                          style={{ color: menu.colors.primary }}
                        />
                        <span>
                          {locating ? t.locatingStatus : t.useMyLocationBtn}
                        </span>
                      </button>

                      {customer.locationLink && (
                        <p className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5 shrink-0" />
                          <span>{t.locationAttached}</span>
                        </p>
                      )}

                      {locationError && (
                        <p className="text-[11px] font-bold text-rose-600">
                          {t.locationError}
                        </p>
                      )}
                    </div>
                  </>
                )}

                {/* Forget My Details Link */}
                {(hasSavedDetails || customer.name || customer.phone || customer.address) && (
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <span className="text-[11px] text-neutral-400">
                      {t.detailsSavedHint}
                    </span>
                    <button
                      type="button"
                      onClick={onForgetDetails}
                      className="text-[11px] font-bold text-rose-600 hover:underline cursor-pointer shrink-0"
                    >
                      {t.forgetDetailsBtn}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Totals & Delivery Rules Summary */}
          <div className="rounded-2xl bg-neutral-50 border border-neutral-200/80 p-3.5 space-y-2">
            <div className="flex items-center justify-between text-xs sm:text-sm text-neutral-600">
              <span>{t.subtotalLabel}</span>
              <PriceDisplay
                amount={subtotal}
                lang={lang}
                className="font-bold text-neutral-900"
              />
            </div>

            {orderType === 'delivery' && (
              <>
                <div className="flex items-center justify-between text-xs sm:text-sm text-neutral-600">
                  <span>{t.deliveryFeeLabel}</span>
                  {isFreeDelivery ? (
                    <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-xs font-extrabold">
                      {t.freeDeliveryBadge}
                    </span>
                  ) : (
                    <PriceDisplay
                      amount={deliveryFee}
                      lang={lang}
                      className="font-bold text-neutral-900"
                    />
                  )}
                </div>

                {/* Free Delivery Threshold Banner */}
                {menu.delivery.freeDeliveryThreshold > 0 && (
                  <div className="text-[11px] font-semibold text-neutral-600 pt-0.5">
                    {isFreeDelivery ? (
                      <span className="text-emerald-700 font-bold">
                        ✓ {t.freeDeliveryUnlocked}
                      </span>
                    ) : (
                      <span>
                        {t.freeDeliveryProgress}{' '}
                        <PriceDisplay
                          amount={menu.delivery.freeDeliveryThreshold}
                          lang={lang}
                          className="font-bold text-neutral-900"
                        />
                      </span>
                    )}
                  </div>
                )}
              </>
            )}

            <div className="pt-2 border-t border-neutral-200 flex items-center justify-between text-sm sm:text-base font-extrabold text-neutral-950">
              <span>{t.totalLabel}</span>
              <PriceDisplay
                amount={grandTotal}
                lang={lang}
                className="text-base sm:text-lg font-extrabold"
                style={{ color: menu.colors.primary }}
              />
            </div>
          </div>

          {/* Minimum Delivery Order Blocking Alert */}
          {isBelowMinDeliveryOrder && (
            <div className="rounded-xl bg-rose-950 text-white p-3 flex items-center gap-2.5 text-xs font-bold">
              <AlertCircle className="w-4 h-4 text-rose-300 shrink-0" />
              <div>
                <span>{t.minOrderWarning} </span>
                <PriceDisplay
                  amount={menu.delivery.minimumOrder}
                  lang={lang}
                  className="font-extrabold underline"
                />
              </div>
            </div>
          )}

          {/* Missing Required Fields Warning */}
          {(showValidationWarning || isMissingRequiredFields) &&
            !isBelowMinDeliveryOrder &&
            isMissingRequiredFields && (
              <div className="rounded-xl bg-neutral-900 text-white p-3 flex items-center gap-2.5 text-xs font-bold">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{t.missingFieldsWarning}</span>
              </div>
            )}

          {/* Primary Actions: Order on WhatsApp + Show to Waiter */}
          <div className="space-y-2 pt-1">
            <a
              href={canSubmitOrder ? buildWhatsAppOrderUrl() : '#'}
              target={canSubmitOrder ? '_blank' : undefined}
              rel={canSubmitOrder ? 'noopener noreferrer' : undefined}
              onClick={handleOrderClick}
              aria-disabled={!canSubmitOrder}
              className={`w-full py-3.5 px-5 rounded-2xl text-sm font-extrabold text-white flex items-center justify-center gap-2 shadow-md transition-opacity ${
                canSubmitOrder
                  ? 'hover:opacity-95 cursor-pointer'
                  : 'opacity-50 cursor-not-allowed'
              }`}
              style={{ backgroundColor: menu.colors.primary }}
            >
              <MessageCircle className="w-4.5 h-4.5 shrink-0" />
              <span>{t.sendOrderWhatsapp}</span>
            </a>

            <button
              type="button"
              onClick={onOpenWaiterModal}
              className="w-full py-3 px-4 rounded-2xl text-xs sm:text-sm font-extrabold text-neutral-900 bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <UserCheck className="w-4 h-4 shrink-0" style={{ color: menu.colors.primary }} />
              <span>{t.showToWaiterBtn}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
