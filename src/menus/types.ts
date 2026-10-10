export type Language = 'ar' | 'fr' | 'en';

export type LocalizedString = Record<Language, string> | string;

export type MenuBadge = 'new' | 'popular' | 'vegetarian' | 'spicy' | 'soldout';

export type DayOfWeek =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

export interface DailyHours {
  open: string; // "HH:MM" in 24h format, e.g. "08:00"
  close: string; // "HH:MM" in 24h format, e.g. "23:30"
  closed?: boolean;
}

export type WeeklyHours = Record<DayOfWeek, DailyHours>;

export interface MenuItemOptionChoice {
  id: string;
  name: Record<Language, string>;
  price: number; // Extra price in MAD (0 if included)
}

export interface MenuItemOptionGroup {
  id: string;
  name: Record<Language, string>;
  type: 'single' | 'multiple';
  required?: boolean;
  choices: MenuItemOptionChoice[];
}

export interface MenuItem {
  id: string;
  name: Record<Language, string>;
  description: Record<Language, string>;
  price: number;
  image?: string;
  popular?: boolean;
  badges?: MenuBadge[];
  allergens?: Record<Language, string[]>;
  options?: MenuItemOptionGroup[];
}

export interface MenuCategory {
  id: string;
  name: Record<Language, string>;
  items: MenuItem[];
}

export interface PromoBanner {
  enabled: boolean;
  badge?: Record<Language, string>;
  title: Record<Language, string>;
  subtitle: Record<Language, string>;
  buttonText: Record<Language, string>;
  image: string;
  targetCategoryId?: string;
}

export interface DeliveryZone {
  id: string;
  name: Record<Language, string>;
  fee: number;
  estimatedTime: Record<Language, string>;
}

export interface DeliveryConfig {
  minimumOrder: number;
  freeDeliveryThreshold: number;
  zones: DeliveryZone[];
}

export interface OrderTypesConfig {
  dineIn: boolean;
  takeaway: boolean;
  delivery: boolean;
}

export type OrderType = 'dineIn' | 'takeaway' | 'delivery';

export interface ClientMenu {
  slug: string;
  name: string;
  logo: string;
  tagline: LocalizedString;
  city: string;
  languages: Language[];
  defaultLanguage: Language;
  colors: {
    primary: string;
    accent: string;
    background: string;
  };
  currency: 'MAD';
  contact: {
    whatsapp: string;
    phone: string;
    instagram: string;
    mapsLink: string;
    address: LocalizedString;
  };
  hours: LocalizedString;
  weeklyHours: WeeklyHours;
  promoBanner?: PromoBanner;
  upsellItemIds?: string[];
  orderTypes: OrderTypesConfig;
  delivery: DeliveryConfig;
  categories: MenuCategory[];
}

export function getLocalized(value: LocalizedString, lang: Language): string {
  if (typeof value === 'string') {
    return value;
  }
  return value[lang] || value.fr || value.ar || value.en || '';
}

export function getCurrencyLabel(lang: Language): string {
  return lang === 'ar' ? 'د.م' : 'MAD';
}

/**
 * Formats a price consistently per language:
 * - AR: "18 د.م"
 * - FR / EN: "18 MAD"
 */
export function formatPriceText(amount: number, lang: Language): string {
  const formattedNumber = Number.isInteger(amount) ? String(amount) : amount.toFixed(2);
  return `${formattedNumber} ${getCurrencyLabel(lang)}`;
}

const JS_DAY_TO_KEY: DayOfWeek[] = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
];

export function checkBusinessOpenStatus(
  weeklyHours?: WeeklyHours,
  now: Date = new Date()
): {
  isOpen: boolean;
  todayKey: DayOfWeek;
  todayHours: DailyHours | null;
} {
  const todayKey = JS_DAY_TO_KEY[now.getDay()];
  if (!weeklyHours || !weeklyHours[todayKey]) {
    return { isOpen: true, todayKey, todayHours: null };
  }

  const todayHours = weeklyHours[todayKey];
  if (todayHours.closed) {
    return { isOpen: false, todayKey, todayHours };
  }

  const [openH, openM] = todayHours.open.split(':').map(Number);
  const [closeH, closeM] = todayHours.close.split(':').map(Number);
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const openMinutes = openH * 60 + openM;
  let closeMinutes = closeH * 60 + closeM;

  // Handle past-midnight closing times (e.g. 01:00)
  if (closeMinutes <= openMinutes) {
    closeMinutes += 24 * 60;
  }

  const isOpen = currentMinutes >= openMinutes && currentMinutes <= closeMinutes;
  return { isOpen, todayKey, todayHours };
}
