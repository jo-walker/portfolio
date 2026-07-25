// Renders a 1200x630 Open Graph image to public/og-image.png using Playwright.
// Run: node scripts/make-og.mjs
import { chromium } from '@playwright/test';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const out = resolve(__dirname, '../public/og-image.png');

const html = `<!doctype html><html><head><meta charset="utf-8"/>
<style>
  * { margin:0; box-sizing:border-box; }
  body { width:1200px; height:630px; background:#008080; font-family:"Segoe UI",Tahoma,sans-serif; }
  .window { position:absolute; top:90px; left:110px; right:110px; bottom:90px;
    background:#c0c0c0; border:2px solid #fff; border-right-color:#000; border-bottom-color:#000; }
  .title { background:linear-gradient(90deg,#000080,#1084d0); color:#fff; font-weight:700;
    font-size:34px; padding:14px 20px; display:flex; align-items:center; gap:12px; }
  .body { padding:48px 56px; }
  h1 { font-size:76px; color:#000; }
  h2 { font-size:40px; color:#000080; margin-top:10px; }
  p  { font-size:30px; color:#333; margin-top:30px; }
  .btn { display:inline-block; margin-top:44px; font-size:28px; background:#c0c0c0;
    border:2px solid #fff; border-right-color:#000; border-bottom-color:#000; padding:12px 28px; }
</style></head><body>
  <div class="window">
    <div class="title"><span>🖥️</span> Jo Gurvantamir — Portfolio</div>
    <div class="body">
      <h1>Jo Gurvantamir</h1>
      <h2>Full-Stack Developer · Ottawa</h2>
      <p>A Windows 95-style desktop portfolio. Boot in and explore.</p>
      <span class="btn">▶ Double-click to enter</span>
    </div>
  </div>
</body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.setContent(html, { waitUntil: 'networkidle' });
await page.screenshot({ path: out });
await browser.close();
console.log('wrote', out);
