export default async ({ page }) => {
  const chip = page.getByRole('button', { name: 'Image ingredient' }).first();
  await chip.hover(); await page.waitForTimeout(800);
  const near = await chip.evaluate(b => [...b.parentElement.parentElement.querySelectorAll('button')].map(x => x.getAttribute('aria-label') || x.innerText.trim()));
  console.log('near after hover', JSON.stringify(near));
  await page.shot('work/logs/chip.png');
};
