#!/usr/bin/env node
/**
 * Turn the generated intro frames into shippable assets.
 *
 *   public/intro/raw/*.png   (1536×1024, ~1.5MB each — generator output)
 *        ↓
 *   public/intro/*.avif      (primary)
 *   public/intro/*.webp      (fallback)
 *
 * Why this exists rather than `next/image`: the frames are preloaded in the
 * document head and swapped by opacity on a 100ms schedule. Next's image
 * optimiser is request-time and returns a redirect on first hit — a snap cut
 * cannot wait for that. These are static, versioned, cache-forever assets.
 *
 * Budget (docs/TECH-SPEC.md §7): ≤40KB per frame, ≤220KB for the set. The
 * script fails loudly if a frame busts it, because a blown budget here is
 * invisible locally and very visible on a phone.
 *
 * Usage: pnpm intro:build
 */

import { mkdir, readdir, stat, writeFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

const RAW_DIR = "public/intro/raw";
const OUT_DIR = "public/intro";

/** The frames are wide wordmarks on black; 1280 is plenty even on a 4K
 *  display, because the image is letterboxed inside 8vw of padding. */
const WIDTH = 1280;
const PER_FRAME_BUDGET = 40 * 1024;
const TOTAL_BUDGET = 220 * 1024;

const kb = (bytes) => `${(bytes / 1024).toFixed(1)}KB`;

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  const files = (await readdir(RAW_DIR)).filter((f) => f.endsWith(".png")).sort();

  if (files.length === 0) {
    console.error(`No PNGs in ${RAW_DIR}. Generate the frames first.`);
    process.exit(1);
  }

  let total = 0;
  const oversized = [];

  for (const file of files) {
    const base = file.replace(/\.png$/, "");
    const input = join(RAW_DIR, file);

    const pipeline = sharp(input).resize({ width: WIDTH, withoutEnlargement: true });

    // AVIF first — roughly half the bytes of WebP on this kind of image
    // (large flat black fields with a high-detail subject).
    const avif = await pipeline.clone().avif({ quality: 62, effort: 6 }).toBuffer();
    const webp = await pipeline.clone().webp({ quality: 78, effort: 6 }).toBuffer();

    await writeFile(join(OUT_DIR, `${base}.avif`), avif);
    await writeFile(join(OUT_DIR, `${base}.webp`), webp);

    total += avif.length;
    if (avif.length > PER_FRAME_BUDGET) oversized.push([base, avif.length]);

    const raw = (await stat(input)).size;
    console.log(
      `${base.padEnd(16)} ${kb(raw).padStart(9)} → avif ${kb(avif).padStart(8)}  webp ${kb(webp).padStart(8)}`,
    );
  }

  console.log(`\n${files.length} frames · ${kb(total)} total (avif)`);

  if (oversized.length > 0) {
    console.error(
      `\nOver the ${kb(PER_FRAME_BUDGET)} per-frame budget:\n` +
        oversized.map(([n, s]) => `  ${n} — ${kb(s)}`).join("\n"),
    );
    process.exitCode = 1;
  }

  if (total > TOTAL_BUDGET) {
    console.error(`\nOver the ${kb(TOTAL_BUDGET)} total budget by ${kb(total - TOTAL_BUDGET)}.`);
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
