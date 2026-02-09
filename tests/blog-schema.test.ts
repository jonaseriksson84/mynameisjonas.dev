import { describe, it, expect } from "vitest";
import { z } from "astro/zod";

// Recreate the blog schema to test validation logic independently
const blogSchema = z.object({
  title: z.string(),
  description: z.string(),
  date: z.coerce.date(),
  tags: z.array(z.string()).default([]),
  draft: z.boolean().default(false),
});

describe("blog schema validation", () => {
  it("accepts valid frontmatter with all fields", () => {
    const result = blogSchema.safeParse({
      title: "Test Post",
      description: "A test blog post",
      date: "2026-01-15",
      tags: ["astro", "test"],
      draft: false,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe("Test Post");
      expect(result.data.date).toBeInstanceOf(Date);
      expect(result.data.tags).toEqual(["astro", "test"]);
      expect(result.data.draft).toBe(false);
    }
  });

  it("accepts minimal frontmatter (title, description, date only)", () => {
    const result = blogSchema.safeParse({
      title: "Minimal Post",
      description: "Just the basics",
      date: "2026-02-01",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.tags).toEqual([]);
      expect(result.data.draft).toBe(false);
    }
  });

  it("coerces date strings to Date objects", () => {
    const result = blogSchema.safeParse({
      title: "Date Test",
      description: "Testing date coercion",
      date: "2026-03-15",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.date).toBeInstanceOf(Date);
      expect(result.data.date.getFullYear()).toBe(2026);
    }
  });

  it("rejects frontmatter missing title", () => {
    const result = blogSchema.safeParse({
      description: "No title",
      date: "2026-01-01",
    });
    expect(result.success).toBe(false);
  });

  it("rejects frontmatter missing description", () => {
    const result = blogSchema.safeParse({
      title: "No description",
      date: "2026-01-01",
    });
    expect(result.success).toBe(false);
  });

  it("rejects frontmatter missing date", () => {
    const result = blogSchema.safeParse({
      title: "No date",
      description: "Missing date field",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid tag types", () => {
    const result = blogSchema.safeParse({
      title: "Bad tags",
      description: "Tags should be strings",
      date: "2026-01-01",
      tags: [123, true],
    });
    expect(result.success).toBe(false);
  });

  it("defaults draft to false when not provided", () => {
    const result = blogSchema.safeParse({
      title: "No Draft Field",
      description: "Should default to not draft",
      date: "2026-01-01",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.draft).toBe(false);
    }
  });

  it("accepts draft: true", () => {
    const result = blogSchema.safeParse({
      title: "Draft Post",
      description: "This is a draft",
      date: "2026-01-01",
      draft: true,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.draft).toBe(true);
    }
  });
});
