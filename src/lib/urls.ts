export function withBasePath(path: string): string {
  if (/^(https?:|mailto:|tel:|#)/.test(path)) {
    return path;
  }

  const base = normalizeBasePath(import.meta.env.BASE_URL || "/");
  if (path === "/" || path === "") {
    return base;
  }

  return `${base}${path.replace(/^\/+/, "")}`;
}

export function absoluteSiteUrl(site: URL | undefined, path: string): string {
  const base = site ?? new URL("http://localhost:4321");
  return new URL(withBasePath(path), base).toString();
}

function normalizeBasePath(value: string): string {
  if (!value || value === "/") {
    return "/";
  }

  const withLeading = value.startsWith("/") ? value : `/${value}`;
  return withLeading.endsWith("/") ? withLeading : `${withLeading}/`;
}
