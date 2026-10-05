import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import sharp from "sharp";

test("all locked Astro, Sharp and PostCSS versions include the security fixes", async () => {
  const lock = JSON.parse(
    await readFile(new URL("../package-lock.json", import.meta.url), "utf8"),
  );
  const minimums = new Map([
    ["astro", "7.2.8"],
    ["sharp", "0.35.4"],
    ["postcss", "8.5.23"],
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
