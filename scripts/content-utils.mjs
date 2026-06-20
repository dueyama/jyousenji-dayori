import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

export async function listMarkdownFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        return listMarkdownFiles(fullPath);
      }
      return entry.isFile() && entry.name.endsWith(".md") ? [fullPath] : [];
    }),
  );
  return files.flat().sort();
}

export async function pathExists(filePath) {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function readMarkdownEntry(
  filePath,
  collection,
  root = process.cwd(),
) {
  const raw = await readFile(filePath, "utf8");
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) {
    throw new Error(`${filePath}: frontmatter がありません`);
  }

  const data = parseFrontmatter(match[1]);
  const relative = path.relative(
    path.join(root, "src/content", collection),
    filePath,
  );
  const slug = relative.replace(/\.md$/, "").split(path.sep).join("/");

  return {
    filePath,
    collection,
    slug,
    data,
    body: match[2],
  };
}

export function parseFrontmatter(source) {
  const data = {};
  for (const line of source.split("\n")) {
    if (!line.trim() || line.trimStart().startsWith("#")) {
      continue;
    }

    const match = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!match) {
      throw new Error(`frontmatter を解釈できません: ${line}`);
    }

    const [, key, rawValue] = match;
    data[key] = parseValue(rawValue.trim());
  }
  return data;
}

function parseValue(value) {
  if (value === "null") {
    return null;
  }
  if (value === "true") {
    return true;
  }
  if (value === "false") {
    return false;
  }
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  return value;
}

export async function readAllEntries(root = process.cwd()) {
  const collections = ["notices", "events"];
  const all = [];
  for (const collection of collections) {
    const dir = path.join(root, "src/content", collection);
    const files = await listMarkdownFiles(dir);
    for (const filePath of files) {
      all.push(await readMarkdownEntry(filePath, collection, root));
    }
  }
  return all;
}
