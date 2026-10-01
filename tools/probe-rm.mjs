// reduced-motion fallback: stills only, zero clip fetches
import { createRequire } from 'node:module';
const { chromium } = createRequire('D:/Projects/Creativism App/package.json')('playwright');
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await (await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1440, height: 900 } })).newPage();
let mp4 = 0; page.on('request', r => { if (r.url().endsWith('.mp4')) mp4++; });
await page.goto('https://scroll.mcsyauqi.com/', { waitUntil: 'networkidle' });
for (const k of [3, 10, 20]) { await page.locator('.sw-route__dot').nth(k).click({ force: true }); await page.waitForTimeout(2000); }
console.log('reduced-motion: mp4 requests', mp4, '| video elements', await page.locator('video').count(), '| stills', await page.locator('.sw-scene__still').count());
await page.screenshot({ path: 'work/qa/reduced-motion.png' });
await browser.close();
