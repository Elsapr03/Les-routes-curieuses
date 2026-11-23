import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    category: z.string().optional(),
    cover: z.string().optional(),
    published: z.boolean().default(false),
  }),
});

const destinations = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/destinations' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    duration: z.number().optional(),
    transport: z.string().optional(),
    cover: z.string().optional(),
    travelBudget: z.number().optional(),
    roadbookPrice: z.number().optional(),
    published: z.boolean().default(false),
  }),
});

export const collections = { blog, destinations };
