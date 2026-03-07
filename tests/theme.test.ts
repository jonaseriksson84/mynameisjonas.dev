import { describe, it, expect, beforeEach } from "vitest";
import { initTheme, resolveInitialTheme, toggleTheme } from "../src/lib/theme";

describe("theme initialization logic", () => {
  beforeEach(() => {
    document.documentElement.classList.remove("dark");
    localStorage.clear();
  });

  it("adds dark class when localStorage theme is 'dark'", () => {
    localStorage.setItem("theme", "dark");
    initTheme(document.documentElement, localStorage.getItem("theme"), false);
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("does not add dark class when localStorage theme is 'light'", () => {
    localStorage.setItem("theme", "light");
    initTheme(document.documentElement, localStorage.getItem("theme"), true);
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("does not add dark class when no preference and prefers-color-scheme is light", () => {
    initTheme(document.documentElement, localStorage.getItem("theme"), false);
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("adds dark class when no preference and prefers-color-scheme is dark", () => {
    initTheme(document.documentElement, localStorage.getItem("theme"), true);
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("resolves initial theme deterministically", () => {
    expect(resolveInitialTheme("dark", false)).toBe("dark");
    expect(resolveInitialTheme("light", true)).toBe("light");
    expect(resolveInitialTheme(null, true)).toBe("dark");
    expect(resolveInitialTheme(null, false)).toBe("light");
  });
});

describe("theme toggle logic", () => {
  beforeEach(() => {
    document.documentElement.classList.remove("dark");
    localStorage.clear();
  });

  it("toggles to dark mode and persists", () => {
    const theme = toggleTheme(document.documentElement);
    localStorage.setItem("theme", theme);
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(localStorage.getItem("theme")).toBe("dark");
  });

  it("toggles back to light mode and persists", () => {
    document.documentElement.classList.add("dark");
    const theme = toggleTheme(document.documentElement);
    localStorage.setItem("theme", theme);
    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(localStorage.getItem("theme")).toBe("light");
  });

  it("round-trips through toggle and init", () => {
    // Toggle to dark
    const nextTheme = toggleTheme(document.documentElement);
    localStorage.setItem("theme", nextTheme);
    expect(localStorage.getItem("theme")).toBe("dark");

    // Simulate page reload: remove class, re-run init
    document.documentElement.classList.remove("dark");
    initTheme(document.documentElement, localStorage.getItem("theme"), false);
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });
});
