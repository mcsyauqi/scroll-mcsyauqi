// create a fresh Flow project, dismiss overlays, dump buttons
export default async ({ page }) => {
  await page.getByText('New project').click();
  await page.waitForTimeout(6000);
  for (const name of ['Get started', 'Close', 'Got it']) {
    const b = page.getByRole('button', { name });
    if (await b.count()) await b.first().click().catch(() => {});
  }
  await page.locator('.cdk-overlay-backdrop').click().catch(() => {});
  await page.waitForTimeout(1500);
  console.log('URL', page.url());
  const btns = await page.$$eval('button', bs => bs.map(b => (b.getAttribute('aria-label') || b.innerText).replace(/\s+/g, ' ').trim()).filter(Boolean));
  console.log('BUTTONS', JSON.stringify(btns));
  await page.shot('work/logs/proj.png');
};
