import { describe, it, expect, beforeEach } from "vitest";

describe("theme initialization logic", () => {
  beforeEach(() => {
    document.documentElement.classList.remove("dark");
    localStorage.clear();
  });

  function applyThemeInit() {
    // Replicate the inline theme flash prevention script from BaseLayout.astro
    const theme = localStorage.getItem("theme");
    if (
      theme === "dark" ||
      (!theme &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      document.documentElement.classList.add("dark");
    }
  }

  it("adds dark class when localStorage theme is 'dark'", () => {
    localStorage.setItem("theme", "dark");
    applyThemeInit();
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("does not add dark class when localStorage theme is 'light'", () => {
    localStorage.setItem("theme", "light");
    applyThemeInit();
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("does not add dark class when no preference and prefers-color-scheme is light", () => {
    // happy-dom defaults matchMedia to not match
    applyThemeInit();
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });
});

describe("theme toggle logic", () => {
  beforeEach(() => {
    document.documentElement.classList.remove("dark");
    localStorage.clear();
  });

  function toggleTheme() {
    // Replicate the toggle logic from ThemeToggle.astro
    const isDark = document.documentElement.classList.toggle("dark");
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }

  it("toggles to dark mode and persists", () => {
    toggleTheme();
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(localStorage.getItem("theme")).toBe("dark");
  });

  it("toggles back to light mode and persists", () => {
    document.documentElement.classList.add("dark");
    toggleTheme();
    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(localStorage.getItem("theme")).toBe("light");
  });

  it("round-trips through toggle and init", () => {
    // Toggle to dark
    toggleTheme();
    expect(localStorage.getItem("theme")).toBe("dark");

    // Simulate page reload: remove class, re-run init
    document.documentElement.classList.remove("dark");
    const theme = localStorage.getItem("theme");
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    }
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });
});
