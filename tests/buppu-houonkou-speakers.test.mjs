import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";
import { readMarkdownEntry } from "../scripts/content-utils.mjs";
import { buildGoogleCalendarEvent } from "../scripts/calendar-sync.mjs";

test("buppu speaker announcement preserves the event URL and confirmed schedule", async () => {
  const root = process.cwd();
  const event = await readMarkdownEntry(
    path.join(root, "src/content/events/2026-11-27-saizu-buppu-houonkou.md"),
    "events",
    root,
  );
  const notice = await readMarkdownEntry(
    path.join(
      root,
      "src/content/notices/2026-10-15-saizu-buppu-houonkou-speakers.md",
    ),
    "notices",
    root,
  );

  assert.equal(event.data.id, "2026-11-27-saizu-buppu-houonkou");
  assert.equal(event.data.startAt, "2026-11-28T13:30:00+09:00");
  assert.equal(event.data.endAt, "2026-11-28T15:30:00+09:00");
  for (const entry of [event, notice]) {
    assert.match(entry.body, /前席：伊東俊裕 師（熊南組 浄福寺）/);
    assert.match(entry.body, /後席：岡村遵賢 師（邦西組 照蓮寺）/);
    assert.doesNotMatch(
      entry.body,
      /講師などの詳細は未定|伊東俊裕 氏|岡村遵賢 氏/,
    );
    const publicText = `${JSON.stringify(entry.data)}\n${entry.body}`;
    assert.doesNotMatch(
      publicText,
      /〒|\b\d{3}-\d{4}\b|\b0\d{1,4}-\d{1,4}-\d{3,4}\b/,
    );
  }
  assert.equal(notice.data.archived, false);
  assert.match(
    notice.body,
    /\.\.\/\.\.\/events\/2026-11-27-saizu-buppu-houonkou\//,
  );

  const calendar = buildGoogleCalendarEvent(event);
  assert.match(calendar.description, /伊東俊裕 師/);
  assert.match(calendar.description, /岡村遵賢 師/);
  assert.equal(calendar.extendedProperties.shared.contentId, event.data.id);
});
