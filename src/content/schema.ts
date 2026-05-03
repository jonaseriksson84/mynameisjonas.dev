import { z } from "astro/zod";

export const blogSchema = z.object({
  title: z.string(),
  description: z.string(),
  date: z.coerce.date(),
  tags: z.array(z.string()).default([]),
  draft: z.boolean().default(false),
  cover: z.string().optional(),
  series: z.string().optional(),
  seriesTitle: z.string().optional(),
  seriesDescription: z.string().optional(),
  part: z.number().optional(),
  book: z.object({
    title: z.string(),
    author: z.string(),
    cover: z.string(),
    pages: z.number().optional(),
    isbn: z.string().optional(),
    rating: z.number().min(1).max(5).optional(),
    goodreadsUrl: z.string().url().optional(),
    amazonUrl: z.string().url().optional(),
  }).optional(),
});
