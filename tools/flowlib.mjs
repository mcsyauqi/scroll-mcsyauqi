// shared Flow helpers (page = Playwright page on flow.google project)
import { writeFileSync } from 'node:fs';
export const mid = src => (src.split(/\/(?:image|video)\//)[1] || '').split('?')[0];
export const imageIds = page => page.$$eval('img', is => is.filter(i => i.src.includes('flow-content.google/image/')).map(i => i.src));
export async function save(url, file) {
  const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0', Referer: 'https://flow.google.com/' } });
  const buf = Buffer.from(await r.arrayBuffer());
  if (!r.ok || buf.length < 50000) throw new Error(`download ${r.status} ${buf.length}`);
  writeFileSync(file, buf); return buf.length;
}
export async function submit(page, text) {
  for (let k = 0; k < 3 && await page.locator('.cdk-overlay-backdrop').count(); k++) { await page.locator('.cdk-overlay-backdrop').last().click({ force: true }); await page.waitForTimeout(500); }
  await page.waitForSelector('button[aria-label="Start generation"]', { timeout: 600000 });
  const box = page.locator('[contenteditable="true"]').last();
  await box.evaluate(e => e.focus());
  await page.keyboard.insertText(text);
  await page.waitForTimeout(800);
  await page.waitForSelector('button[aria-label="Start generation"]:not([disabled])', { timeout: 60000 });
  await page.getByRole('button', { name: 'Start generation' }).click();
}
