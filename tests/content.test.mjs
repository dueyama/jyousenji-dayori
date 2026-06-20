import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import path from "node:path";
import test from "node:test";

const root = process.cwd();

test("content validation passes", () => {
  const result = spawnSync(process.execPath, ["scripts/validate-content.mjs"], {
    cwd: root,
    encoding: "utf8",
    env: { ...process.env, SKIP_DIST_CHECK: "1" },
  });
  assert.equal(result.status, 0, result.stderr || result.stdout);
});

test("notification preview rejects draft entries", () => {
  const result = spawnSync(
    process.execPath,
    ["scripts/notification-preview.mjs", "sample-obon-notice"],
    {
      cwd: root,
      encoding: "utf8",
    },
  );
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /draft: true/);
});

test("manifest has required PWA fields", async () => {
  const manifest = JSON.parse(
    await readFile(path.join(root, "public/manifest.webmanifest"), "utf8"),
  );
  assert.equal(manifest.display, "standalone");
  assert.ok(manifest.icons.some((icon) => icon.purpose?.includes("maskable")));
  assert.equal(manifest.start_url, ".");
  assert.equal(manifest.scope, ".");
});

test("notification code does not contain REST sending", async () => {
  const preview = await readFile(
    path.join(root, "scripts/notification-preview.mjs"),
    "utf8",
  );
  const worker = await readFile(
    path.join(root, "public/OneSignalSDKWorker.js"),
    "utf8",
  );
  const updaterWorker = await readFile(
    path.join(root, "public/OneSignalSDKUpdaterWorker.js"),
    "utf8",
  );
  assert.doesNotMatch(preview, /fetch\s*\(/);
  assert.doesNotMatch(preview, /api\.onesignal\.com\/notifications/i);
  assert.match(
    worker,
    /cdn\.onesignal\.com\/sdks\/web\/v16\/OneSignalSDK\.sw\.js/,
  );
  assert.match(
    updaterWorker,
    /cdn\.onesignal\.com\/sdks\/web\/v16\/OneSignalSDK\.sw\.js/,
  );
});
