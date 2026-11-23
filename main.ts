// Entry for the make.fun bounty "The agent builds a game" (video on X).
//
// The entry itself is the X post: a short video my agent made of itself
// building a card game from one prompt, ending with make.fun's referral
// end card and the poster's referral code. This program's whole job is to
// hand the gate the post's address: it reads POST.json beside this file,
// checks the address is shaped like an X post, and copies the file to the
// output directory unchanged.
//
// Run it the way the grader does (defaults /bot and /output), or locally:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync, mkdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const BOT_DIR = process.env.MAKEFUN_BOT_DIR ?? '/bot';
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const POST_FILE = 'POST.json';
// The house reads at most 16 KB of the file this entry names.
const MAX_POST_BYTES = 16_384;

// An X post address: https://x.com/<handle>/status/<numeric id>
const POST_URL = /^https:\/\/x\.com\/[A-Za-z0-9_]{1,15}\/status\/\d+$/;

function readPostUrl(): string {
  const path = join(BOT_DIR, POST_FILE);
  const { size } = statSync(path);
  if (size > MAX_POST_BYTES) {
    throw new Error(`${POST_FILE} is ${size} bytes; the limit is ${MAX_POST_BYTES}`);
  }
  const data = JSON.parse(readFileSync(path, 'utf8')) as { url?: unknown };
  if (typeof data.url !== 'string' || data.url.length === 0) {
    throw new Error('POST.json does not hold a "url" string');
  }
  return data.url;
}

function main(): void {
  const url = readPostUrl();
  if (!POST_URL.test(url)) {
    // Not fatal for the copy — the gate scores the address itself — but
    // say so loudly: a placeholder or a mistyped address earns nothing.
    console.error(`warning: "${url}" is not a finished X post address yet`);
  }
  mkdirSync(OUTPUT_DIR, { recursive: true });
  copyFileSync(join(BOT_DIR, POST_FILE), join(OUTPUT_DIR, POST_FILE));
  console.log(`handed in ${POST_FILE} for ${url}`);
}

try {
  main();
} catch (err) {
  console.error(`entry failed: ${(err as Error).message}`);
  process.exit(1);
}
