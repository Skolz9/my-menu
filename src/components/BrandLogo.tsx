import React from 'react';
import { QrCode } from 'lucide-react';
import { config } from '../config';

export const BrandLogo: React.FC<{
  variant?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
}> = ({ variant = 'light', size = 'md' }) => {
  const boxSize =
    size === 'sm' ? 'w-7 h-7 rounded-lg' : size === 'lg' ? 'w-10 h-10 rounded-xl' : 'w-8 h-8 rounded-xl';
  const iconSize = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-5 h-5' : 'w-4.5 h-4.5';
  const textSize =
    size === 'sm' ? 'text-base' : size === 'lg' ? 'text-xl' : 'text-lg';
  const textColor = variant === 'dark' ? 'text-white' : 'text-neutral-900';

  return (
    <span className="inline-flex items-center gap-2.5 select-none">
      <span
        className={`${boxSize} inline-flex items-center justify-center text-white shadow-xs shrink-0`}
        style={{ backgroundColor: config.colors.primary }}
        aria-hidden="true"
      >
        <QrCode className={iconSize} strokeWidth={2.2} />
      </span>
      <span className={`${textSize} font-extrabold tracking-tight ${textColor} whitespace-nowrap`}>
        {config.brandName}
      </span>
    </span>
  );
};
