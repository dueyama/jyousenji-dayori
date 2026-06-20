import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const sourcePath = path.join(root, "public/icons/icon-source.svg");
const outDir = path.join(root, "public/icons");
const source = await readFile(sourcePath);

await mkdir(outDir, { recursive: true });

const targets = [
  ["icon-192.png", 192],
  ["icon-512.png", 512],
  ["maskable-192.png", 192],
  ["maskable-512.png", 512],
];

await Promise.all(
  targets.map(([fileName, size]) =>
    sharp(source)
      .resize(size, size, { fit: "contain" })
      .png()
      .toFile(path.join(outDir, fileName)),
  ),
);

console.log(`Generated ${targets.length} PWA icons.`);
