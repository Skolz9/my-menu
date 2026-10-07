import { demoMenu } from './demo';
import type { ClientMenu } from './types';

// Auto-register every client menu file in src/menus/*.ts using Vite's import.meta.glob
const menuModules = import.meta.glob<Record<string, unknown>>('./*.ts', {
  eager: true,
});

const menusMap: Record<string, ClientMenu> = {};

for (const [path, mod] of Object.entries(menuModules)) {
  if (path.endsWith('/types.ts') || path.endsWith('/index.ts')) {
    continue;
  }
  const candidate =
    (mod.default as ClientMenu | undefined) ||
    (Object.values(mod).find(
      (val): val is ClientMenu =>
        Boolean(val && typeof val === 'object' && 'slug' in val && 'categories' in val)
    ) as ClientMenu | undefined);

  if (candidate && candidate.slug) {
    menusMap[candidate.slug] = candidate;
  }
}

// Ensure demoMenu is always registered even if glob is evaluated in a non-Vite context
if (!menusMap[demoMenu.slug]) {
  menusMap[demoMenu.slug] = demoMenu;
}

export const allMenus: ClientMenu[] = Object.values(menusMap);

export function getMenuBySlug(slug: string | undefined): ClientMenu | undefined {
  if (!slug) return undefined;
  return menusMap[slug.toLowerCase()];
}

export * from './types';
export { demoMenu };
