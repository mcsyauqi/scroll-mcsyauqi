// does a plain fetch()->blob() of a clip complete inside phone emulation? before and after a tap
import { createRequire } from 'node:module';
const { chromium } = createRequire('D:/Projects/Creativism App/package.json')('playwright');
const mobile = process.argv[2] !== 'desk';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const ctx = await browser.newContext(mobile ? { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } : { viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.goto('https://scroll.mcsyauqi.com/', { waitUntil: 'networkidle' });
const f = name => page.evaluate(async n => { const t = performance.now(); const b = await Promise.race([fetch('assets/vid/' + n + '.mp4').then(r => r.blob()), new Promise(r => setTimeout(() => r(null), 15000))]); return b ? `${n} ${b.size}B ${Math.round(performance.now() - t)}ms` : `${n} TIMEOUT`; }, name);
console.log('before tap:', await f('cs'));
await page.locator('.sw-route__dot').nth(3).click({ force: true });
await page.waitForTimeout(3000);
console.log('after tap:', await f('marketing'));
console.log('in-flight engine fetches visible to perf:', await page.evaluate(() => performance.getEntriesByType('resource').filter(e => e.name.endsWith('.mp4')).map(e => e.name.split('/').pop() + ':' + Math.round(e.duration)).join(' ')));
await browser.close();
