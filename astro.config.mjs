import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import svelte from '@astrojs/svelte';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

export default defineConfig({
  site: 'https://blog.mistlane.top', output: 'static', outDir: './public', publicDir: './astro.public', integrations: [sitemap(), react(), svelte()],
  markdown: { remarkPlugins: [remarkMath], rehypePlugins: [rehypeKatex], shikiConfig: { theme: 'github-dark' } },
  vite: { server: { watch: { ignored: ['**/public/**', '**/astro.public/**', '**/.deploy_git/**', '**/test-results/**'] } } },
});
