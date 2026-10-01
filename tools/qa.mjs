// node tools/qa.mjs [url] [w] [h] [tag]  -> headless Chrome (H.264-capable) walk through every section:
// screenshot mid-section, console errors, video seekability. Shots -> work/qa/<tag>-NN.png
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
const { chromium } = createRequire('D:/Projects/Creativism App/package.json')('playwright');
const [url = 'https://scroll.mcsyauqi.com/', w = '1440', h = '900', tag = 'desk'] = process.argv.slice(2);
mkdirSync('work/qa', { recursive: true });
const mobile = +w < 600;
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const ctx = await browser.newContext({ viewport: { width: +w, height: +h }, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: 1 });
const page = await ctx.newPage();
const errs = [];
page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
page.on('pageerror', e => errs.push(String(e)));
page.on('requestfailed', r => errs.push('REQFAIL ' + r.url()));
await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForTimeout(2500);
const n = await page.locator('.sw-route__dot').count();
const total = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
console.log('sections', n, 'scrollable px', total, 'title', await page.title());
await page.screenshot({ path: `work/qa/${tag}-00-landing.png` });
for (let k = 0; k < n; k++) {
  // centre of section k's dive band: read the engine's segment layout via the route dot click, then let it settle
  await page.locator('.sw-route__dot').nth(k).click({ force: true });
  await page.waitForTimeout(2600);
  await page.mouse.wheel(0, Math.round(+h * 0.25));               // nudge into mid-scene so the clip scrubs
  await page.waitForTimeout(2200);
  const st = await page.evaluate(() => {
    const vs = [...document.querySelectorAll('video')].filter(v => v.closest('.sw-scene') && getComputedStyle(v.closest('.sw-scene')).opacity > 0.5);
    const copy = [...document.querySelectorAll('.sw-copy')].find(c => +getComputedStyle(c).opacity > 0.5);
    return { y: scrollY, vids: vs.map(v => ({ rs: v.readyState, t: +v.currentTime.toFixed(2), seek: v.seekable.length ? +v.seekable.end(0).toFixed(1) : 0 })), title: copy?.querySelector('.sw-copy__title')?.textContent };
  });
  console.log(String(k + 1).padStart(2, '0'), JSON.stringify(st));
  await page.screenshot({ path: `work/qa/${tag}-${String(k + 1).padStart(2, '0')}.png` });
}
console.log('ERRORS', errs.length, JSON.stringify(errs.slice(0, 8)));
await browser.close();
