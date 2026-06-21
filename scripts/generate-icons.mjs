import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const sourcePath = path.join(root, "src/assets/site/app-icon-source.png");
const outDir = path.join(root, "public/icons");
const source = await readFile(sourcePath);

await mkdir(outDir, { recursive: true });

const targets = [
  ["icon-192.png", 192],
  ["icon-512.png", 512],
  ["apple-touch-icon.png", 180],
  ["maskable-192.png", 192],
  ["maskable-512.png", 512],
];
const faviconSizes = [16, 32, 48];

await Promise.all(
  targets.map(([fileName, size]) =>
    sharp(source)
      .resize(size, size, { fit: "contain" })
      .png()
      .toFile(path.join(outDir, fileName)),
  ),
);

const faviconImages = await Promise.all(
  faviconSizes.map(async (size) => {
    const png = await sharp(source)
      .resize(size, size, { fit: "contain" })
      .png()
      .toBuffer();
    await writeFile(path.join(outDir, `favicon-${size}.png`), png);
    return { size, png };
  }),
);

await writeFile(path.join(root, "public/favicon.ico"), toIco(faviconImages));

console.log(`Generated ${targets.length + faviconSizes.length + 1} icons.`);

function toIco(images) {
  const headerSize = 6;
  const entrySize = 16;
  const directorySize = headerSize + images.length * entrySize;
  const totalSize =
    directorySize +
    images.reduce((bytes, image) => bytes + image.png.length, 0);
  const ico = Buffer.alloc(totalSize);

  ico.writeUInt16LE(0, 0);
  ico.writeUInt16LE(1, 2);
  ico.writeUInt16LE(images.length, 4);

  let imageOffset = directorySize;
  images.forEach((image, index) => {
    const entryOffset = headerSize + index * entrySize;
    ico.writeUInt8(image.size === 256 ? 0 : image.size, entryOffset);
    ico.writeUInt8(image.size === 256 ? 0 : image.size, entryOffset + 1);
    ico.writeUInt8(0, entryOffset + 2);
    ico.writeUInt8(0, entryOffset + 3);
    ico.writeUInt16LE(1, entryOffset + 4);
    ico.writeUInt16LE(32, entryOffset + 6);
    ico.writeUInt32LE(image.png.length, entryOffset + 8);
    ico.writeUInt32LE(imageOffset, entryOffset + 12);
    image.png.copy(ico, imageOffset);
    imageOffset += image.png.length;
  });

  return ico;
}
