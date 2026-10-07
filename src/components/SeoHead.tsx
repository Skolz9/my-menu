import React, { useEffect } from 'react';
import { config } from '../config';
import { translations } from '../i18n/translations';
import { getMenuBySlug, getLocalized, type ClientMenu, type Language } from '../menus';

export interface RouteSeoMetadata {
  title: string;
  description: string;
  canonicalUrl: string;
  ogImage: string;
  ogType: 'website' | 'restaurant.menu';
  robots: 'index, follow' | 'noindex, nofollow';
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

export function buildLandingJsonLd(lang: Language = 'ar') {
  const t = translations[lang];
  const cleanPhone = `+${config.whatsappNumber.replace(/[^0-9]/g, '')}`;

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: config.brandName,
    legalName: config.agencyName,
    url: config.baseUrl,
    logo: `${config.baseUrl}/favicon.svg`,
    email: config.email,
    telephone: cleanPhone,
    sameAs: [config.instagram],
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Agadir',
      addressCountry: 'MA',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: cleanPhone,
      contactType: 'customer service',
      areaServed: 'MA',
      availableLanguage: ['Arabic', 'French', 'English'],
    },
  };

  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: `${config.brandName} — Menu QR Code Café & Restaurant Maroc`,
    provider: {
      '@type': 'Organization',
      name: config.brandName,
      url: config.baseUrl,
    },
    areaServed: {
      '@type': 'Country',
      name: 'Morocco',
    },
    serviceType: 'Digital QR Code Menu Platform',
    description: t.seo.description,
    offers: {
      '@type': 'Offer',
      price: String(config.pricing.monthlyPrice),
      priceCurrency: config.pricing.currency,
      availability: 'https://schema.org/InStock',
      url: `${config.baseUrl}/#pricing`,
    },
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: t.faq.items.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  };

  return [organizationSchema, serviceSchema, faqSchema];
}

export function buildMenuJsonLd(menu: ClientMenu, lang: Language = menu.defaultLanguage) {
  const menuUrl = `${config.baseUrl}/m/${menu.slug}`;
  const cleanWhatsapp = `+${menu.contact.whatsapp.replace(/[^0-9]/g, '')}`;

  const menuSchema = {
    '@context': 'https://schema.org',
    '@type': 'Menu',
    '@id': `${menuUrl}#menu`,
    name: `${menu.name} — Menu Digital`,
    url: menuUrl,
    inLanguage: menu.languages,
    hasMenuSection: menu.categories.map((cat) => ({
      '@type': 'MenuSection',
      name: getLocalized(cat.name, lang),
      hasMenuItem: cat.items.map((item) => ({
        '@type': 'MenuItem',
        name: getLocalized(item.name, lang),
        description: getLocalized(item.description, lang),
        image: item.image || menu.logo,
        offers: {
          '@type': 'Offer',
          price: String(item.price),
          priceCurrency: menu.currency,
          availability: item.badges?.includes('soldout')
            ? 'https://schema.org/OutOfStock'
            : 'https://schema.org/InStock',
        },
      })),
    })),
  };

  const restaurantSchema = {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: menu.name,
    description: getLocalized(menu.tagline, lang),
    image: menu.logo,
    url: menuUrl,
    telephone: menu.contact.phone || cleanWhatsapp,
    priceRange: 'MAD',
    servesCuisine: ['Moroccan', 'Cafe', 'Breakfast', 'Pizza', 'Desserts'],
    address: {
      '@type': 'PostalAddress',
      streetAddress: getLocalized(menu.contact.address, lang),
      addressLocality: menu.city,
      addressCountry: 'MA',
    },
    openingHours: getLocalized(menu.hours, lang),
    hasMenu: menuSchema,
  };

  return [restaurantSchema, menuSchema];
}

export function getRouteSeoData(pathname: string, lang: Language = 'ar'): RouteSeoMetadata {
  const normalizedPath = pathname === '/' ? '/' : pathname.replace(/\/+$/, '');
  const t = translations[lang];

  if (normalizedPath === '/') {
    return {
      title: t.seo.title,
      description: t.seo.description,
      canonicalUrl: `${config.baseUrl}/`,
      ogImage: config.images.ogBanner,
      ogType: 'website',
      robots: 'index, follow',
      jsonLd: buildLandingJsonLd(lang),
    };
  }

  if (normalizedPath.startsWith('/m/')) {
    const slug = normalizedPath.replace('/m/', '').split('/')[0];
    const menu = getMenuBySlug(slug);
    if (menu) {
      const tagline = getLocalized(menu.tagline, lang);
      return {
        title: `${menu.name} (${menu.city}) — Menu QR Digital | ${config.brandName}`,
        description: `${menu.name} à ${menu.city} : ${tagline}. Consultez notre carte digitale complète avec prix en ${menu.currency}.`,
        canonicalUrl: `${config.baseUrl}/m/${menu.slug}`,
        ogImage: menu.logo || config.images.ogBanner,
        ogType: 'restaurant.menu',
        robots: 'index, follow',
        jsonLd: buildMenuJsonLd(menu, lang),
      };
    }
  }

  if (normalizedPath === '/admin/qr') {
    return {
      title: `QR Code Studio — ${config.brandName} Admin`,
      description: `Outil privé de génération de QR codes et chevalets A5 pour ${config.brandName}.`,
      canonicalUrl: `${config.baseUrl}/admin/qr`,
      ogImage: config.images.ogBanner,
      ogType: 'website',
      robots: 'noindex, nofollow',
    };
  }

  return {
    title: `${t.notFound.title} | ${config.brandName}`,
    description: t.notFound.description,
    canonicalUrl: `${config.baseUrl}${normalizedPath}`,
    ogImage: config.images.ogBanner,
    ogType: 'website',
    robots: 'noindex, nofollow',
  };
}

export const SeoHead: React.FC<{ pathname: string; lang: Language }> = ({ pathname, lang }) => {
  const seo = getRouteSeoData(pathname, lang);

  useEffect(() => {
    if (typeof document === 'undefined') return;

    document.title = seo.title;

    const setMeta = (selector: string, attrName: string, attrValue: string, content: string) => {
      let el = document.head.querySelector(selector) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attrName, attrValue);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    setMeta('meta[name="description"]', 'name', 'description', seo.description);
    setMeta('meta[name="robots"]', 'name', 'robots', seo.robots);
    setMeta('meta[property="og:title"]', 'property', 'og:title', seo.title);
    setMeta('meta[property="og:description"]', 'property', 'og:description', seo.description);
    setMeta('meta[property="og:url"]', 'property', 'og:url', seo.canonicalUrl);
    setMeta('meta[property="og:image"]', 'property', 'og:image', seo.ogImage);
    setMeta('meta[property="og:type"]', 'property', 'og:type', seo.ogType);
    setMeta('meta[name="twitter:title"]', 'name', 'twitter:title', seo.title);
    setMeta('meta[name="twitter:description"]', 'name', 'twitter:description', seo.description);
    setMeta('meta[name="twitter:image"]', 'name', 'twitter:image', seo.ogImage);

    let canonical = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', seo.canonicalUrl);
  }, [seo]);

  if (!seo.jsonLd) return null;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(seo.jsonLd) }}
    />
  );
};
