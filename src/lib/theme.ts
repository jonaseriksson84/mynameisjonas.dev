export type ThemeMode = "light" | "dark";

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
  root.classList.toggle("dark", theme === "dark");
  return theme;
}

export function toggleTheme(root: Element): ThemeMode {
  const isDark = root.classList.toggle("dark");
  return isDark ? "dark" : "light";
}
