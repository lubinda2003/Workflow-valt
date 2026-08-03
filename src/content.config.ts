import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";
import { DIFFICULTY_LEVELS } from "./data/difficultyLevels.js";

const workflows = defineCollection({
  loader: glob({ pattern: "**/*.json", base: "./src/content/workflows" }),
  schema: z.object({
    slug: z.string(),
    title: z.string(),
    description: z.string(),
    category: z.string(),
    difficulty: z.enum(DIFFICULTY_LEVELS),
    readingTime: z.string(),
    featured: z.boolean().default(false),
    tags: z.array(z.string()),
    tools: z.array(z.string()),
    cover: z.string().optional(),
    overview: z.string(),
    prerequisites: z.array(z.string()),
    steps: z.array(
      z.object({
        title: z.string(),
        content: z.string(),
        code: z
          .object({
            language: z.string(),
            code: z.string(),
          })
          .optional(),
      })
    ),
    architecture: z.string(),
    result: z.string(),
  }),
});

const categories = defineCollection({
  loader: glob({ pattern: "**/*.json", base: "./src/content/categories" }),
  schema: z.object({
    slug: z.string(),
    name: z.string(),
    description: z.string(),
  }),
});

export const collections = { workflows, categories };
