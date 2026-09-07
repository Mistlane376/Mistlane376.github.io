import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
const posts = defineCollection({ loader: glob({ base: './source/_posts', pattern: '**/*.md' }), schema: z.object({ title: z.string(), date: z.coerce.date().nullish(), updated: z.coerce.date().nullish(), description: z.string().nullish(), cover: z.string().nullish(), abbrlink: z.union([z.string(), z.number()]).nullish(), tags: z.union([z.string(), z.array(z.string())]).nullish(), categories: z.union([z.string(), z.array(z.string())]).nullish(), draft: z.boolean().nullish() }).passthrough() });
const pages = defineCollection({ loader: glob({ base: './source', pattern: ['*/index.md', '*.md'] }), schema: z.object({}).passthrough() });
const moments = defineCollection({ loader: glob({ base: './source/_moments', pattern: '*.md' }), schema: z.object({}).passthrough() });
export const collections = { posts, pages, moments };
