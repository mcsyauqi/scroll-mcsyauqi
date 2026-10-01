// upload one file and print any toast/snackbar text that appears within 15 s
import path from 'node:path';
export default async ({ page, args }) => {
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Add media menu' }).click();
  await page.waitForTimeout(1200);
  const items = page.locator('.cdk-overlay-pane [role^="menuitem"], .cdk-overlay-pane button');
  const i = (await items.allInnerTexts()).findIndex(t => /upload/i.test(t));
  const [fc] = await Promise.all([page.waitForEvent('filechooser', { timeout: 15000 }), items.nth(Math.max(i, 0)).click()]);
  await fc.setFiles(path.resolve(args[0]));
  for (let k = 0; k < 15; k++) {
    await page.waitForTimeout(1000);
    const t = await page.$$eval('[role="alert"], [role="status"], .mat-mdc-snack-bar-label, simple-snack-bar, .cdk-overlay-pane', es => es.map(e => e.innerText.replace(/\s+/g, ' ').trim()).filter(Boolean).join(' | '));
    if (t) console.log(k, t.slice(0, 300));
  }
};
