import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const distDir = path.resolve(rootDir, 'dist');
const ssrDir = path.resolve(rootDir, 'dist-ssr');
const publicDir = path.resolve(rootDir, 'public');

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

async function runPrerender() {
  const templatePath = path.join(distDir, 'index.html');
  if (!fs.existsSync(templatePath)) {
    throw new Error('dist/index.html not found. Run `vite build` before prerendering.');
  }

  const template = fs.readFileSync(templatePath, 'utf-8');
  const ssrEntryPath = path.join(ssrDir, 'entry-server.js');
  const { renderRoute, allMenus, config } = await import(ssrEntryPath);

  const menuRoutes: string[] = allMenus.map((m: { slug: string }) => `/m/${m.slug}`);
  const routesToPrerender = ['/', ...menuRoutes, '/admin/qr', '/404'];

  console.log(`[prerender] Prerendering ${routesToPrerender.length} routes to static HTML...`);

  for (const route of routesToPrerender) {
    const { html: appHtml, seo } = renderRoute(route);

    let pageHtml = template.replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`);

    // Inject route-specific SEO tags into <head>
    pageHtml = pageHtml
      .replace(/<title>.*?<\/title>/s, `<title>${escapeHtml(seo.title)}</title>`)
      .replace(
        /<meta name="description" content=".*?" \/>/,
        `<meta name="description" content="${escapeHtml(seo.description)}" />`
      )
      .replace(
        /<meta name="robots" content=".*?" \/>/,
        `<meta name="robots" content="${escapeHtml(seo.robots)}" />`
      )
      .replace(
        /<link rel="canonical" href=".*?" \/>/,
        `<link rel="canonical" href="${escapeHtml(seo.canonicalUrl)}" />`
      )
      .replace(
        /<meta property="og:title" content=".*?" \/>/,
        `<meta property="og:title" content="${escapeHtml(seo.title)}" />`
      )
      .replace(
        /<meta property="og:description" content=".*?" \/>/,
        `<meta property="og:description" content="${escapeHtml(seo.description)}" />`
      )
      .replace(
        /<meta property="og:url" content=".*?" \/>/,
        `<meta property="og:url" content="${escapeHtml(seo.canonicalUrl)}" />`
      )
      .replace(
        /<meta property="og:image" content=".*?" \/>/,
        `<meta property="og:image" content="${escapeHtml(seo.ogImage)}" />`
      )
      .replace(
        /<meta property="og:type" content=".*?" \/>/,
        `<meta property="og:type" content="${escapeHtml(seo.ogType)}" />`
      )
      .replace(
        /<meta name="twitter:title" content=".*?" \/>/,
        `<meta name="twitter:title" content="${escapeHtml(seo.title)}" />`
      )
      .replace(
        /<meta name="twitter:description" content=".*?" \/>/,
        `<meta name="twitter:description" content="${escapeHtml(seo.description)}" />`
      )
      .replace(
        /<meta name="twitter:image" content=".*?" \/>/,
        `<meta name="twitter:image" content="${escapeHtml(seo.ogImage)}" />`
      );

    // Update hreflang links per route
    const routeUrl = route === '/' ? `${config.baseUrl}/` : `${config.baseUrl}${route}`;
    pageHtml = pageHtml
      .replace(
        /<link rel="alternate" hreflang="ar-MA" href=".*?" \/>/,
        `<link rel="alternate" hreflang="ar-MA" href="${escapeHtml(routeUrl)}?lang=ar" />`
      )
      .replace(
        /<link rel="alternate" hreflang="fr-MA" href=".*?" \/>/,
        `<link rel="alternate" hreflang="fr-MA" href="${escapeHtml(routeUrl)}?lang=fr" />`
      )
      .replace(
        /<link rel="alternate" hreflang="en" href=".*?" \/>/,
        `<link rel="alternate" hreflang="en" href="${escapeHtml(routeUrl)}?lang=en" />`
      )
      .replace(
        /<link rel="alternate" hreflang="x-default" href=".*?" \/>/,
        `<link rel="alternate" hreflang="x-default" href="${escapeHtml(routeUrl)}" />`
      );

    if (route === '/') {
      fs.writeFileSync(path.join(distDir, 'index.html'), pageHtml, 'utf-8');
      console.log('  ✓ / -> dist/index.html');
    } else if (route === '/404') {
      fs.writeFileSync(path.join(distDir, '404.html'), pageHtml, 'utf-8');
      console.log('  ✓ /404 -> dist/404.html');
    } else {
      const targetDir = path.join(distDir, route.replace(/^\//, ''));
      fs.mkdirSync(targetDir, { recursive: true });
      fs.writeFileSync(path.join(targetDir, 'index.html'), pageHtml, 'utf-8');
      console.log(`  ✓ ${route} -> dist${route}/index.html`);
    }
  }

  // Generate sitemap.xml (strictly excluding /admin/qr and /404)
  const today = new Date().toISOString().split('T')[0];
  const publicRoutes = ['/', ...menuRoutes];
  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${publicRoutes
  .map((r) => {
    const loc = r === '/' ? `${config.baseUrl}/` : `${config.baseUrl}${r}`;
    const priority = r === '/' ? '1.0' : '0.8';
    return `  <url>
    <loc>${loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
    <xhtml:link rel="alternate" hreflang="ar-MA" href="${loc}?lang=ar"/>
    <xhtml:link rel="alternate" hreflang="fr-MA" href="${loc}?lang=fr"/>
    <xhtml:link rel="alternate" hreflang="en" href="${loc}?lang=en"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${loc}"/>
  </url>`;
  })
  .join('\n')}
</urlset>
`;

  // Generate robots.txt (disallowing /admin/qr)
  const robotsTxt = `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /admin/qr

Sitemap: ${config.baseUrl}/sitemap.xml
`;

  fs.mkdirSync(publicDir, { recursive: true });
  fs.writeFileSync(path.join(distDir, 'sitemap.xml'), sitemapXml, 'utf-8');
  fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemapXml, 'utf-8');
  fs.writeFileSync(path.join(distDir, 'robots.txt'), robotsTxt, 'utf-8');
  fs.writeFileSync(path.join(publicDir, 'robots.txt'), robotsTxt, 'utf-8');
  console.log('  ✓ Generated sitemap.xml and robots.txt (excluding /admin/qr)');

  // Clean up temporary SSR build directory
  fs.rmSync(ssrDir, { recursive: true, force: true });
  console.log('[prerender] Static HTML prerendering complete!');
}

runPrerender().catch((err) => {
  console.error('[prerender] Failed:', err);
  process.exit(1);
});
