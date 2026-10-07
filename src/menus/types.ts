export type Language = 'ar' | 'fr' | 'en';

export type LocalizedString = Record<Language, string> | string;

export type MenuBadge = 'new' | 'vegetarian' | 'spicy' | 'soldout';

export interface MenuItem {
  id: string;
  name: Record<Language, string>;
  description: Record<Language, string>;
  price: number;
  image?: string;
  badges?: MenuBadge[];
}

export interface MenuCategory {
  id: string;
  name: Record<Language, string>;
  items: MenuItem[];
}

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
  categories: MenuCategory[];
}

export function getLocalized(value: LocalizedString, lang: Language): string {
  if (typeof value === 'string') {
    return value;
  }
  return value[lang] || value.fr || value.ar || value.en || '';
}
