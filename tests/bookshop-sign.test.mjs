import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import sharp from "sharp";
import {
  A3_HEIGHT_PX,
  A3_WIDTH_PX,
  ASSEMBLED_HEIGHT_MM,
  ASSEMBLED_WIDTH_MM,
  ASSEMBLED_WIDTH_PX,
  calculateCoverTransform,
  EXPECTED_MASTER_HASH,
  MASTER_RELATIVE_PATH,
  OFFICIAL_NAME,
} from "../scripts/generate-bookshop-sign.mjs";

test("bookshop sign keeps the approved ImageGen master as its canonical artwork", async () => {
  const masterPath = path.join(process.cwd(), MASTER_RELATIVE_PATH);
  const source = await readFile(masterPath);
  const metadata = await sharp(source).metadata();
  const hash = createHash("sha256").update(source).digest("hex");

  assert.equal(OFFICIAL_NAME, "お寺本や");
  assert.equal(hash, EXPECTED_MASTER_HASH);
  assert.equal(metadata.width, 2109);
  assert.equal(metadata.height, 745);
  assert.equal(metadata.space, "srgb");
  assert.equal(metadata.channels, 3);
});

test("bookshop sign uses two exact A3 landscape panels", () => {
  assert.equal(A3_WIDTH_PX, 4961);
  assert.equal(A3_HEIGHT_PX, 3508);
  assert.equal(ASSEMBLED_WIDTH_PX, A3_WIDTH_PX * 2);
  assert.equal(ASSEMBLED_WIDTH_MM, 840);
  assert.equal(ASSEMBLED_HEIGHT_MM, 297);
});

test("master enlargement preserves aspect ratio and crops only the outer edges", () => {
  const transform = calculateCoverTransform(2109, 745);

  assert.equal(transform.resizedWidth, 9931);
  assert.equal(transform.resizedHeight, A3_HEIGHT_PX);
  assert.equal(transform.cropLeft, 4);
  assert.equal(transform.cropRight, 5);
  assert.equal(transform.cropTop, 0);
  assert.equal(transform.cropBottom, 0);
});
