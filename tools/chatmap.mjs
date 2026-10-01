// map scene id -> video media id by walking the agent chat in document order:
// a user message naming "<id>.png" opens a slot; the next video thumbnail after it fills the slot.
import { mid } from './flowlib.mjs';
export const chatMap = async page => page.evaluate(() => {
  const out = {}; let cur = null;
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT);
  for (let n = walker.currentNode; n; n = walker.nextNode()) {
    if (n.childElementCount === 0 && /attached image ([a-z]+)\.png/.test(n.textContent || '')) cur = n.textContent.match(/attached image ([a-z]+)\.png/)[1];
    if (n.tagName === 'IMG' && /flow-content\.google\/(image|video)\//.test(n.src) && n.alt !== 'Ingredient image' && !/^Tile/.test(n.alt) && cur && !out[cur]) out[cur] = { src: n.src, alt: n.alt, cls: n.className };
  }
  return out;
});
export default async ({ page }) => {
  const m = await chatMap(page);
  for (const [k, v] of Object.entries(m)) console.log(k, mid(v.src), v.cls, v.alt.slice(0, 50));
};
