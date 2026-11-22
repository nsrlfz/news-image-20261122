import { copyFileSync, existsSync, mkdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const EXPECTED_WIDTH = 1024;
const EXPECTED_HEIGHT = 1024;
const MAX_BYTES = 1024 * 1024;

const here = dirname(fileURLToPath(import.meta.url));
const source = join(here, "entry.png");
const outDir = process.env.MAKEFUN_OUTPUT_DIR || join(process.cwd(), "output");
const target = join(outDir, "entry.png");

function fail(message: string): never {
  console.error("main.ts: " + message);
  process.exit(1);
}

function main(): void {
  if (!existsSync(source)) fail("entry.png not found next to main.ts: " + source);
  const bytes = readFileSync(source);
  if (bytes.length >= MAX_BYTES) fail("entry.png is " + bytes.length + " bytes, must be under 1 MiB");
  if (!bytes.subarray(0, 8).equals(PNG_SIGNATURE)) fail("entry.png is not a PNG file");
  if (bytes.length < 33) fail("entry.png is too short to hold an IHDR chunk");
  if (bytes.toString("ascii", 12, 16) !== "IHDR") fail("entry.png has no IHDR chunk");
  const width = bytes.readUInt32BE(16);
  const height = bytes.readUInt32BE(20);
  if (width !== EXPECTED_WIDTH || height !== EXPECTED_HEIGHT) {
    fail("entry.png is " + width + "x" + height + ", expected 1024x1024");
  }
  mkdirSync(outDir, { recursive: true });
  copyFileSync(source, target);
  const copied = statSync(target);
  if (copied.size !== bytes.length) fail("copied entry.png size mismatch");
  console.log("wrote " + target + " (" + bytes.length + " bytes, 1024x1024 PNG)");
}

main();
