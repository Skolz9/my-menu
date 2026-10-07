export type PaymentMethodId =
  | 'virement'
  | 'especes'
  | 'cih_pay_wafacash_cashplus'
  | 'mobile_wallet';

export interface TrustedPartnerPlaceholder {
  id: string;
  name: string;
  city: string;
  shape: 'circle' | 'hexagon' | 'diamond' | 'square' | 'arch' | 'shield';
  accent: string;
}

export const config = {
  brandName: 'My Menu',
  agencyName: 'WebAtlass',
  agencyUrl: 'https://webatlass.com',
  whatsappNumber: '212633226714', // International format, no plus or spaces
  phoneDisplay: '06 33 22 67 14',
  instagram: 'https://instagram.com/mymenu.ma',
  instagramHandle: '@mymenu.ma',
  email: 'contact@webatlass.com',
  baseUrl: 'https://my-menu-livid.vercel.app/',
  defaultLanguage: 'ar' as 'ar' | 'fr' | 'en',

  colors: {
    primary: '#6BBF3A',
    primaryHover: '#5aa630',
    darkSection: '#0F1410',
  },

  pricing: {
    setupFee: 300, // Frais de mise en service unique (MAD)
    monthlyPrice: 99, // MAD / mois
    yearlyPrice: 990, // MAD / an (~82.5 MAD/mois, -17%)
    yearlyDiscountPercent: 17,
    currency: 'MAD',
  },

  payment: {
    methods: [
      'virement',
      'especes',
      'cih_pay_wafacash_cashplus',
      'mobile_wallet',
    ] as PaymentMethodId[],
    rib: 'XXXX',
    holder: 'XXXX',
    advancePercent: 50,
  },

  stats: [
    { value: 49000, prefix: '+', suffix: '', key: 'scans' as const },
    { value: 120, prefix: '+', suffix: '', key: 'cafes' as const },
    { value: 0, prefix: '', suffix: '%', key: 'commission' as const },
    { value: 7, prefix: '', suffix: '/7', key: 'support' as const },
  ],

  /**
   * Neutral geometric placeholder cafes for the "Ils nous font confiance" strip.
   * No real third-party brand logos are used.
   */
  trustedByPlaceholders: [
    { id: 'atlas', name: 'Café Atlas', city: 'Agadir', shape: 'arch', accent: '#6BBF3A' },
    { id: 'marina', name: 'Marina Lounge', city: 'Agadir', shape: 'circle', accent: '#0EA5E9' },
    { id: 'zitoune', name: 'Dar Zitoune', city: 'Marrakech', shape: 'hexagon', accent: '#D97706' },
    { id: 'kasbah', name: 'Kasbah Roast', city: 'Rabat', shape: 'diamond', accent: '#10B981' },
    { id: 'anza', name: 'Anza Surf Café', city: 'Agadir', shape: 'square', accent: '#6366F1' },
    { id: 'corniche', name: 'Bistro Corniche', city: 'Casablanca', shape: 'shield', accent: '#F43F5E' },
  ] as TrustedPartnerPlaceholder[],

  /**
   * All external royalty-free Unsplash placeholder URLs live here
   * so they can be replaced in one place at any time.
   */
  images: {
    // Hero image: smiling barista/waiter in apron holding a smartphone/menu in a bright cafe
    heroBarista:
      'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=900&q=80&fm=webp',
    // Dark section preview photo: cozy modern cafe table / interior
    showcaseCafe:
      'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=900&q=80&fm=webp',
    // OpenGraph social share image
    ogBanner:
      'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1200&q=80&fm=webp',

    // Demo menu ("Marina Sol Café — Agadir") images
    demoMenu: {
      logo: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=300&q=80&fm=webp',
      cover: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200&q=80&fm=webp',
      items: {
        espresso:
          'https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?auto=format&fit=crop&w=500&q=80&fm=webp',
        nousNous:
          'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=500&q=80&fm=webp',
        cappuccino:
          'https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&w=500&q=80&fm=webp',
        mintTea:
          'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=500&q=80&fm=webp',
        icedLatte:
          'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=500&q=80&fm=webp',

        orangeJuice:
          'https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=500&q=80&fm=webp',
        avocadoZaazaa:
          'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?auto=format&fit=crop&w=500&q=80&fm=webp',
        panacheFruits:
          'https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=500&q=80&fm=webp',
        lemonMint:
          'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=500&q=80&fm=webp',

        ftourBeldi:
          'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=500&q=80&fm=webp',
        brunchMarina:
          'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=500&q=80&fm=webp',
        omeletteKhlii:
          'https://images.unsplash.com/photo-1510693206972-df098062cb71?auto=format&fit=crop&w=500&q=80&fm=webp',
        pancakesAmlou:
          'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=500&q=80&fm=webp',

        pizzaMargherita:
          'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?auto=format&fit=crop&w=500&q=80&fm=webp',
        pizzaSeafood:
          'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=500&q=80&fm=webp',
        pizzaChicken:
          'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=500&q=80&fm=webp',
        pizzaFourCheese:
          'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=500&q=80&fm=webp',

        tiramisu:
          'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=500&q=80&fm=webp',
        cheesecake:
          'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=500&q=80&fm=webp',
        fondantChocolat:
          'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=500&q=80&fm=webp',
        crepeAmlou:
          'https://images.unsplash.com/photo-1519676867240-f03562e64548?auto=format&fit=crop&w=500&q=80&fm=webp',
      },
    },
  },
};

/**
 * Helper to generate a WhatsApp click-to-chat URL using the single-source-of-truth
 * agency WhatsApp number (or a client restaurant's own number when specified).
 */
export function getWhatsAppUrl(message: string, phone: string = config.whatsappNumber): string {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}
