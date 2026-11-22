// Entry point: copies ./entry.png into $MAKEFUN_OUTPUT_DIR (default /output).
// Node 22 stdlib only. Validates the PNG before copying: signature, 1024x1024, < 1 MiB.
// v1: fresh build for news-image-20261122, Sunday 22 November 2026 front page.
import { copyFile, mkdir, readFile, stat } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const src = join(here, 'entry.png');
const outDir = process.env.MAKEFUN_OUTPUT_DIR || '/output';

const buf = await readFile(src);
const size = (await stat(src)).size;

const PNG_SIG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
if (!buf.subarray(0, 8).equals(PNG_SIG)) {
  throw new Error('entry.png is not a valid PNG (bad signature)');
}
if (buf.length < 33 || buf.toString('ascii', 12, 16) !== 'IHDR') {
  throw new Error('entry.png has no IHDR chunk');
}
const width = buf.readUInt32BE(16);
const height = buf.readUInt32BE(20);
if (width !== 1024 || height !== 1024) {
  throw new Error(`entry.png must be 1024x1024, got ${width}x${height}`);
}
if (size >= 1024 * 1024) {
  throw new Error(`entry.png must be under 1 MiB, got ${size} bytes`);
}

await mkdir(outDir, { recursive: true });
await copyFile(src, join(outDir, 'entry.png'));
console.log(`OK: entry.png ${width}x${height}, ${size} bytes -> ${join(outDir, 'entry.png')}`);
