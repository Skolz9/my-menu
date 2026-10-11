# My Menu — Plateforme SaaS Menu QR, Commandes WhatsApp & Dashboard (by WebAtlass)

Plateforme complète de menus QR digitaux, commandes WhatsApp et gestion multi-restaurants pour cafés et restaurants au Maroc (**My Menu** par **WebAtlass**).

- **Stack** : Vite + React + TypeScript + Tailwind CSS + React Router + `@supabase/supabase-js` + Prerendering statique SEO.
- **Sécurité** : Row Level Security (RLS) activé sur toutes les tables, fonctions `SECURITY DEFINER` (`get_menu`, `place_order`, `track_event`, `create_business`, `admin_set_owner_by_email`), et **uniquement la clé publique `VITE_SUPABASE_ANON_KEY`** côté frontend (jamais de clé `service_role`).
- **Fallback menu public** : Si `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` ne sont pas définies, le menu public `/m/demo` utilise `src/menus/demo.ts`, tandis que la connexion `/login` est désactivée tant que la configuration Supabase est manquante.

---

## Guide d’installation pas-à-pas (Supabase + Vercel)

### 1. Créer le projet Supabase et exécuter `supabase/schema.sql`
1. Créez un nouveau projet sur [https://supabase.com](https://supabase.com).
2. Ouvrez **SQL Editor** → **New Query**.
3. Copiez-collez l’intégralité du fichier **`supabase/schema.sql`** et cliquez sur **Run** (s’exécute en une seule fois).
   - Crée toutes les tables (`admins`, `businesses`, `categories`, `items`, `orders`, `customers`, `menu_events`).
   - Active le **RLS** partout (les visiteurs anonymes ne voient que les établissements actifs et les articles disponibles, jamais les commandes ni les clients ; chaque propriétaire ne voit que son propre établissement `owner_id = auth.uid()`).
   - Crée les fonctions `SECURITY DEFINER` (`get_menu`, `place_order`, `track_event`, `create_business`, `admin_set_owner_by_email`).
   - Crée le bucket Storage public **`menu-images`** (images uniquement, max 2 Mo, écriture réservée au propriétaire ou admin).
   - Active **Supabase Realtime** sur `public.orders`.
   - Insère le restaurant d’exemple **`demo`** (thème vert My Menu `#6BBF3A`, 2 catégories, 6 articles, `table_count = 12`).

### 2. Désactiver les inscriptions publiques (Disable Public Signups)
1. Dans le dashboard Supabase, allez dans **Authentication** → **Providers** → **Email** (ou **Authentication** → **User Signups**).
2. Désactivez **"Allow new users to sign up"** pour que seuls les comptes créés par votre agence puissent se connecter sur `/login`.

### 3. Créer le premier Super Admin et l’insérer dans `public.admins`
1. Dans Supabase, allez dans **Authentication** → **Users** → **Add user** → **Create new user**.
2. Entrez votre adresse e-mail d’administrateur et un mot de passe fort, cochez **Auto Confirm User**, puis validez.
3. Copiez l’UUID du nouvel utilisateur ou exécutez directement dans **SQL Editor** :
   ```sql
   insert into public.admins (user_id)
   select id from auth.users where email = 'name@restaurant.com'
   on conflict (user_id) do nothing;
   ```

### 4. Configurer les variables d’environnement (Local & Vercel)
1. En local, copiez `.env.example` vers `.env.local` :
   ```bash
   cp .env.example .env.local
   ```
2. Renseignez vos clés publiques (depuis **Supabase Project Settings** → **API**) :
   ```env
   VITE_SUPABASE_URL="https://votre-projet.supabase.co"
   VITE_SUPABASE_ANON_KEY="votre-cle-publique-anon"
   VITE_BASE_URL="https://mymenu.ma"
   ```
   > **Important** : Ne mettez **JAMAIS** la clé `service_role` dans le frontend ou dans les variables `VITE_*`.
3. Sur **Vercel** :
   - Importez votre dépôt Git.
   - Dans **Settings** → **Environment Variables**, ajoutez `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` et `VITE_BASE_URL`.
   - Déployez (`npm run build` génère automatiquement le bundle client, pré-rend les pages HTML statiques SEO et génère `sitemap.xml` et `robots.txt`).

### 5. Créer un client café/restaurant et remettre ses accès au propriétaire
1. Dans **Supabase Authentication** → **Users** → **Add user**, créez le compte du propriétaire du café (ex: `name@restaurant.com`) avec **Auto Confirm User** coché.
2. Connectez-vous sur **`/login`** avec votre compte Super Admin et ouvrez **`/admin`**.
3. Dans le formulaire **"Nouveau client"**, renseignez :
   - **Nom** : `Café Majorelle`
   - **Slug** : `cafe-majorelle`
   - **E-mail du propriétaire** : `name@restaurant.com`
   - **Nombre de tables** : ex. `15`
4. Cliquez sur **"+ Créer le client"** (appelle `create_business` : crée le restaurant, lie automatiquement `owner_id` à l’e-mail du propriétaire et crée les catégories par défaut).
5. Cliquez sur **"Pack QR Tables"** pour télécharger en un clic le ZIP des PNG (`table-1.png`..`table-15.png`) ou les planches PDF A6 / A4 (6 chevalets par page).
6. Envoyez au propriétaire son lien **`/login`** et ses identifiants pour qu’il gère ses commandes en direct, ses produits et ses tables sur **`/dashboard`**.
