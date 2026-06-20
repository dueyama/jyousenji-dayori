import { defineConfig } from "astro/config";

function normalizeBasePath(value) {
  if (!value || value === "/") {
    return "/";
  }
  const withLeading = value.startsWith("/") ? value : `/${value}`;
  return withLeading.endsWith("/") ? withLeading : `${withLeading}/`;
}

function inferPagesBasePath() {
  if (process.env.PUBLIC_BASE_PATH) {
    return normalizeBasePath(process.env.PUBLIC_BASE_PATH);
  }

  const repository = process.env.GITHUB_REPOSITORY;
  if (!repository) {
    return "/";
  }

  const [, repoName] = repository.split("/");
  if (!repoName || repoName.endsWith(".github.io")) {
    return "/";
  }

  return normalizeBasePath(repoName);
}

function inferSiteUrl() {
  if (process.env.PUBLIC_SITE_URL) {
    return process.env.PUBLIC_SITE_URL.replace(/\/+$/, "");
  }

  const repository = process.env.GITHUB_REPOSITORY;
  if (!repository) {
    return "http://localhost:4321";
  }

  const [owner, repoName] = repository.split("/");
  if (!owner || !repoName) {
    return "http://localhost:4321";
  }

  if (repoName.endsWith(".github.io")) {
    return `https://${repoName}`;
  }

  return `https://${owner}.github.io`;
}

const basePath = inferPagesBasePath();

export default defineConfig({
  site: inferSiteUrl(),
  base: basePath === "/" ? undefined : basePath.replace(/\/$/, ""),
  output: "static",
  build: {
    format: "directory",
  },
});
