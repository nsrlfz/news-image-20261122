// news-image-20261122 v3: copy entry.png to $MAKEFUN_OUTPUT_DIR.
// Node 22 stdlib only. The PNG is read from this file's own folder
// (import.meta.url), so the entrypoint works from any working directory.
import { copyFileSync, statSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const src = path.join(here, 'entry.png');
const outDir = process.env.MAKEFUN_OUTPUT_DIR;
if (!outDir) {
  console.error('MAKEFUN_OUTPUT_DIR is not set');
  process.exit(1);
}
const data = readFileSync(src);
if (data.length >= 1024 * 1024) {
  console.error(`entry.png too large: ${data.length} bytes`);
  process.exit(1);
}
if (data.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a') {
  console.error('entry.png is not a PNG');
  process.exit(1);
}
const width = data.readUInt32BE(16);
const height = data.readUInt32BE(20);
if (width !== 1024 || height !== 1024) {
  console.error(`entry.png must be 1024x1024, got ${width}x${height}`);
  process.exit(1);
}
const dest = path.join(outDir, 'entry.png');
copyFileSync(src, dest);
const size = statSync(dest).size;
console.log(`OK: entry.png ${width}x${height}, ${size} bytes`);
