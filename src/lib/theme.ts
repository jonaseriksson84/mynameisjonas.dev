export type ThemeMode = "light" | "dark";

function applyTheme(root: Element, theme: ThemeMode): ThemeMode {
  root.classList.toggle("dark", theme === "dark");
  if (root instanceof HTMLElement) {
    root.style.colorScheme = theme;
  }
  return theme;
}

export function resolveInitialTheme(
  storedTheme: string | null,
  prefersDark: boolean
): ThemeMode {
  if (storedTheme === "dark") {
    return "dark";
  }
  if (storedTheme === "light") {
    return "light";
  }
  return prefersDark ? "dark" : "light";
}

export function initTheme(
  root: Element,
  storedTheme: string | null,
  prefersDark: boolean
): ThemeMode {
  const theme = resolveInitialTheme(storedTheme, prefersDark);
  return applyTheme(root, theme);
}

export function toggleTheme(root: Element): ThemeMode {
  const theme = root.classList.contains("dark") ? "light" : "dark";
  return applyTheme(root, theme);
}
