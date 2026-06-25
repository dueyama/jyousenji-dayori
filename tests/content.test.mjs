import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import path from "node:path";
import test from "node:test";
import {
  buildGoogleCalendarEvent,
  diffCalendarEvent,
  parseArgs,
} from "../scripts/calendar-sync.mjs";

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

test("calendar sync scripts are registered", async () => {
  const packageJson = JSON.parse(
    await readFile(path.join(root, "package.json"), "utf8"),
  );
  assert.equal(
    packageJson.scripts["calendar:preview"],
    "node scripts/calendar-sync.mjs",
  );
  assert.equal(
    packageJson.scripts["calendar:sync"],
    "node scripts/calendar-sync.mjs",
  );
});

test("calendar sync builds managed event payloads", () => {
  const event = buildGoogleCalendarEvent({
    data: {
      id: "2026-08-08-bon-houza",
      title: "盆法座",
      summary: "午前10時から盆法座を行います。",
      startAt: "2026-08-08T10:00:00+09:00",
      endAt: "2026-08-08T12:15:00+09:00",
      allDay: false,
      location: "浄泉寺",
      status: "scheduled",
    },
    body: "勤行の後、法話を二席行います。",
  });

  assert.equal(event.summary, "盆法座");
  assert.deepEqual(event.start, {
    dateTime: "2026-08-08T10:00:00+09:00",
    timeZone: "Asia/Tokyo",
  });
  assert.deepEqual(event.end, {
    dateTime: "2026-08-08T12:15:00+09:00",
    timeZone: "Asia/Tokyo",
  });
  assert.equal(
    event.extendedProperties.shared.contentId,
    "2026-08-08-bon-houza",
  );
  assert.equal(event.extendedProperties.shared.source, "jyousenji-dayori");
  assert.equal(event.extendedProperties.shared.managedBy, "codex");
});

test("calendar sync converts all-day event end to exclusive date", () => {
  const event = buildGoogleCalendarEvent({
    data: {
      id: "2027-01-15-goshoki-houonkou",
      title: "御正忌報恩講",
      summary: "1月15日から16日に御正忌報恩講を予定しています。",
      startAt: "2027-01-15T00:00:00+09:00",
      endAt: "2027-01-16T23:59:00+09:00",
      allDay: true,
      location: "浄泉寺",
      status: "scheduled",
    },
    body: "時間は後日設定します。",
  });

  assert.deepEqual(event.start, { date: "2027-01-15" });
  assert.deepEqual(event.end, { date: "2027-01-17" });
});

test("calendar sync diffs changed calendar event fields", () => {
  const desired = buildGoogleCalendarEvent({
    data: {
      id: "2026-08-08-bon-houza",
      title: "盆法座",
      summary: "午前10時から盆法座を行います。",
      startAt: "2026-08-08T10:00:00+09:00",
      endAt: "2026-08-08T12:15:00+09:00",
      allDay: false,
      location: "浄泉寺",
      status: "scheduled",
    },
    body: "勤行の後、法話を二席行います。",
  });
  const existing = {
    summary: "盆法座",
    description: "講師などの詳細は未定です。",
    location: "浄泉寺",
    start: { dateTime: "2026-08-08T10:00:00+09:00" },
    end: { dateTime: "2026-08-08T12:00:00+09:00" },
  };

  assert.deepEqual(
    diffCalendarEvent(desired, existing).map((diff) => diff.field),
    ["description", "end"],
  );
});

test("calendar sync argument parser requires explicit apply", () => {
  assert.deepEqual(parseArgs([]), { apply: false, contentId: "" });
  assert.deepEqual(parseArgs(["--apply", "--id", "2026-08-08-bon-houza"]), {
    apply: true,
    contentId: "2026-08-08-bon-houza",
  });
  assert.throws(() => parseArgs(["--id"]), /content id/);
});
