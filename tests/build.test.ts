import { describe, it, expect } from "vitest";
import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

const rootDir = resolve(import.meta.dirname, "..");

describe("build", () => {
  it("completes successfully", { timeout: 60_000 }, () => {
    expect(() => {
      execSync("pnpm build", { cwd: rootDir, stdio: "pipe" });
    }).not.toThrow();
  });

  it("generates expected routes", () => {
    const expectedFiles = [
      "dist/index.html",
      "dist/projects/index.html",
      "dist/cv/index.html",
      "dist/blog/index.html",
    ];
    for (const file of expectedFiles) {
      expect(
        existsSync(resolve(rootDir, file)),
        `Expected ${file} to exist`
      ).toBe(true);
    }
  });
});
