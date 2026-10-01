// hover the first media tile and list its action buttons; also list the "+" (ingredients) menu
export default async ({ page }) => {
  const tile = page.locator('img[alt^="Tile"]').first();
  await tile.waitFor({ timeout: 60000 });
  await tile.hover();
  await page.waitForTimeout(1500);
  const btns = await page.$$eval('button', bs => bs.filter(b => b.offsetParent).map(b => (b.getAttribute('aria-label') || b.innerText).replace(/\s+/g, ' ').trim()).filter(Boolean));
  console.log('VISIBLE BUTTONS', JSON.stringify(btns));
  await page.shot('work/logs/tile.png');
  await page.getByRole('button', { name: 'Add ingredients to the prompt box' }).click();
  await page.waitForTimeout(2000);
  const ov = await page.$$eval('.cdk-overlay-pane', ps => ps.map(p => p.innerText.replace(/\s+/g, ' ').slice(0, 400)));
  console.log('INGREDIENTS', JSON.stringify(ov));
  await page.shot('work/logs/ingredients.png');
};
