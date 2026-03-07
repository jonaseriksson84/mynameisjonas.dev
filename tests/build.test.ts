import { describe, it, expect } from "vitest";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

const rootDir = resolve(import.meta.dirname, "..");

describe("routes", () => {
  it("has expected route source files", () => {
    const expectedFiles = [
      "src/pages/index.astro",
      "src/pages/projects.astro",
      "src/pages/cv.astro",
      "src/pages/blog/index.astro",
    ];
    for (const file of expectedFiles) {
      expect(
        existsSync(resolve(rootDir, file)),
        `Expected ${file} to exist`
      ).toBe(true);
    }
  });
});
