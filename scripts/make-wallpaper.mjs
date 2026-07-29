// Renders the desktop wallpapers from the source photo in assets-src/, using
// Playwright's Chromium as the image processor (no native deps to install).
//
// Produces:
//   public/wallpaper.webp       full scene, downscaled + dithered to 216 colours
//   public/wallpaper-tile.webp  seamless mirrored grass tile, same palette
//
// Lossless WebP, not PNG: Floyd-Steinberg grain is incompressible noise to PNG
// (530 KB at this size) but WebP handles it in 172 KB. Lossy is worse than
// lossless here for the same reason - dither is the worst case for a lossy codec.
//
// Run: node scripts/make-wallpaper.mjs
import { chromium } from '@playwright/test';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SRC = resolve(__dirname, '../assets-src/theworldofjos.png');

// Deliberately small: at 800px the Floyd-Steinberg grain is a visible pixel
// texture rather than invisible noise, and CSS scales it up with
// image-rendering: pixelated for authentically chunky edges. 800x600 was also
// the canonical Win95 desktop resolution.
const SCENE_WIDTH = 800;
const TILE_SIZE = 256;

const source = readFileSync(SRC).toString('base64');
const browser = await chromium.launch();
const page = await browser.newPage();

const shared = {
  data: source,
  sceneWidth: SCENE_WIDTH,
  tileSize: TILE_SIZE,
};

const out = await page.evaluate(async ({ data, sceneWidth, tileSize }) => {
  const img = new Image();
  img.src = 'data:image/png;base64,' + data;
  await img.decode();

  /** Floyd-Steinberg dither onto a 6x6x6 colour cube — the 256-colour-era look. */
  function dither(ctx, w, h) {
    const image = ctx.getImageData(0, 0, w, h);
    const px = image.data;
    const quant = (v) => Math.round(v / 51) * 51;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 4;
        for (let ch = 0; ch < 3; ch++) {
          const old = px[i + ch];
          const next = quant(old);
          px[i + ch] = next;
          const err = old - next;
          const spread = (dx, dy, f) => {
            const nx = x + dx;
            const ny = y + dy;
            if (nx < 0 || nx >= w || ny >= h) return;
            px[(ny * w + nx) * 4 + ch] += err * f;
          };
          spread(1, 0, 7 / 16);
          spread(-1, 1, 3 / 16);
          spread(0, 1, 5 / 16);
          spread(1, 1, 1 / 16);
        }
      }
    }
    ctx.putImageData(image, 0, 0);
  }

  // --- full scene -------------------------------------------------------
  const scale = sceneWidth / img.naturalWidth;
  const scene = document.createElement('canvas');
  scene.width = sceneWidth;
  scene.height = Math.round(img.naturalHeight * scale);
  const sctx = scene.getContext('2d');
  sctx.drawImage(img, 0, 0, scene.width, scene.height);
  dither(sctx, scene.width, scene.height);

  // --- seamless tile ----------------------------------------------------
  // Crop a patch of grass, then mirror it into all four quadrants so the
  // edges always match and the tiling has no visible seam.
  const half = tileSize / 2;
  const patch = document.createElement('canvas');
  patch.width = half;
  patch.height = half;
  const pctx = patch.getContext('2d');
  const cropSize = Math.floor(img.naturalHeight * 0.28);
  pctx.drawImage(
    img,
    Math.floor(img.naturalWidth * 0.05),
    Math.floor(img.naturalHeight * 0.70),
    cropSize,
    cropSize,
    0,
    0,
    half,
    half,
  );

  const tile = document.createElement('canvas');
  tile.width = tileSize;
  tile.height = tileSize;
  const tctx = tile.getContext('2d');
  for (const [sx, sy] of [[1, 1], [-1, 1], [1, -1], [-1, -1]]) {
    tctx.save();
    tctx.translate(sx === 1 ? 0 : tileSize, sy === 1 ? 0 : tileSize);
    tctx.scale(sx, sy);
    tctx.drawImage(patch, 0, 0);
    tctx.restore();
  }
  dither(tctx, tileSize, tileSize);

  return {
    scene: scene.toDataURL('image/webp', 1),
    sceneW: scene.width,
    sceneH: scene.height,
    tile: tile.toDataURL('image/webp', 1),
  };
}, shared);

await browser.close();

function write(name, dataUrl) {
  const bytes = Buffer.from(dataUrl.split(',')[1], 'base64');
  writeFileSync(resolve(__dirname, '../public/', name), bytes);
  return (bytes.length / 1024).toFixed(0);
}

console.log(`wallpaper.webp       ${out.sceneW}x${out.sceneH}  ${write('wallpaper.webp', out.scene)} KB`);
console.log(`wallpaper-tile.webp  ${TILE_SIZE}x${TILE_SIZE}  ${write('wallpaper-tile.webp', out.tile)} KB`);
