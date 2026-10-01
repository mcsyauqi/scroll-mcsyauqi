// compare h3 throughput: Cloudflare (repeat request upgrades to h3) vs our Traefik; and our host with QUIC disabled
import { createRequire } from 'node:module';
const { chromium } = createRequire('D:/Projects/Creativism App/package.json')('playwright');
for (const quic of [true, false]) {
  const browser = await chromium.launch({ channel: 'chrome', headless: true, args: quic ? [] : ['--disable-quic'] });
  const page = await (await browser.newContext()).newPage();
  await page.goto('https://scroll.mcsyauqi.com/assets/og.jpg');
  const t = url => page.evaluate(async u => { const s = performance.now(); const b = await (await fetch(u, { cache: 'no-store' })).blob(); const ms = performance.now() - s; const e = performance.getEntriesByType('resource').filter(x => x.name === u).pop(); return `${u.includes('cloudflare') ? 'cloudflare' : u.split('/').pop()} ${e?.nextHopProtocol} ${(b.size / 1e3 / ms).toFixed(1)}MB/s`; }, url);
  const cf = 'https://speed.cloudflare.com/__down?bytes=5000000';
  console.log(quic ? 'QUIC on ' : 'QUIC off', await t(cf), '|', await t(cf + '&r=2'), '|', await t('https://scroll.mcsyauqi.com/assets/vid/marketing.mp4'), '|', await t('https://scroll.mcsyauqi.com/assets/vid/sales.mp4'));
  await browser.close();
}
