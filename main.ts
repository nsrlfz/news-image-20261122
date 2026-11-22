// news-image-20261122 v4 entrypoint: copies entry.png into the output dir.
// Runs under Node 22 with the standard library only. No network, no deps.
import { copyFileSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR || join(here, 'out');
const srcPath = join(here, 'entry.png');
const dstPath = join(outDir, 'entry.png');

const buf = readFileSync(srcPath);
const pngSig = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
for (let i = 0; i < 8; i++) {
  if (buf[i] !== pngSig[i]) throw new Error('entry.png is not a PNG file');
}
const width = buf.readUInt32BE(16);
const height = buf.readUInt32BE(20);
if (width !== 1024 || height !== 1024) {
  throw new Error(`entry.png must be 1024x1024, got ${width}x${height}`);
}
if (buf.length > 1024 * 1024) {
  throw new Error(`entry.png exceeds 1 MiB (${buf.length} bytes)`);
}
mkdirSync(outDir, { recursive: true });
copyFileSync(srcPath, dstPath);
console.log(`OK: entry.png ${width}x${height}, ${buf.length} bytes`);
