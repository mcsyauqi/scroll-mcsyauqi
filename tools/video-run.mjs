// PROJ=83122f37 node tools/cdp.mjs tools/video-run.mjs
// Pipelined Veo image-to-video in the Flow video project: upload still -> attach as ingredient -> ask agent for a
// start-frame dive clip; keep up to MAXQ renders in flight; map chat message "<id>.png" -> video media id; download.
import { readFileSync, existsSync, appendFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { save, submit, mid } from './flowlib.mjs';
import { videoPrompt } from './gen-video.mjs';
import { chatMap } from './chatmap.mjs';

const MAXQ = 4, LIMIT_MIN = 150;
const S = JSON.parse(readFileSync('scenes.json', 'utf8'));
const read = f => existsSync(f) ? readFileSync(f, 'utf8') : '';
const log = m => console.log(new Date().toLocaleTimeString(), m);

async function closeOverlays(page) {
  for (let k = 0; k < 3 && await page.locator('.cdk-overlay-backdrop').count(); k++) { await page.locator('.cdk-overlay-backdrop').last().click({ force: true }); await page.waitForTimeout(500); }
}
async function upload(page, id) {
  await closeOverlays(page);
  await page.getByRole('button', { name: 'Add media menu' }).click();
  await page.waitForTimeout(1200);
  const items = page.locator('.cdk-overlay-pane [role^="menuitem"], .cdk-overlay-pane button');
  const i = (await items.allInnerTexts()).findIndex(t => /upload/i.test(t));
  const [fc] = await Promise.all([page.waitForEvent('filechooser', { timeout: 15000 }), items.nth(Math.max(i, 0)).click()]);
  await fc.setFiles(path.resolve(`work/stills/${id}.png`));
  await page.waitForTimeout(8000);
  appendFileSync('work/logs/uploads.log', id + '\n');
}
async function attach(page, id) {
  await closeOverlays(page);
  // count chips inside the composer only (chat history bubbles carry the same img alt)
  const chips = { count: () => page.evaluate(() => { let n = [...document.querySelectorAll('[contenteditable="true"]')].pop(); while (n && !n.querySelector('button[aria-label="Add ingredients to the prompt box"]')) n = n.parentElement; return n ? n.querySelectorAll('img[alt="Ingredient image"]').length : -1; }) };
  if (await chips.count()) throw new Error('composer already has an ingredient chip');
  const add = page.getByRole('button', { name: 'Add ingredients to the prompt box' });
  if ((await add.getAttribute('aria-expanded')) !== 'true') await add.click();
  await page.waitForTimeout(2000);
  // the panel remembers its last tab (once it landed on Avatars) -> always go back to All
  await page.locator('.cdk-overlay-pane').getByText('All', { exact: true }).first().click().catch(() => {});
  await page.waitForTimeout(1200);
  const item = page.locator('.cdk-overlay-pane').getByText(`${id}.png`, { exact: true }).first();
  await item.scrollIntoViewIfNeeded();
  await item.click();
  await page.waitForTimeout(1200);
  const atp = page.getByRole('button', { name: 'Add to prompt' });
  if (await atp.isVisible().catch(() => false)) await atp.click();
  await page.waitForTimeout(800);
  await page.keyboard.press('Escape').catch(() => {});
  await page.waitForTimeout(600);
  if ((await chips.count()) !== 1) throw new Error(`expected 1 chip after attaching ${id}, got ${await chips.count()}`);
}
async function approveIfAsked(page) {
  const body = await page.evaluate(() => document.body.innerText);
  if (body.lastIndexOf('Would you like me to kick off') < body.lastIndexOf('Generate exactly one 16:9 video')) return;   // only when the latest turn is the question
  const a = page.getByText('Always approve', { exact: true });
  if (await a.count() && await a.last().isVisible().catch(() => false)) { await a.last().click().catch(() => {}); log('approved'); }
}
// scan every grid tile once: hover exposes its <video>, whose src carries the video media id
async function downloadAll(page, want) {   // want: { mediaId: sceneId }
  const tiles = page.locator('flow-video-tile');
  const n = await tiles.count();
  for (let i = 0; i < n && Object.keys(want).length; i++) {
    const tile = tiles.nth(i);
    await tile.scrollIntoViewIfNeeded({ timeout: 5000 }).catch(() => {});
    await tile.hover({ timeout: 5000 }).catch(() => {});
    let src = '';
    for (let k = 0; k < 8 && !src.includes('/video/'); k++) { await page.waitForTimeout(500); src = await tile.evaluate(t => t.querySelector('video')?.currentSrc || t.querySelector('video')?.src || '', null, { timeout: 5000 }).catch(() => ''); }
    const id = want[mid(src)];
    if (!id) continue;
    log(`SAVED ${id} ${mid(src)} ${await save(src, `work/raw/${id}.mp4`)}`);
    delete want[mid(src)];
  }
}

export default async ({ page }) => {
  const t0 = Date.now();
  while (Date.now() - t0 < LIMIT_MIN * 60000) {
    await approveIfAsked(page);
    const m = await chatMap(page);
    const want = Object.fromEntries(Object.entries(m).filter(([id]) => !existsSync(`work/raw/${id}.mp4`)).map(([id, v]) => [mid(v.src), id]));
    if (Object.keys(want).length) await downloadAll(page, want).catch(e => log(`dl ${e.message.slice(0, 150)}`));
    const submitted = new Set(read('work/logs/video-submits.log').split('\n').map(l => l.split(' ')[1]).filter(Boolean));
    const ready = S.sections.filter(s => existsSync(`work/stills/${s.id}.png`));
    const pending = ready.filter(s => submitted.has(s.id) && !existsSync(`work/raw/${s.id}.mp4`));
    const next = ready.find(s => !submitted.has(s.id) && !existsSync(`work/raw/${s.id}.mp4`));
    if (!next && !pending.length) {
      if (ready.length === S.sections.length) break;
      log('waiting for stills'); await page.waitForTimeout(60000); continue;
    }
    if (next && pending.length < MAXQ) {
      try {
        if (!read('work/logs/uploads.log').split('\n').includes(next.id)) await upload(page, next.id);
        await attach(page, next.id);
        await submit(page, videoPrompt(next));
        appendFileSync('work/logs/video-submits.log', `${new Date().toISOString()} ${next.id}\n`);
        log(`SUBMITTED ${next.id} (in flight ${pending.length + 1})`);
        await page.waitForTimeout(25000);
      } catch (e) {
        log(`submit ${next.id} failed: ${e.message.slice(0, 200)}`);
        // asset never showed up in the ingredients list -> the upload silently died; re-upload next round
        if (e.message.includes(`'${next.id}.png'`)) writeFileSync('work/logs/uploads.log', read('work/logs/uploads.log').split('\n').filter(l => l && l !== next.id).join('\n') + '\n');
        await page.shot(`work/logs/fail-${next.id}.png`).catch(() => {});
        await page.waitForTimeout(20000);
      }
      continue;
    }
    await page.waitForTimeout(30000);
  }
  log('VIDEO RUN END');
};
