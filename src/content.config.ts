import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { createBlogSchema } from "./content/schema";

const blog = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/blog" }),
  schema: ({ image }) => createBlogSchema(image),
});

export const collections = { blog };
