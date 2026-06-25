import { readFile } from "node:fs/promises";
import { readAllEntries } from "./content-utils.mjs";

export async function loadEnv() {
  let fileEnv = {};
  try {
    fileEnv = parseDotEnv(await readFile(".env", "utf8"));
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }
  }
  return { ...fileEnv, ...process.env };
}

export async function buildNotificationMessage(contentId, env = process.env) {
  if (!contentId) {
    throw new Error("content-id を指定してください");
  }

  const entries = await readAllEntries();
  const entry = entries.find(
    (item) => item.data.id === contentId || item.slug === contentId,
  );

  if (!entry) {
    throw new Error(`content-id が見つかりません: ${contentId}`);
  }

  if (entry.data.draft) {
    throw new Error(
      `draft: true のため通知プレビューは作成できません: ${contentId}`,
    );
  }

  const pathname =
    entry.collection === "notices"
      ? `/notices/${entry.slug}/`
      : `/events/${entry.slug}/`;

  return {
    id: entry.data.id,
    slug: entry.slug,
    collection: entry.collection,
    title: entry.data.title,
    body: entry.data.summary,
    pathname,
    url: buildAbsoluteUrl(pathname, env),
  };
}

export function buildOneSignalPayload(message, options) {
  return {
    app_id: options.appId,
    target_channel: "push",
    included_segments: options.includedSegments,
    headings: {
      en: message.title,
      ja: message.title,
    },
    contents: {
      en: message.body,
      ja: message.body,
    },
    url: message.url,
    data: {
      content_id: message.id,
      content_type: message.collection,
      source: "jyousenji-dayori",
    },
  };
}

export function buildAbsoluteUrl(pathname, env = process.env) {
  const explicit = env.PUBLIC_SITE_URL;
  const basePath = normalizeBase(
    env.PUBLIC_BASE_PATH ?? inferBaseFromRepository(env),
  );
  if (explicit) {
    return new URL(joinPath(basePath, pathname), explicit).toString();
  }

  const repository = env.GITHUB_REPOSITORY;
  if (repository) {
    const [owner, repoName] = repository.split("/");
    const origin = repoName.endsWith(".github.io")
      ? `https://${repoName}`
      : `https://${owner}.github.io`;
    return new URL(joinPath(basePath, pathname), origin).toString();
  }

  return new URL(pathname, "http://localhost:4321").toString();
}

export function inferBaseFromRepository(env = process.env) {
  const repository = env.GITHUB_REPOSITORY;
  if (!repository) {
    return "/";
  }
  const [, repoName] = repository.split("/");
  if (!repoName || repoName.endsWith(".github.io")) {
    return "/";
  }
  return `/${repoName}/`;
}

export function normalizeBase(value) {
  if (!value || value === "/") {
    return "/";
  }
  const withLeading = value.startsWith("/") ? value : `/${value}`;
  return withLeading.endsWith("/") ? withLeading : `${withLeading}/`;
}

export function joinPath(basePath, pathname) {
  if (basePath === "/") {
    return pathname;
  }
  return `${basePath}${pathname.replace(/^\/+/, "")}`;
}

export function parseSegments(value) {
  return String(value ?? "")
    .split(",")
    .map((segment) => segment.trim())
    .filter(Boolean);
}

function parseDotEnv(text) {
  const values = {};
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#") || !line.includes("=")) {
      continue;
    }
    const index = line.indexOf("=");
    const key = line.slice(0, index).trim();
    let value = line.slice(index + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    values[key] = value;
  }
  return values;
}
