// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://mvs.lgf.ch',
  trailingSlash: 'ignore',
  build: {
    format: 'directory',
  },
  // Deutsch ohne Präfix (/), Französisch später unter /fr/
  i18n: {
    locales: ['de', 'fr'],
    defaultLocale: 'de',
    routing: {
      prefixDefaultLocale: false,
    },
  },
  integrations: [sitemap()],
  server: {
    port: 4323,
  },
});
