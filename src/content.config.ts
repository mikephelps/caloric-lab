import { defineCollection, z } from "astro:content";

const blog = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    metaTitle: z.string().optional(),
    featured: z.boolean().optional(),
    category: z.enum(["Weight Loss", "Body Composition", "Nutrition Basics", "Women's Health", "Hydration"]).optional(),
    pubDate: z.coerce.date(),
    description: z.string(),
    author: z.string().default("Mike"),
    heroImage: z.string().optional(),
    tags: z.array(z.string()).default([]),
    tldr: z.array(z.string()).optional(),
    relatedCalculators: z.array(z.string()).optional(),
    updatedDate: z.coerce.date().optional(),
    callout: z.object({
      label: z.string(),
      text: z.string(),
      calculatorName: z.string(),
      calculatorLink: z.string(),
    }).optional(),
    trustBody: z.string().optional(),
  }),
});

export const collections = { blog };
