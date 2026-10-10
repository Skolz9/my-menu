# My Menu — Plateforme Menu QR Digital & Commande WhatsApp au Maroc (by WebAtlass)

Site vitrine marketing + plateforme complète de menus QR & commande sur WhatsApp pour cafés et restaurants au Maroc (**My Menu** par **WebAtlass**).

- **Stack** : Vite + React + TypeScript + Tailwind CSS + React Router
- **Prerendering statique (SSG)** : Chaque route (`/`, `/m/:slug`, `/admin/qr`, `/404`) est pré-rendue en HTML statique au moment du `npm run build` via `scripts/prerender.ts` + génération automatique de `sitemap.xml` et `robots.txt`.
- **Zéro backend / Zéro base de données** : Déploiement instantané sur Vercel sans configuration supplémentaire.

---

## 1. Modifier votre numéro WhatsApp, vos tarifs, vos images et vos coordonnées de paiement (`src/config.ts`)

Toutes les informations de votre agence sont centralisées dans **`src/config.ts`** (Single Source of Truth) :

- `whatsappNumber`: `"212633226714"` (format international sans `+` ni espaces — utilisé partout sur la landing page : bouton flottant, Hero, Tarifs, Footer, JSON-LD).
- `phoneDisplay`: `"06 33 22 67 14"`
- `baseUrl`: URL finale de votre site déployé. **Important** : mettez à jour `baseUrl` avec votre domaine final avant d'imprimer les QR codes clients.
- `pricing`:
  - `setupFee`: frais uniques de création (`300`)
  - `monthlyPrice`: tarif mensuel (`99`)
  - `yearlyPrice`: tarif annuel (`990`)
  - `yearlyDiscountPercent`: `17`
- `payment`:
  - `rib`: votre RIB bancaire
  - `holder`: le nom du titulaire du compte
  - `advancePercent`: `50`

---

## 2. Ajouter et configurer un menu client (`src/menus/{slug}.ts`)

Chaque client correspond à **un seul fichier** dans `src/menus/{slug}.ts`, automatiquement détecté et enregistré via `import.meta.glob`.

### A. Couleurs & Identité (`colors`)
Les couleurs `primary`, `accent` et `background` définies dans le fichier menu sont automatiquement appliquées à :
- L'onglet de catégorie actif
- Les boutons (`+`, commande WhatsApp, bannière promo)
- Les prix (`18 د.م` en AR, `18 MAD` en FR/EN)
- La barre de panier mobile et les anneaux de focus (`focus:ring`).

### B. Horaires d'ouverture hebdomadaires (`weeklyHours`)
Définissez les horaires d'ouverture jour par jour au format 24h (`HH:MM`) pour calculer automatiquement le statut **Ouvert / Fermé** en direct :

```ts
weeklyHours: {
  monday: { open: '07:30', close: '23:30' },
  tuesday: { open: '07:30', close: '23:30' },
  wednesday: { open: '07:30', close: '23:30' },
  thursday: { open: '07:30', close: '23:30' },
  friday: { open: '07:30', close: '23:59' },
  saturday: { open: '08:00', close: '23:59' },
  sunday: { open: '08:00', close: '23:30', closed: false },
}
```
Si l'établissement est fermé, une bannière à fort contraste permet au client de commander pour l'ouverture ou de planifier un créneau horaire.

### C. Modes de commande (`orderTypes`) & Zones de livraison (`delivery`)
Activez ou désactivez chaque mode de commande pour le client :

```ts
orderTypes: {
  dineIn: true,    // Sur place (numéro de table optionnel)
  takeaway: true,  // À emporter (nom du client requis)
  delivery: true,  // Livraison (nom, téléphone, adresse, GPS Google Maps, zone)
},
delivery: {
  minimumOrder: 50,           // Commande bloquée en livraison si sous-total < 50 MAD
  freeDeliveryThreshold: 120, // Livraison gratuite dès 120 MAD d'achat
  zones: [
    {
      id: 'marina-centre',
      name: { ar: 'مارينا ووسط المدينة', fr: 'Marina & Centre-Ville', en: 'Marina & Center' },
      fee: 10,
      estimatedTime: { ar: '20 إلى 30 دقيقة', fr: '20 à 30 min', en: '20 to 30 mins' },
    },
  ],
}
```

### D. Bannière Promo (`promoBanner`), Populaires (`popular`) & Ventes additionnelles (`upsellItemIds`)
- **`promoBanner`** : affiche une carte promotionnelle en haut du menu avec titre, sous-titre, badge, image et bouton qui scrolle vers `targetCategoryId`.
- **`popular: true`** : place automatiquement l'article dans la section **"Les plus populaires"** (`الأكثر طلباً` / `Most Popular`) et ajoute le badge Populaire.
- **`upsellItemIds: ['item-id-1', 'item-id-2']`** : affiche jusqu'à 2 suggestions dans le panier sous **"Complétez votre commande"** pour augmenter le panier moyen.

### E. Options d'articles (`options`) & Allergènes (`allergens`)
Chaque article peut définir des allergènes en 3 langues ainsi que des groupes d'options à choix unique (`single`, ex: Taille, Cuisson) ou choix multiples (`multiple`, ex: Suppléments) avec supplément de prix :

```ts
allergens: {
  ar: ['الحليب (اللاكتوز)'],
  fr: ['Lait (lactose)'],
  en: ['Milk (lactose)'],
},
options: [
  {
    id: 'size',
    name: { ar: 'الحجم', fr: 'Taille', en: 'Size' },
    type: 'single',
    required: true,
    choices: [
      { id: 'regular', name: { ar: 'عادي', fr: 'Classique', en: 'Regular' }, price: 0 },
      { id: 'large', name: { ar: 'كبير', fr: 'Grand', en: 'Large' }, price: 6 },
    ],
  },
  {
    id: 'extras',
    name: { ar: 'إضافات', fr: 'Suppléments', en: 'Extras' },
    type: 'multiple',
    choices: [
      { id: 'oat-milk', name: { ar: 'حليب الشوفان', fr: 'Lait d’avoine', en: 'Oat milk' }, price: 5 },
    ],
  },
]
```

---

## 3. Générer et imprimer les QR codes & Chevalets de table A5 (`/admin/qr`)

Rendez-vous sur **`/admin/qr`** (page privée avec balise `noindex, nofollow`, exclue du `sitemap.xml` et bloquée dans `robots.txt`) pour exporter :
- **Download PNG** / **Download SVG**
- **Download A5 PDF** / **Print A5 Sheet** (chevalet de table A5 prêt à imprimer)
- **Download all QR codes (ZIP)**

---

## 4. Déployer sur Vercel

1. Poussez ce dépôt sur GitHub / GitLab.
2. Importez le projet dans **Vercel** (`Framework Preset: Vite`, `Build Command: npm run build`, `Output Directory: dist`).
3. Le fichier `vercel.json` inclus sert automatiquement chaque page pré-rendue.
