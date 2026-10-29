import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { satteri } from '@astrojs/markdown-satteri';
import { readmeImages, readmeHtml } from './scripts/project-readme-plugin.mjs';

export default defineConfig({
  site: 'https://binbinku.github.io',
  base: '/',
  trailingSlash: 'always',
  output: 'static',
  integrations: [sitemap({ filter: (page) => !page.endsWith('/404/') })],
  markdown: { processor: satteri({ mdastPlugins: [readmeImages], hastPlugins: [readmeHtml] }), shikiConfig: { themes: { light: 'github-light', dark: 'github-dark' } } },
});
