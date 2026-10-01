// browser-side bandwidth: our clip vs a neutral 5 MB download (is the slowness the server or this machine's Chrome path?)
import { createRequire } from 'node:module';
const { chromium } = createRequire('D:/Projects/Creativism App/package.json')('playwright');
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await (await browser.newContext()).newPage();
await page.goto('https://scroll.mcsyauqi.com/assets/og.jpg');   // same origin, no engine running
const t = url => page.evaluate(async u => { const s = performance.now(); const b = await (await fetch(u, { cache: 'no-store' })).blob(); const ms = performance.now() - s; return `${u.split('/').pop().slice(0, 30)} ${(b.size / 1e6).toFixed(1)}MB ${Math.round(ms)}ms ${(b.size / 1e3 / ms).toFixed(1)}MB/s`; }, url);
console.log(await t('https://speed.cloudflare.com/__down?bytes=5000000'));
console.log(await t('https://scroll.mcsyauqi.com/assets/vid/marketing.mp4'));
console.log(await t('https://scroll.mcsyauqi.com/assets/vid/sales.mp4'));
const proto = await page.evaluate(() => performance.getEntriesByType('resource').map(e => e.name.split('/').pop().slice(0, 20) + ':' + e.nextHopProtocol).join(' '));
console.log('protocols', proto);
await browser.close();
