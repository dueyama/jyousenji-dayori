import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import uri from "fast-uri";
import sharp from "sharp";
import { z } from "zod";

test("all locked build dependencies include the recorded security fixes", async () => {
  const lock = JSON.parse(
    await readFile(new URL("../package-lock.json", import.meta.url), "utf8"),
  );
  const minimums = new Map([
    ["astro", "7.2.8"],
    ["sharp", "0.35.4"],
    ["postcss", "8.5.23"],
    ["undici", "8.12.2"],
    ["vite", "8.3.3"],
    ["zod", "4.6.6"],
    ["fast-uri", "3.1.9"],
  ]);

  for (const [name, minimum] of minimums) {
    const entries = Object.entries(lock.packages).filter(
      ([key]) =>
        key.endsWith(`/node_modules/${name}`) || key === `node_modules/${name}`,
    );
    assert.ok(entries.length > 0, `${name} is missing from the lockfile`);
    for (const [key, entry] of entries) {
      assertStableVersionAtLeast(entry.version, minimum, key);
    }
  }

  assert.equal(
    sharp.versions.sharp,
    lock.packages["node_modules/sharp"].version,
  );
});

test("bounded Zod collections reject oversized input before parsing elements", () => {
  let visited = 0;
  const element = z.preprocess((value) => {
    visited += 1;
    return value;
  }, z.string());
  const values = Array.from({ length: 32 }, (_, index) => `value-${index}`);
  const cases = [
    [z.array(element).max(2), values],
    [z.set(element).max(2), new Set(values)],
    [z.map(z.string(), element).max(2), new Map(values.map((v) => [v, v]))],
  ];

  for (const [schema, input] of cases) {
    visited = 0;
    const result = schema.safeParse(input);
    assert.equal(result.success, false);
    assert.equal(visited, 0);
    assert.equal(result.error.issues.length, 1);
    assert.equal(result.error.issues[0].code, "too_big");
  }

  visited = 0;
  assert.deepEqual(
    z.array(element).max(2).parse(values.slice(0, 2)),
    values.slice(0, 2),
  );
  assert.equal(visited, 2);
});

test("fast-uri preserves relative references and rejects encoded scheme equivalence", () => {
  assert.equal(uri.normalize("../x"), "../x");
  assert.equal(uri.normalize("a/../b"), "b");
  assert.equal(uri.equal("a/../b", "/b"), false);
  assert.equal(
    uri.equal("%68ttp://example.test/", "http://example.test/"),
    false,
  );
  assert.equal(
    uri.resolve("https://example.test/base/", "../x"),
    "https://example.test/x",
  );
});

test("patched Sharp can encode and decode a known safe AVIF image", async () => {
  const avif = await sharp({
    create: {
      width: 32,
      height: 24,
      channels: 3,
      background: { r: 7, g: 84, b: 59 },
    },
  })
    .avif({ lossless: true })
    .toBuffer();
  const { data, info } = await sharp(avif)
    .resize(16, 12)
    .png()
    .toBuffer({ resolveWithObject: true });

  assert.equal(info.width, 16);
  assert.equal(info.height, 12);
  assert.equal(info.format, "png");
  assert.ok(data.length > 0);
});

function assertStableVersionAtLeast(version, minimum, label) {
  assert.match(
    version,
    /^\d+\.\d+\.\d+$/,
    `${label} must use a stable version`,
  );
  const actual = version.split(".").map(Number);
  const required = minimum.split(".").map(Number);
  const different = actual.findIndex((part, index) => part !== required[index]);
  assert.ok(
    different === -1 || actual[different] > required[different],
    `${label}@${version} is older than the security fix ${minimum}`,
  );
}
