// PROJ=<id> node tools/cdp.mjs tools/upload.mjs <file...>  -> upload local images into the project via the Add media menu
import path from 'node:path';
export default async ({ page, args }) => {
  for (const f of args) {
    await page.getByRole('button', { name: 'Add media menu' }).click();
    await page.waitForTimeout(1200);
    const items = page.locator('.cdk-overlay-pane [role^="menuitem"], .cdk-overlay-pane button');
    const labels = (await items.allInnerTexts()).map(t => t.replace(/\s+/g, ' ').trim());
    console.log('MENU', JSON.stringify(labels));
    const i = labels.findIndex(t => /upload/i.test(t));
    const [fc] = await Promise.all([page.waitForEvent('filechooser', { timeout: 15000 }), items.nth(i >= 0 ? i : 0).click()]);
    await fc.setFiles(path.resolve(f));
    console.log('UPLOADED', f);
    await page.waitForTimeout(6000);
  }
  await page.shot('work/logs/upload.png');
};
