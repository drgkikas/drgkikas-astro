import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Κοινό schema για σελίδες υπηρεσιών, διαταραχών και rTMS
const pageSchema = z.object({
  title: z.string(),
  description: z.string(),
  icon: z.string().optional(),
  heroImage: z.string().optional(),
  order: z.number().default(99),
  draft: z.boolean().default(false),
  seoTitle: z.string().optional()
});

const services = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/services" }),
  schema: pageSchema,
});

const disorders = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/disorders" }),
  schema: pageSchema,
});

const rtms = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/rtms" }),
  schema: pageSchema,
});

const farmakogonidiomatiki = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/farmakogonidiomatiki" }),
  schema: pageSchema,
});

const blog = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.date(),
    author: z.string().default('Dr. Πασχάλης Γκίκας'),
    image: z.string().optional(),
  }),
});

export const collections = {
  services,
  disorders,
  rtms,
  farmakogonidiomatiki,
  blog
};
