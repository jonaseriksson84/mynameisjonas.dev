import { execFileSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { resolve } from "node:path";
import { afterEach, expect, it } from "vitest";

const rootDir = resolve(import.meta.dirname, "..");
const fixtureSrc = resolve(rootDir, "tests/fixtures/hidden-draft.md");
const fixtureDir = resolve(rootDir, "src/content/blog/_draft-fixture");
const draftPage = resolve(
  rootDir,
  "dist/client/blog/_draft-fixture/hidden/index.html",
);
const publishedPage = resolve(
  rootDir,
  "dist/client/blog/gas-city/00-setup/index.html",
);

function removeFixture() {
  rmSync(fixtureDir, { recursive: true, force: true });
}

afterEach(removeFixture);

it("does not publish a draft post", () => {
  removeFixture();
  mkdirSync(fixtureDir, { recursive: true });
  cpSync(fixtureSrc, resolve(fixtureDir, "hidden.md"));
  try {
    execFileSync("pnpm", ["exec", "astro", "build"], {
      cwd: rootDir,
      stdio: "pipe",
      env: process.env,
    });
  } catch (error) {
    const err = error as { stdout?: Buffer; stderr?: Buffer };
    throw new Error(
      `astro build failed\n${err.stdout?.toString() ?? ""}\n${err.stderr?.toString() ?? ""}`,
    );
  }
  expect(existsSync(publishedPage), "published post was not built").toBe(true);
  expect(existsSync(draftPage), `draft page IS generated at ${draftPage}`).toBe(
    false,
  );
}, 180_000);
