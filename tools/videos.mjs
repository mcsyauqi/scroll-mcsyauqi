// list video tiles: media id + whether a playable <video> src is exposed (hover), optionally download to work/raw/_<mid>.mp4
import { save, mid } from './flowlib.mjs';
import { existsSync } from 'node:fs';
export default async ({ page, args }) => {
  const tiles = page.locator('flow-video-tile');
  const n = await tiles.count();
  console.log('video tiles', n);
  for (let i = 0; i < n; i++) {
    const tile = tiles.nth(i);
    const th = (await tile.locator('img').first().getAttribute('src').catch(() => '')) || '';
    await tile.scrollIntoViewIfNeeded().catch(() => {});
    await tile.hover().catch(() => {});
    let src = '';
    for (let k = 0; k < 8 && !src.includes('/video/'); k++) { await page.waitForTimeout(600); src = await tile.evaluate(t => t.querySelector('video')?.currentSrc || t.querySelector('video')?.src || ''); }
    const id = mid(src) || mid(th);
    const txt = (await tile.innerText().catch(() => '')).replace(/\s+/g, ' ').slice(0, 80);
    console.log(i, id, src ? 'READY' : 'pending', txt);
    if (args[0] === 'dl' && src.includes('/video/') && !existsSync(`work/raw/_${id}.mp4`)) console.log('  saved', await save(src, `work/raw/_${id}.mp4`));
  }
};
