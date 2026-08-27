import { describe, it, expect } from "vitest";
import { isProductionSiteHost } from "../src/lib/subscription";

describe("isProductionSiteHost", () => {
  it("allows the live site hosts", () => {
    expect(isProductionSiteHost("mynameisjonas.dev")).toBe(true);
    expect(isProductionSiteHost("www.mynameisjonas.dev")).toBe(true);
    expect(isProductionSiteHost("WWW.MyNameIsJonas.dev")).toBe(true);
  });

  it("rejects preview and workers.dev hosts", () => {
    expect(isProductionSiteHost("mynameisjonas-dev.jonas.workers.dev")).toBe(false);
    expect(isProductionSiteHost("update-projects-page-mynameisjonas-dev.jonas.workers.dev")).toBe(false);
    expect(isProductionSiteHost("localhost")).toBe(false);
  });
});
