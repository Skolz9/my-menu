import React from 'react';
import { getCurrencyLabel, type Language } from '../menus/types';

export const PriceDisplay: React.FC<{
  amount: number;
  lang: Language;
  prefix?: string;
  className?: string;
  style?: React.CSSProperties;
}> = ({ amount, lang, prefix = '', className = '', style }) => {
  const numStr = Number.isInteger(amount) ? String(amount) : amount.toFixed(2);
  const currency = getCurrencyLabel(lang);

  return (
    <span
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
      className={`inline-flex items-baseline gap-1 whitespace-nowrap tabular-nums ${className}`}
      style={style}
    >
      {prefix && <span dir="ltr">{prefix}</span>}
      <span dir="ltr">{numStr}</span>
      <span>{currency}</span>
    </span>
  );
};

/**
 * Renders a bidi-safe line equation:
 * In AR (RTL): "18 د.م × 1 = 18 د.م" (reading right-to-left naturally)
 * In FR/EN (LTR): "18 MAD × 1 = 18 MAD"
 */
export const LinePriceEquation: React.FC<{
  unitPrice: number;
  quantity: number;
  lang: Language;
  className?: string;
  totalClassName?: string;
}> = ({ unitPrice, quantity, lang, className = '', totalClassName = 'font-extrabold text-neutral-900' }) => {
  const total = unitPrice * quantity;
  return (
    <span
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
      className={`inline-flex flex-wrap items-center gap-1.5 tabular-nums ${className}`}
    >
      <PriceDisplay amount={unitPrice} lang={lang} />
      <span dir="ltr" aria-hidden="true">×</span>
      <span dir="ltr">{quantity}</span>
      <span dir="ltr" aria-hidden="true">=</span>
      <PriceDisplay amount={total} lang={lang} className={totalClassName} />
    </span>
  );
};
