import { defineConfig, loadEnv } from 'vite';
import tailwindcss from '@tailwindcss/vite';

function siteSeo(siteUrl, isBuild) {
  const configuredUrl = siteUrl?.trim();
  let home;
  if (isBuild && configuredUrl) {
    home = new URL(configuredUrl);
    if (home.protocol !== 'https:' || home.href !== `${home.origin}/`) {
      throw new Error('VITE_SITE_URL должен содержать HTTPS-адрес домена без пути, параметров и якоря.');
    }
  }

  return {
    name: 'shrimp-pub-seo',
    transformIndexHtml() {
      if (!isBuild) {
        return [{ tag: 'meta', attrs: { name: 'robots', content: 'noindex' } }];
      }
      if (home) {
        return [
          { tag: 'link', attrs: { rel: 'canonical', href: home.href } },
          { tag: 'meta', attrs: { property: 'og:url', content: home.href } },
          { tag: 'meta', attrs: { property: 'og:image', content: new URL('atmos_photo_01.webp', home).href } },
        ];
      }
    },
    generateBundle() {
      const robots = ['User-agent: *', 'Allow: /'];
      if (home) {
        robots.push(`Sitemap: ${new URL('sitemap.xml', home).href}`);
        this.emitFile({
          type: 'asset',
          fileName: 'sitemap.xml',
          source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${home.href}</loc></url>\n</urlset>\n`,
        });
      }
      this.emitFile({
        type: 'asset',
        fileName: 'robots.txt',
        source: robots.join('\n') + '\n',
      });
    },
  };
}

export default defineConfig(({ mode, command }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  const vercelDomain = process.env.VITE_VERCEL_PROJECT_PRODUCTION_URL
    || process.env.VERCEL_PROJECT_PRODUCTION_URL;
  const siteUrl = env.VITE_SITE_URL?.trim() || (vercelDomain && `https://${vercelDomain}`);

  return {
    base: './',
    build: {
      assetsDir: '',
    },
    plugins: [tailwindcss(), siteSeo(siteUrl, command === 'build')],
    server: {
      port: 5173,
      open: false,
    },
  };
});
