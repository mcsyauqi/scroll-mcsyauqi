// open ingredients panel (All tab) and print the asset names listed
export default async ({ page }) => {
  await page.keyboard.press('Escape');
  const add = page.getByRole('button', { name: 'Add ingredients to the prompt box' });
  if ((await add.getAttribute('aria-expanded')) !== 'true') await add.click();
  await page.waitForTimeout(2000);
  await page.locator('.cdk-overlay-pane').getByText('All', { exact: true }).first().click().catch(() => {});
  await page.waitForTimeout(1500);
  const names = await page.$$eval('.cdk-overlay-pane *', es => [...new Set(es.filter(e => e.childElementCount === 0 && /\.png$/.test(e.textContent.trim())).map(e => e.textContent.trim()))]);
  console.log(names.join(' '));
  await page.keyboard.press('Escape');
};
