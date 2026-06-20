import { readAllEntries } from "./content-utils.mjs";

const contentId = process.argv[2];

if (!contentId) {
  console.error("使い方: npm run notification:preview -- <content-id>");
  process.exit(1);
}

const entries = await readAllEntries();
const entry = entries.find(
  (item) => item.data.id === contentId || item.slug === contentId,
);

if (!entry) {
  console.error(`content-id が見つかりません: ${contentId}`);
  process.exit(1);
}

if (entry.data.draft) {
  console.error(
    `draft: true のため通知プレビューは作成できません: ${contentId}`,
  );
  process.exit(1);
}

const title = entry.data.title;
const body = entry.data.summary;
const path =
  entry.collection === "notices"
    ? `/notices/${entry.slug}/`
    : `/events/${entry.slug}/`;
const url = buildAbsoluteUrl(path);

console.log(
  [
    "OneSignal手動通知プレビュー",
    "",
    `タイトル: ${title}`,
    `本文: ${body}`,
    `URL: ${url}`,
    "",
    "通知は送信していません。OneSignal管理画面で人間が確認して送信してください。",
  ].join("\n"),
);

function buildAbsoluteUrl(pathname) {
  const explicit = process.env.PUBLIC_SITE_URL;
  const basePath = normalizeBase(
    process.env.PUBLIC_BASE_PATH ?? inferBaseFromRepository(),
  );
  if (explicit) {
    return new URL(joinPath(basePath, pathname), explicit).toString();
  }

  const repository = process.env.GITHUB_REPOSITORY;
  if (repository) {
    const [owner, repoName] = repository.split("/");
    const origin = repoName.endsWith(".github.io")
      ? `https://${repoName}`
      : `https://${owner}.github.io`;
    return new URL(joinPath(basePath, pathname), origin).toString();
  }

  return new URL(pathname, "http://localhost:4321").toString();
}

function inferBaseFromRepository() {
  const repository = process.env.GITHUB_REPOSITORY;
  if (!repository) {
    return "/";
  }
  const [, repoName] = repository.split("/");
  if (!repoName || repoName.endsWith(".github.io")) {
    return "/";
  }
  return `/${repoName}/`;
}

function normalizeBase(value) {
  if (!value || value === "/") {
    return "/";
  }
  const withLeading = value.startsWith("/") ? value : `/${value}`;
  return withLeading.endsWith("/") ? withLeading : `${withLeading}/`;
}

function joinPath(basePath, pathname) {
  if (basePath === "/") {
    return pathname;
  }
  return `${basePath}${pathname.replace(/^\/+/, "")}`;
}
