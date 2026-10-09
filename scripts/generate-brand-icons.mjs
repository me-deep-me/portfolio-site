import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const input = process.argv[2];
if (!input) throw new Error('Usage: node scripts/generate-brand-icons.mjs <source-image>');

const root = new URL('../', import.meta.url);
const asset = (path) => fileURLToPath(new URL(path, root));
await mkdir(asset('public/brand/'), { recursive: true });
await mkdir(asset('output/'), { recursive: true });

// Resize and re-encode the supplied artwork; no source metadata is retained.
const png = (size) => sharp(input).rotate().resize(size, size, { fit: 'contain', background: '#000000' }).ensureAlpha().png().toBuffer();
await writeFile(asset('public/brand/me-logo.webp'), await sharp(input).rotate().resize(512, 512, { fit: 'contain', background: '#000000' }).webp({ quality: 92 }).toBuffer());
await writeFile(asset('src/app/icon.png'), await png(192));
await writeFile(asset('src/app/apple-icon.png'), await png(180));
await writeFile(asset('output/me-logo-preview.png'), await png(512));

// ICO directory with PNG payloads for both small tabs and larger app surfaces.
const sizes = [16, 32, 48, 64, 256];
const images = await Promise.all(sizes.map(png));
const header = Buffer.alloc(6 + sizes.length * 16);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(sizes.length, 4);
let offset = header.length;
sizes.forEach((size, index) => {
  const entry = 6 + index * 16;
  header.writeUInt8(size === 256 ? 0 : size, entry);
  header.writeUInt8(size === 256 ? 0 : size, entry + 1);
  header.writeUInt16LE(1, entry + 4);
  header.writeUInt16LE(32, entry + 6);
  header.writeUInt32LE(images[index].length, entry + 8);
  header.writeUInt32LE(offset, entry + 12);
  offset += images[index].length;
});
await writeFile(asset('src/app/favicon.ico'), Buffer.concat([header, ...images]));
console.log('Generated ME logo, favicon (16–256px), app icon and Apple touch icon.');
