import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: ({ image }) => z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    cover: image().optional(),
  }),
});
const projectReadmes = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/project-readmes' }),
  schema: z.object({ projectId: z.string(), sourceUrl: z.url(), syncedAt: z.string() }),
});
export const collections = { blog, projectReadmes };
