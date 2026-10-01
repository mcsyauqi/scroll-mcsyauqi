// save image tiles whose media id is not in gen-images.log -> work/stills/_<mid>.png (identify visually, then rename)
import { readFileSync } from 'node:fs';
import { imageIds, save, mid } from './flowlib.mjs';
export default async ({ page }) => {
  const log = readFileSync('work/logs/gen-images.log', 'utf8') + ' bf8c1149-6b25-457c-8647-de40df635dda';
  for (const src of await imageIds(page)) if (!log.includes(mid(src))) console.log('rescued', mid(src), await save(src, `work/stills/_${mid(src)}.png`));
};
