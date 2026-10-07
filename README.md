# My Menu — Plateforme Menu QR Digital au Maroc (by WebAtlass)

Site vitrine marketing + plateforme de menus QR statiques ultra-rapides pour cafés et restaurants au Maroc (**My Menu** par **WebAtlass**).

- **Stack** : Vite + React + TypeScript + Tailwind CSS + React Router
- **Prerendering statique (SSG)** : Chaque route (`/`, `/m/:slug`, `/admin/qr`, `/404`) est pré-rendue en HTML statique au moment du `npm run build` via `scripts/prerender.ts` + génération automatique de `sitemap.xml` et `robots.txt`.
- **Zéro backend / Zéro base de données** : Déploiement instantané sur Vercel sans configuration supplémentaire.

---

## 1. Modifier votre numéro WhatsApp, vos tarifs, vos images et vos coordonnées de paiement (`src/config.ts`)

Toutes les informations de votre agence sont centralisées dans **`src/config.ts`** (Single Source of Truth) :

- `whatsappNumber`: `"212633226714"` (format international sans `+` ni espaces — utilisé partout : bouton flottant, Hero, Tarifs, Footer, JSON-LD).
- `phoneDisplay`: `"06 33 22 67 14"`
- `baseUrl`: URL finale de votre site déployé (ex: `"https://mymenu.ma"`). **Important** : mettez à jour `baseUrl` avec votre domaine final avant d'imprimer les QR codes clients.
- `pricing`:
  - `setupFee`: frais uniques de création (MAD)
  - `monthlyPrice`: tarif mensuel (MAD)
  - `yearlyPrice`: tarif annuel (MAD)
  - `yearlyDiscountPercent`: `17`
- `payment`:
  - `rib`: votre RIB bancaire
  - `holder`: le nom du titulaire du compte
  - `advancePercent`: `50` (avance de 50% au démarrage)
- `images`: toutes les URLs des photos du site et du menu démo pour pouvoir les remplacer facilement.

---

## 2. Ajouter un nouveau client (`src/menus/{slug}.ts`)

Chaque client correspond à **un seul fichier** dans le dossier `src/menus/`. Il est automatiquement détecté et enregistré grâce à `import.meta.glob` (aucun routeur ni index à modifier manuellement).

### Étapes pour ajouter un client :
1. Dupliquez le fichier `src/menus/demo.ts` et renommez-le avec le slug souhaité, par exemple `src/menus/cafe-atlas.ts`.
2. Modifiez la propriété `slug: 'cafe-atlas'` ainsi que le nom, le logo, les couleurs (`primary`, `accent`, `background`), les coordonnées (`whatsapp`, `phone`, `instagram`, `mapsLink`, `address`), les horaires (`hours`) et les catégories/articles (`categories`).
3. Lancez `npm run build` (ou poussez sur GitHub/Vercel) :
   - La page `/m/cafe-atlas` est automatiquement créée et pré-rendue dans `dist/m/cafe-atlas/index.html` avec ses balises SEO et données structurées `Restaurant` + `Menu` JSON-LD.
   - Le menu apparaît automatiquement dans la liste déroulante de `/admin/qr` et dans `sitemap.xml`.

---

## 3. Générer et imprimer les QR codes & Chevalets de table A5 (`/admin/qr`)

Rendez-vous sur **`/admin/qr`** (page privée avec balise `noindex, nofollow`, exclue du `sitemap.xml` et bloquée dans `robots.txt`).

Depuis cet outil 100% client-side :
1. Sélectionnez le menu client dans la liste déroulante (ou saisissez une URL personnalisée).
2. Personnalisez la couleur du QR code, la couleur de fond, la taille (`256px` à `1024px`) et l'affichage du logo centré (qui active automatiquement le niveau de correction d'erreur **H**).
3. Téléchargez :
   - **Download PNG** : image haute définition du QR code.
   - **Download SVG** : fichier vectoriel pour imprimeur.
   - **Download A5 PDF** / **Print A5 Sheet** : chevalet de table format A5 prêt à imprimer avec le logo du client, ses couleurs et le texte *"امسح الرمز لعرض المنيو / Scannez pour voir le menu / Scan to view the menu"*.
   - **Download all QR codes (ZIP)** : archive `.zip` contenant les fichiers PNG de tous les menus clients enregistrés dans `src/menus/`.

---

## 4. Déployer sur Vercel

1. Poussez ce dépôt sur GitHub / GitLab.
2. Importez le projet dans **Vercel** :
   - **Framework Preset** : `Vite`
   - **Build Command** : `npm run build`
   - **Output Directory** : `dist`
3. Cliquez sur **Deploy**. Le fichier `vercel.json` inclus gère automatiquement les URLs propres (`cleanUrls: true`) et sert chaque page pré-rendue instantanément.
