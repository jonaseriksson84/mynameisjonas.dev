import { describe, it, expect } from "vitest";
import { isNavLinkActive } from "../src/lib/navigation";

describe("isNavLinkActive", () => {
  it("matches root only for root path", () => {
    expect(isNavLinkActive("/", "/")).toBe(true);
    expect(isNavLinkActive("/projects", "/")).toBe(false);
  });

  it("matches exact section path", () => {
    expect(isNavLinkActive("/projects", "/projects")).toBe(true);
  });

  it("matches child path under section", () => {
    expect(isNavLinkActive("/projects/chromacross", "/projects")).toBe(true);
  });

  it("does not match same prefix with different segment", () => {
    expect(isNavLinkActive("/projects-foo", "/projects")).toBe(false);
  });

  it("treats trailing slashes as the same route", () => {
    expect(isNavLinkActive("/projects/", "/projects")).toBe(true);
    expect(isNavLinkActive("/projects", "/projects/")).toBe(true);
  });
});
