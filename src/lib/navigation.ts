function normalizePath(path: string): string {
  if (path.length > 1 && path.endsWith("/")) {
    return path.slice(0, -1);
  }
  return path;
}

export function isNavLinkActive(pathname: string, href: string): boolean {
  const currentPath = normalizePath(pathname);
  const targetPath = normalizePath(href);

  if (targetPath === "/") {
    return currentPath === "/";
  }

  return (
    currentPath === targetPath || currentPath.startsWith(`${targetPath}/`)
  );
}
