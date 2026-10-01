// args: imageModel videoModel (substring). Opens Settings panel if needed, sets Never + 16:9 x1 + models, saves.
export default async ({ page, args }) => {
  const [imgModel, vidModel] = args;
  for (let k = 0; k < 3 && await page.locator(".cdk-overlay-backdrop").count(); k++) { await page.locator(".cdk-overlay-backdrop").last().click({ force: true }); await page.waitForTimeout(600); }
  if (!(await page.getByText('Agent settings').count())) {
    await page.getByRole('button', { name: 'Settings', exact: true }).click();
    await page.waitForTimeout(1500);
  }
  const P = page.locator('text=Agent settings').locator('xpath=ancestor::*[.//button[normalize-space()="Save"]][1]');
  await P.getByText('Never', { exact: true }).click();
  const sec = t => P.locator(`xpath=.//*[normalize-space()="${t}"]/following-sibling::*`);
  for (const t of ['Image generation default', 'Video generation default']) {
    await sec(t).getByText('16:9', { exact: true }).first().click();
    await sec(t).getByText('x1', { exact: true }).first().click();
  }
  for (const [label, want] of [['Image generation default model', imgModel], ['Video generation default model', vidModel]]) {
    await page.locator(`button[aria-label="${label}"]`).click();
    await page.waitForTimeout(1000);
    const items = page.locator('.cdk-overlay-pane [role^="menuitem"], .cdk-overlay-pane [role="option"]');
    const opts = await items.allInnerTexts();
    console.log(label, JSON.stringify(opts.map(o => o.replace(/\s+/g, ' ').trim())));
    const i = opts.findIndex(o => o.toLowerCase().includes(want.toLowerCase()));
    await items.nth(i >= 0 ? i : 0).click();
    await page.waitForTimeout(800);
  }
  await page.shot('work/logs/settings2.png');
  await P.getByRole('button', { name: 'Save' }).click();
  console.log('SAVED');
};
