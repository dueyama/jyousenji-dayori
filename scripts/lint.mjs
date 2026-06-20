import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const errors = [];

const textFiles = await listTextFiles(root, {
  skipDirs: new Set(["node_modules", "dist", ".astro", ".git"]),
});

for (const file of textFiles) {
  const relative = path.relative(root, file);
  const content = await readFile(file, "utf8");

  if (
    relative.startsWith(".github/workflows/") &&
    content.includes("pull_request_target")
  ) {
    errors.push(`${relative}: pull_request_target は使わないでください`);
  }

  if (/api\.onesignal\.com\/notifications/i.test(content)) {
    errors.push(
      `${relative}: OneSignal REST API 送信エンドポイントを含めないでください`,
    );
  }

  if (
    relative !== "scripts/lint.mjs" &&
    /ONESIGNAL_REST_API_KEY|APP_API_KEY|authorization:\s*Key/i.test(content)
  ) {
    errors.push(`${relative}: OneSignal送信用キーを扱わないでください`);
  }

  if (
    relative.startsWith("src/") &&
    /googletagmanager|google-analytics|gtag\(/i.test(content)
  ) {
    errors.push(
      `${relative}: アクセス解析や広告トラッカーを追加しないでください`,
    );
  }
}

if (errors.length > 0) {
  console.error(errors.map((error) => `- ${error}`).join("\n"));
  process.exit(1);
}

console.log(`Lint passed (${textFiles.length} files scanned).`);

async function listTextFiles(dir, options) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (options.skipDirs.has(entry.name)) {
          return [];
        }
        return listTextFiles(fullPath, options);
      }
      if (!entry.isFile()) {
        return [];
      }
      if (
        !/\.(astro|css|js|mjs|ts|json|md|yml|yaml|webmanifest|svg)$/.test(
          entry.name,
        )
      ) {
        return [];
      }
      return [fullPath];
    }),
  );
  return files.flat();
}
