// node tools/cdp.mjs tools/send.mjs <prompt-file>  -> type the prompt into the Flow agent box and submit
import { readFileSync } from 'node:fs';
export default async ({ page, args }) => {
  for (let k = 0; k < 3 && await page.locator('.cdk-overlay-backdrop').count(); k++) { await page.locator('.cdk-overlay-backdrop').last().click({ force: true }); await page.waitForTimeout(500); }
  const text = readFileSync(args[0], 'utf8').trim();
  const box = page.locator('[contenteditable="true"]').last();
  await box.evaluate(e => e.focus());
  await page.keyboard.insertText(text);
  await page.waitForTimeout(800);
  await page.waitForSelector('button[aria-label="Start generation"]:not([disabled])', { timeout: 300000 });
  await page.getByRole('button', { name: 'Start generation' }).click();
  console.log(new Date().toLocaleTimeString(), 'SUBMITTED', args[0]);
};
