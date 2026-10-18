import type { ImageMetadata } from "astro";
import type { ImageFunction } from "astro:content";
import { z } from "astro/zod";

const bookFields = {
  title: z.string(),
  author: z.string(),
  pages: z.number().optional(),
  isbn: z.string().optional(),
  rating: z.number().min(1).max(5).optional(),
  goodreadsUrl: z.string().url().optional(),
  storeUrl: z.string().url().optional(),
};

export type Book = {
  title: string;
  author: string;
  cover: string | ImageMetadata;
  pages?: number;
  isbn?: string;
  rating?: number;
  goodreadsUrl?: string;
  storeUrl?: string;
};

type BaseFields = {
  title: string;
  description: string;
  date: Date;
  tags: string[];
  draft: boolean;
  cover?: ImageMetadata;
};

export type StandalonePost = BaseFields & { type: 'standalone' };

export type SeriesPost = BaseFields & {
  type: 'seriesPart';
  series: string;
  part: number;
  seriesTitle: string;
  seriesDescription?: string;
};

export type BookReview = BaseFields & {
  type: 'bookReview';
  book: Book;
};

export type BlogPostData = StandalonePost | SeriesPost | BookReview;

export function createBlogSchema(image: ImageFunction) {
  const rawBlogSchema = z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    cover: image().optional(),
    series: z.string().optional(),
    seriesTitle: z.string().optional(),
    seriesDescription: z.string().optional(),
    part: z.number().optional(),
    book: z.object({
      ...bookFields,
      cover: z.union([z.string().url(), image()]),
    }).optional(),
  }).superRefine((data, ctx) => {
    const hasSeries = data.series !== undefined;
    const hasPart = data.part !== undefined;
    if (hasSeries !== hasPart) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'series and part must be both set or both omitted',
        path: [hasSeries ? 'part' : 'series'],
      });
    }
    if (hasSeries && data.seriesTitle === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'seriesTitle is required when series is set',
        path: ['seriesTitle'],
      });
    }
    if (!hasSeries && data.seriesTitle !== undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'seriesTitle is only valid on a series part (set series and part)',
        path: ['seriesTitle'],
      });
    }
    if (data.book && hasSeries) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'a post cannot be both a book review and a series part',
        path: ['book'],
      });
    }
  });

  return rawBlogSchema.transform((data): BlogPostData => {
    const base: BaseFields = {
      title: data.title,
      description: data.description,
      date: data.date,
      tags: data.tags,
      draft: data.draft,
      cover: data.cover,
    };

    if (data.book) {
      return { ...base, type: 'bookReview', book: data.book };
    }
    if (data.series !== undefined && data.part !== undefined) {
      return {
        ...base,
        type: 'seriesPart',
        series: data.series,
        part: data.part,
        seriesTitle: data.seriesTitle!, // guaranteed present by .superRefine()
        seriesDescription: data.seriesDescription,
      };
    }
    return { ...base, type: 'standalone' };
  });
}

/** Unit tests pass a string stand-in. The build passes Astro's `image()` helper. */
export const blogSchema = createBlogSchema((() => z.string()) as unknown as ImageFunction);
