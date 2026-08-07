import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

export const OFFICIAL_NAME = "お寺本や";
export const DPI = 300;
export const A3_WIDTH_PX = 4961;
export const A3_HEIGHT_PX = 3508;
export const ASSEMBLED_WIDTH_PX = A3_WIDTH_PX * 2;
export const ASSEMBLED_WIDTH_MM = 840;
export const ASSEMBLED_HEIGHT_MM = 297;
export const MASTER_RELATIVE_PATH =
  "src/assets/print/oterahonya-sign-master.png";
export const EXPECTED_MASTER_HASH =
  "39780d123d5984e55935026507d212b081dd533aa19d33fd00f12feb03ed9664";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const masterPath = path.join(root, MASTER_RELATIVE_PATH);

export function calculateCoverTransform(sourceWidth, sourceHeight) {
  const scale = Math.max(
    ASSEMBLED_WIDTH_PX / sourceWidth,
    A3_HEIGHT_PX / sourceHeight,
  );
  const resizedWidth = Math.round(sourceWidth * scale);
  const resizedHeight = Math.round(sourceHeight * scale);

  return {
    scale,
    resizedWidth,
    resizedHeight,
    cropLeft: Math.floor((resizedWidth - ASSEMBLED_WIDTH_PX) / 2),
    cropRight: Math.ceil((resizedWidth - ASSEMBLED_WIDTH_PX) / 2),
    cropTop: Math.floor((resizedHeight - A3_HEIGHT_PX) / 2),
    cropBottom: Math.ceil((resizedHeight - A3_HEIGHT_PX) / 2),
  };
}

export async function generate() {
  const env = await loadDotEnv();
  const outputDir = path.resolve(
    env.JYOUSENJI_BOOKSHOP_SIGN_OUTPUT_DIR ??
      path.join(root, "private/bookshop-sign"),
  );
  const names = {
    combined: path.join(
      outputDir,
      "oterahonya-sign-combined-840x297mm-300dpi.png",
    ),
    left: path.join(outputDir, "oterahonya-sign-left-a3-300dpi.png"),
    right: path.join(outputDir, "oterahonya-sign-right-a3-300dpi.png"),
    pdf: path.join(outputDir, "oterahonya-sign-a3-two-page-print.pdf"),
    preview: path.join(outputDir, "oterahonya-sign-combined-preview.png"),
    leftPreview: path.join(outputDir, "oterahonya-sign-left-preview.png"),
    rightPreview: path.join(outputDir, "oterahonya-sign-right-preview.png"),
    manifest: path.join(outputDir, "oterahonya-sign-manifest.json"),
  };

  await mkdir(outputDir, { recursive: true });
  await removeSupersededArtifacts(outputDir);

  const sourceBuffer = await readFile(masterPath);
  const sourceHash = hash(sourceBuffer);
  assert.equal(
    sourceHash,
    EXPECTED_MASTER_HASH,
    "看板原本が承認済みImageGen画像と一致しません",
  );
  const sourceMetadata = await sharp(sourceBuffer).metadata();
  assert.equal(sourceMetadata.width, 2109);
  assert.equal(sourceMetadata.height, 745);
  assert.equal(sourceMetadata.space, "srgb");
  assert.equal(sourceMetadata.channels, 3);

  const transform = calculateCoverTransform(
    sourceMetadata.width,
    sourceMetadata.height,
  );
  assert.equal(transform.resizedWidth, 9931);
  assert.equal(transform.resizedHeight, A3_HEIGHT_PX);
  assert.equal(transform.cropLeft + transform.cropRight, 9);
  assert.equal(transform.cropTop + transform.cropBottom, 0);

  const combinedBuffer = await sharp(sourceBuffer)
    .resize(ASSEMBLED_WIDTH_PX, A3_HEIGHT_PX, {
      fit: "cover",
      position: "centre",
      kernel: sharp.kernel.lanczos3,
    })
    .removeAlpha()
    .withIccProfile("srgb")
    .withMetadata({ density: DPI })
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toBuffer();
  await writeFile(names.combined, combinedBuffer);

  const leftBuffer = await panelBuffer(combinedBuffer, 0);
  const rightBuffer = await panelBuffer(combinedBuffer, A3_WIDTH_PX);
  await writeFile(names.left, leftBuffer);
  await writeFile(names.right, rightBuffer);
  await validatePanelReassembly(combinedBuffer, leftBuffer, rightBuffer);

  await createPreviews(names, combinedBuffer, leftBuffer, rightBuffer);
  const pdfCheck = createPdf(env, names);
  const imageChecks = await Promise.all(
    [names.combined, names.left, names.right].map(validateProductionImage),
  );

  const manifest = {
    generatedAt: new Date().toISOString(),
    source: {
      file: MASTER_RELATIVE_PATH,
      sha256: sourceHash,
      pixels: [sourceMetadata.width, sourceMetadata.height],
      space: sourceMetadata.space,
      channels: sourceMetadata.channels,
    },
    officialName: OFFICIAL_NAME,
    transform: {
      mode: "aspect-preserving cover resize with Lanczos3",
      resizedPixels: [transform.resizedWidth, transform.resizedHeight],
      edgeCropPixels: {
        left: transform.cropLeft,
        right: transform.cropRight,
        top: transform.cropTop,
        bottom: transform.cropBottom,
      },
    },
    assembled: {
      millimeters: [ASSEMBLED_WIDTH_MM, ASSEMBLED_HEIGHT_MM],
      pixels: [ASSEMBLED_WIDTH_PX, A3_HEIGHT_PX],
      dpi: DPI,
    },
    panels: {
      count: 2,
      eachMillimeters: [420, 297],
      eachPixels: [A3_WIDTH_PX, A3_HEIGHT_PX],
      order: ["left", "right"],
      splitAtPx: A3_WIDTH_PX,
      overlapMm: 0,
      cropMarks: false,
    },
    color: "sRGB RGB",
    fontMode: "rasterized in the approved master artwork",
    imageChecks,
    pdfCheck,
    outputs: Object.fromEntries(
      Object.entries(names).map(([key, value]) => [key, path.basename(value)]),
    ),
  };
  await writeFile(names.manifest, `${JSON.stringify(manifest, null, 2)}\n`);

  console.log(`お寺本やの大型店頭看板を生成しました: ${outputDir}`);
  console.log(`左A3: ${names.left}`);
  console.log(`右A3: ${names.right}`);
  console.log(`2ページPDF: ${names.pdf}`);
  console.log(`結合preview: ${names.preview}`);
}

async function panelBuffer(combinedBuffer, left) {
  return sharp(combinedBuffer)
    .extract({ left, top: 0, width: A3_WIDTH_PX, height: A3_HEIGHT_PX })
    .withIccProfile("srgb")
    .withMetadata({ density: DPI })
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toBuffer();
}

async function validatePanelReassembly(
  combinedBuffer,
  leftBuffer,
  rightBuffer,
) {
  const rebuilt = await sharp({
    create: {
      width: ASSEMBLED_WIDTH_PX,
      height: A3_HEIGHT_PX,
      channels: 3,
      background: "#ffffff",
    },
  })
    .composite([
      { input: leftBuffer, left: 0, top: 0 },
      { input: rightBuffer, left: A3_WIDTH_PX, top: 0 },
    ])
    .removeAlpha()
    .raw()
    .toBuffer();
  const original = await sharp(combinedBuffer).removeAlpha().raw().toBuffer();
  assert.equal(
    hash(rebuilt),
    hash(original),
    "左右パネルの再連結結果が全体版と一致しません",
  );
}

async function createPreviews(names, combined, left, right) {
  await sharp(combined).resize({ width: 2400 }).png().toFile(names.preview);
  await sharp(left).resize({ width: 1200 }).png().toFile(names.leftPreview);
  await sharp(right).resize({ width: 1200 }).png().toFile(names.rightPreview);
}

function createPdf(env, names) {
  const python = env.JYOUSENJI_PYTHON ?? "python3";
  const result = spawnSync(
    python,
    [
      path.join(root, "scripts/png-panels-to-a3-pdf.py"),
      names.left,
      names.right,
      names.pdf,
    ],
    { cwd: root, encoding: "utf8" },
  );
  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout || "PDF生成に失敗しました");
  }
  return JSON.parse(result.stdout.trim());
}

async function validateProductionImage(imagePath) {
  const metadata = await sharp(imagePath).metadata();
  const isCombined = path.basename(imagePath).includes("combined");
  assert.equal(metadata.width, isCombined ? ASSEMBLED_WIDTH_PX : A3_WIDTH_PX);
  assert.equal(metadata.height, A3_HEIGHT_PX);
  assert.equal(metadata.density, DPI);
  assert.equal(metadata.space, "srgb");
  assert.equal(metadata.channels, 3);
  return {
    file: path.basename(imagePath),
    width: metadata.width,
    height: metadata.height,
    density: metadata.density,
    space: metadata.space,
    channels: metadata.channels,
  };
}

async function removeSupersededArtifacts(outputDir) {
  const staleNames = ["oterahonya-sign-preview-seam.png"];
  await Promise.all(
    staleNames.map((name) => rm(path.join(outputDir, name), { force: true })),
  );
}

async function loadDotEnv() {
  const values = { ...process.env };
  try {
    const text = await readFile(path.join(root, ".env"), "utf8");
    for (const rawLine of text.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith("#") || !line.includes("=")) continue;
      const index = line.indexOf("=");
      const key = line.slice(0, index).trim();
      if (values[key] !== undefined) continue;
      let value = line.slice(index + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      values[key] = value;
    }
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  return values;
}

function hash(buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}
