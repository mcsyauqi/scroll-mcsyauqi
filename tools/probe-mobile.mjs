// node tools/probe-mobile.mjs [url]  -> phone emulation: jump to a few sections, wait long, dump video element state
import { createRequire } from 'node:module';
const { chromium } = createRequire('D:/Projects/Creativism App/package.json')('playwright');
const url = process.argv[2] || 'https://scroll.mcsyauqi.com/';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
const page = await ctx.newPage();
page.on('console', m => console.log('console.' + m.type(), m.text().slice(0, 200)));
const fetched = [];
page.on('requestfinished', r => { if (r.url().endsWith('.mp4')) fetched.push(r.url().split('/').pop()); });
page.on('request', r => { if (r.url().endsWith('.mp4')) console.log('REQ', r.url().split('/').pop()); });
page.on('requestfailed', r => console.log('FAIL', r.url().split('/').pop(), r.failure()?.errorText));
await page.goto(url, { waitUntil: 'networkidle' });
for (const k of [2, 5, 9]) {
  await page.locator('.sw-route__dot').nth(k).tap({ force: true });
  await page.waitForTimeout(9000);
  const st = await page.evaluate(() => ({
    y: scrollY,
    videos: [...document.querySelectorAll('video')].map(v => `${v.closest('.sw-scene') ? [...document.querySelectorAll('.sw-scene')].indexOf(v.closest('.sw-scene')) : '?'}:rs${v.readyState}`).join(' '),
    hasClip: [...document.querySelectorAll('.sw-scene.has-clip')].length,
    visible: [...document.querySelectorAll('.sw-scene')].map((s, i) => +getComputedStyle(s).opacity > 0.5 ? i : null).filter(x => x !== null).join(','),
  }));
  console.log('after tap', k, JSON.stringify(st));
}
console.log('mp4 fetched', fetched.length, fetched.join(' '));
await browser.close();
