import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { moveFocus, parseMissingPath, NO_TYPING } from "../src/lib/not-found";

const runs = ["cd ~", "ls blog/", "cat cv.md"];

describe("parseMissingPath", () => {
  it("decodes a utf-8 path", () => {
    const path = parseMissingPath("/caf%C3%A9");
    expect(path.shown).toBe("/café");
    expect(path.leaf).toBe("café");
  });

  it("strips a bidi override", () => {
    expect(parseMissingPath("/%E2%80%AEgnp.exe").shown).toBe("/gnp.exe");
  });

  it("keeps the last segment of a blog path", () => {
    const path = parseMissingPath("/blog/no-such-post/");
    expect(path.leaf).toBe("no-such-post");
    expect(path.shown).toBe("/blog/no-such-post/");
  });
});

describe("moveFocus", () => {
  it("does nothing for next from the page", () => {
    expect(moveFocus(runs, { kind: "page" }, "next", NO_TYPING).focus).toBeNull();
  });

  it("moves next from the first command to the second", () => {
    expect(moveFocus(runs, { kind: "command", index: 0 }, "next", NO_TYPING).focus).toBe(1);
  });

  it("focuses ls blog/ when l is typed on the first command", () => {
    const move = moveFocus(runs, { kind: "command", index: 0 }, { char: "l", time: 0 }, NO_TYPING);
    expect(move.focus).toBe(runs.indexOf("ls blog/"));
  });

  it("stays on cd ~ when c is typed there", () => {
    const move = moveFocus(runs, { kind: "command", index: 0 }, { char: "c", time: 0 }, NO_TYPING);
    expect(move.focus).toBe(0);
  });

  it("focuses cat cv.md on a second c while cd ~ is focused", () => {
    const move = moveFocus(
      runs,
      { kind: "command", index: runs.indexOf("cd ~") },
      { char: "c", time: 100 },
      { typed: "c", time: 0 },
    );
    expect(move.focus).toBe(runs.indexOf("cat cv.md"));
    expect(move.typeAhead).toEqual({ typed: "cc", time: 100 });
  });

  it("does nothing for a character from the page", () => {
    expect(moveFocus(runs, { kind: "page" }, { char: "l", time: 0 }, NO_TYPING).focus).toBeNull();
  });
});

describe("not-found module", () => {
  it("has no runtime import", () => {
    const source = readFileSync(resolve(import.meta.dirname, "../src/lib/not-found.ts"), "utf8");
    expect(source.includes("from '") || source.includes('from "')).toBe(false);
  });
});
