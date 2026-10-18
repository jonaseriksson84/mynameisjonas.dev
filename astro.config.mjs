// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';
import rehypeExternalLinks from 'rehype-external-links';

// https://astro.build/config
export default defineConfig({
  site: 'https://mynameisjonas.dev',
  output: 'static',
  adapter: cloudflare({ imageService: 'compile' }),
  integrations: [
    sitemap({
      filter: (page) => {
        const { pathname } = new URL(page);
        return pathname !== '/cv/print' && pathname !== '/cv/print/' && !pathname.startsWith('/api/');
      },
    }),
  ],
  markdown: {
    rehypePlugins: [
      // Open external links in a new tab; internal (relative) links are left alone.
      [rehypeExternalLinks, { target: '_blank', rel: ['noopener', 'noreferrer'] }],
    ],
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
