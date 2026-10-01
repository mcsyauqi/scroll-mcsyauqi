export default async ({ page }) => {
  await page.getByText('Always approve').last().click();
  await page.waitForTimeout(15000);
  const t = (await page.evaluate(() => document.body.innerText)).replace(/\s+/g, ' ');
  console.log('TAIL', t.slice(-400));
  await page.shot('work/logs/approve.png');
};
