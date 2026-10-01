// node tools/cdp.mjs tools/gen-images.mjs [ids...]  -> sequentially generate missing stills via the Flow agent (Nano Banana Pro 16:9)
import { readFileSync, existsSync } from 'node:fs';
import { imageIds, save, submit, mid } from './flowlib.mjs';
const S = JSON.parse(readFileSync('scenes.json', 'utf8'));
export default async ({ page, args }) => {
  const todo = S.sections.filter(s => (!args.length || args.includes(s.id)) && !existsSync(`work/stills/${s.id}.png`));
  for (const s of todo) {
    const before = new Set((await imageIds(page)).map(mid));
    await submit(page, `Generate exactly one 16:9 image with Nano Banana Pro. Do not ask follow-up questions and do not make a video. Image prompt: ${S.style} Subject: ${s.subject}.`);
    console.log(new Date().toLocaleTimeString(), 'SUBMITTED', s.id);
    let src;
    for (let t = 0; t < 72 && !src; t++) {           // up to 6 min
      await page.waitForTimeout(5000);
      src = (await imageIds(page)).find(u => !before.has(mid(u)));
    }
    if (!src) { console.log('TIMEOUT', s.id, (await page.evaluate(() => document.body.innerText)).replace(/\s+/g, ' ').slice(-300)); continue; }
    await page.waitForTimeout(3000);
    src = (await imageIds(page)).find(u => mid(u) === mid(src)) || src;   // refreshed signed url
    console.log(new Date().toLocaleTimeString(), 'SAVED', s.id, mid(src), await save(src, `work/stills/${s.id}.png`));
  }
  console.log('DONE');
};
