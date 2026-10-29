import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://binbinku.github.io',
  base: '/BKSite',
  trailingSlash: 'always',
  output: 'static',
  integrations: [sitemap({ filter: (page) => !page.endsWith('/404/') })],
  markdown: { shikiConfig: { themes: { light: 'github-light', dark: 'github-dark' } } },
});
