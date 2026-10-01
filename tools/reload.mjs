export default async ({ page }) => {
  const stop = page.getByRole('button', { name: 'Stop' });
  if (await stop.count()) { await stop.click().catch(() => {}); await page.waitForTimeout(2000); }
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(8000);
  for (const name of ['Get started', 'Close', 'Got it']) { const b = page.getByRole('button', { name }); if (await b.count()) await b.first().click().catch(() => {}); }
  console.log('editable', await page.locator('[contenteditable="true"]').count(), 'stop', await page.getByRole('button', { name: 'Stop' }).count());
  const t = (await page.evaluate(() => document.body.innerText)).replace(/\s+/g, ' ');
  console.log(t.slice(-300));
};
