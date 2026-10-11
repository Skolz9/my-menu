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
  id?: string;
  ownerId?: string;
  ownerEmail?: string;
  slug: string;
  name: string;
  logo: string;
  cover?: string;
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
  tableCount?: number;
  extraTables?: string[];
  tableLabels?: string[];
  isActive?: boolean;
  acceptingOrders?: boolean;
  categories: MenuCategory[];
}

/**
 * Automatically derives the list of table labels for a business:
 * "1" .. String(tableCount) followed by any non-empty extraTables (e.g. "Terrasse 1", "VIP").
 */
export function deriveTableLabels(
  tableCount: number = 10,
  extraTables: string[] = []
): string[] {
  const safeCount = Math.max(0, Math.min(500, Math.floor(Number(tableCount) || 0)));
  const numbered = Array.from({ length: safeCount }, (_, i) => String(i + 1));
  const extras = (extraTables || [])
    .map((t) => String(t).trim())
    .filter((t) => t.length > 0 && !numbered.includes(t));
  return [...numbered, ...extras];
}

/**
 * Validates a URL query parameter `?t={label}` against the business's derived table labels.
 * Returns the canonical table label if valid, or null if invalid.
 */
export function validateTableLabel(
  rawLabel: string | null | undefined,
  tableCount: number = 10,
  extraTables: string[] = []
): string | null {
  if (!rawLabel) return null;
  const trimmed = rawLabel.trim();
  if (!trimmed) return null;
  const allowed = deriveTableLabels(tableCount, extraTables);
  const match = allowed.find((t) => t.toLowerCase() === trimmed.toLowerCase());
  return match || null;
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
