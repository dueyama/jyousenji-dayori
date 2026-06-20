import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { pathExists, readAllEntries } from "./content-utils.mjs";

const root = process.cwd();
const idPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const jstDatePattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\+09:00$/;
const allowedStatuses = new Set(["scheduled", "cancelled", "postponed"]);
const errors = [];

function fail(message) {
  errors.push(message);
}

function requireString(entry, key) {
  if (typeof entry.data[key] !== "string" || entry.data[key].trim() === "") {
    fail(`${entry.collection}/${entry.slug}: ${key} は必須です`);
  }
}

function validateDate(entry, key) {
  const value = entry.data[key];
  if (typeof value !== "string" || !jstDatePattern.test(value)) {
    fail(
      `${entry.collection}/${entry.slug}: ${key} は YYYY-MM-DDTHH:mm:ss+09:00 形式にしてください`,
    );
  }
}

const entries = await readAllEntries(root);
const ids = new Map();
const slugs = new Map();

for (const entry of entries) {
  if (!idPattern.test(entry.slug)) {
    fail(
      `${entry.collection}/${entry.slug}: ファイル名は英小文字、数字、ハイフンのみを使ってください`,
    );
  }
  if (typeof entry.data.id !== "string" || !idPattern.test(entry.data.id)) {
    fail(
      `${entry.collection}/${entry.slug}: id は英小文字、数字、ハイフンのみを使ってください`,
    );
  }
  if (entry.data.id !== entry.slug) {
    fail(
      `${entry.collection}/${entry.slug}: id とファイル名を一致させてください`,
    );
  }
  if (ids.has(entry.data.id)) {
    fail(
      `${entry.collection}/${entry.slug}: id が重複しています (${entry.data.id})`,
    );
  }
  ids.set(entry.data.id, entry.filePath);

  const slugKey = `${entry.collection}/${entry.slug}`;
  if (slugs.has(slugKey)) {
    fail(`${entry.collection}/${entry.slug}: slug が重複しています`);
  }
  slugs.set(slugKey, entry.filePath);

  requireString(entry, "title");
  requireString(entry, "summary");
  if (
    typeof entry.data.summary === "string" &&
    entry.data.summary.length > 120
  ) {
    fail(
      `${entry.collection}/${entry.slug}: summary は120文字以内にしてください`,
    );
  }
  if (typeof entry.data.draft !== "boolean") {
    fail(
      `${entry.collection}/${entry.slug}: draft は true または false にしてください`,
    );
  }

  const hasHeroImage =
    typeof entry.data.heroImage === "string" &&
    entry.data.heroImage.trim() !== "";
  const hasHeroAlt =
    typeof entry.data.heroAlt === "string" && entry.data.heroAlt.trim() !== "";
  if (hasHeroImage && !hasHeroAlt) {
    fail(`${entry.collection}/${entry.slug}: 画像指定時は heroAlt が必須です`);
  }

  if (/^\s*</m.test(entry.body) || /<script[\s>]/i.test(entry.body)) {
    fail(
      `${entry.collection}/${entry.slug}: Markdown内のraw HTMLまたはscriptは使わないでください`,
    );
  }

  if (entry.collection === "notices") {
    requireString(entry, "category");
    validateDate(entry, "publishedAt");
    if (entry.data.updatedAt !== null) {
      validateDate(entry, "updatedAt");
    }
  } else {
    requireString(entry, "location");
    validateDate(entry, "startAt");
    validateDate(entry, "endAt");
    if (!allowedStatuses.has(entry.data.status)) {
      fail(
        `${entry.collection}/${entry.slug}: status は scheduled, cancelled, postponed のいずれかです`,
      );
    }
    if (entry.data.allDay !== true && entry.data.allDay !== false) {
      fail(
        `${entry.collection}/${entry.slug}: allDay は true または false にしてください`,
      );
    }
    if (
      typeof entry.data.startAt === "string" &&
      typeof entry.data.endAt === "string" &&
      new Date(entry.data.endAt).getTime() <
        new Date(entry.data.startAt).getTime()
    ) {
      fail(
        `${entry.collection}/${entry.slug}: endAt は startAt 以後にしてください`,
      );
    }
  }
}

await validatePublicAssets();
if (process.env.SKIP_DIST_CHECK !== "1") {
  await validateDistIfPresent(entries);
}

if (errors.length > 0) {
  console.error(errors.map((error) => `- ${error}`).join("\n"));
  process.exit(1);
}

console.log(`Content validation passed (${entries.length} entries).`);

async function validatePublicAssets() {
  const manifestPath = path.join(root, "public/manifest.webmanifest");
  if (!(await pathExists(manifestPath))) {
    fail("public/manifest.webmanifest がありません");
    return;
  }
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  for (const key of [
    "name",
    "short_name",
    "id",
    "start_url",
    "scope",
    "display",
    "theme_color",
    "background_color",
  ]) {
    if (!manifest[key]) {
      fail(`manifest.webmanifest: ${key} がありません`);
    }
  }
  if (manifest.display !== "standalone") {
    fail("manifest.webmanifest: display は standalone にしてください");
  }

  const icons = manifest.icons ?? [];
  if (!icons.some((icon) => icon.purpose?.includes("maskable"))) {
    fail("manifest.webmanifest: maskable アイコンが必要です");
  }

  for (const icon of icons) {
    const iconPath = path.join(root, "public", icon.src);
    if (!(await pathExists(iconPath))) {
      fail(
        `manifest.webmanifest: ${icon.src} が存在しません。npm run generate:icons を実行してください`,
      );
    }
  }

  const workerPath = path.join(root, "public/OneSignalSDKWorker.js");
  if (!(await pathExists(workerPath))) {
    fail("public/OneSignalSDKWorker.js がありません");
  } else {
    const worker = await readFile(workerPath, "utf8");
    if (
      !worker.includes(
        "https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js",
      )
    ) {
      fail(
        "OneSignalSDKWorker.js は公式Web SDK v16のworkerを読み込んでください",
      );
    }
  }
}

async function validateDistIfPresent(allEntries) {
  const dist = path.join(root, "dist");
  if (!(await pathExists(dist))) {
    return;
  }

  const htmlFiles = await listFiles(dist, ".html");
  const xmlFiles = await listFiles(dist, ".xml");
  const textFiles = [...htmlFiles, ...xmlFiles];
  const published = allEntries.filter((entry) => entry.data.draft === false);
  const drafts = allEntries.filter((entry) => entry.data.draft === true);

  for (const draft of drafts) {
    for (const file of textFiles) {
      const content = await readFile(file, "utf8");
      if (
        content.includes(draft.data.id) ||
        content.includes(draft.data.title)
      ) {
        fail(
          `draft が出力に含まれています: ${draft.collection}/${draft.slug} -> ${path.relative(dist, file)}`,
        );
      }
    }
  }

  for (const entry of published) {
    const expected =
      entry.collection === "notices"
        ? path.join(dist, "notices", entry.slug, "index.html")
        : path.join(dist, "events", entry.slug, "index.html");
    if (!(await pathExists(expected))) {
      fail(
        `公開記事の詳細ページがありません: ${path.relative(root, expected)}`,
      );
    }
  }

  await validateHtmlSmoke(htmlFiles);
  await validateInternalLinks(dist, htmlFiles);

  for (const required of [
    "manifest.webmanifest",
    "OneSignalSDKWorker.js",
    "rss.xml",
    "sitemap.xml",
  ]) {
    if (!(await pathExists(path.join(dist, required)))) {
      fail(`dist/${required} がありません`);
    }
  }
}

async function validateHtmlSmoke(htmlFiles) {
  const css = await readFile(path.join(root, "src/styles/global.css"), "utf8");
  if (!css.includes("min-width: 320px") || !css.includes("min-height: 44px")) {
    fail("CSSに320px幅と44pxタップ領域の基本指定が見つかりません");
  }

  for (const file of htmlFiles) {
    const html = await readFile(file, "utf8");
    if (!html.includes('lang="ja"')) {
      fail(`${file}: lang="ja" がありません`);
    }
    if (!/<main\b/.test(html)) {
      fail(`${file}: main 要素がありません`);
    }
    if (!/<h1\b/.test(html)) {
      fail(`${file}: h1 要素がありません`);
    }
    if (!html.includes("skip-link")) {
      fail(`${file}: スキップリンクがありません`);
    }
    if (/TODO|ダミー/.test(html)) {
      fail(`${file}: TODO またはダミー文言が出力されています`);
    }
  }
}

async function validateInternalLinks(dist, htmlFiles) {
  const basePath = normalizeBase(
    process.env.PUBLIC_BASE_PATH ??
      process.env.BASE_PATH ??
      inferBaseFromRepository(),
  );
  for (const file of htmlFiles) {
    const html = await readFile(file, "utf8");
    const attrs = [...html.matchAll(/\s(?:href|src)="([^"]+)"/g)].map(
      (match) => match[1],
    );
    for (const attr of attrs) {
      if (shouldSkipUrl(attr)) {
        continue;
      }
      const target = resolveDistTarget(dist, file, attr, basePath);
      if (!(await pathExists(target))) {
        fail(
          `${path.relative(dist, file)}: リンク先が見つかりません (${attr} -> ${path.relative(dist, target)})`,
        );
      }
    }
  }
}

function shouldSkipUrl(value) {
  return (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("mailto:") ||
    value.startsWith("tel:") ||
    value.startsWith("data:") ||
    value.startsWith("#") ||
    value.startsWith("javascript:")
  );
}

function normalizeBase(value) {
  if (!value || value === "/") {
    return "/";
  }
  const leading = value.startsWith("/") ? value : `/${value}`;
  return leading.endsWith("/") ? leading : `${leading}/`;
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

function resolveDistTarget(dist, file, value, basePath) {
  const [withoutHash] = value.split("#");
  const [withoutQuery] = withoutHash.split("?");
  let pathname = withoutQuery;

  if (pathname.startsWith("/")) {
    if (basePath !== "/" && pathname.startsWith(basePath)) {
      pathname = pathname.slice(basePath.length - 1);
    }
    pathname = pathname.replace(/^\/+/, "");
    return toFilePath(path.join(dist, pathname));
  }

  const currentDir = path.dirname(file);
  return toFilePath(path.resolve(currentDir, pathname));
}

function toFilePath(targetPath) {
  if (targetPath.endsWith(path.sep) || !path.extname(targetPath)) {
    return path.join(targetPath, "index.html");
  }
  return targetPath;
}

async function listFiles(dir, extension) {
  const entries = await readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        return listFiles(fullPath, extension);
      }
      return entry.isFile() && entry.name.endsWith(extension) ? [fullPath] : [];
    }),
  );
  return nested.flat();
}
