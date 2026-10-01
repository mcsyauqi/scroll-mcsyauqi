// node tools/cdp.mjs tools/peek.mjs [shot.png]  -> url, visible text tail, screenshot
export default async ({ page, args }) => {
  await page.waitForTimeout(1500);
  console.log('URL', page.url());
  const t = (await page.evaluate(() => document.body.innerText)).replace(/\s+/g, ' ');
  console.log('TEXT', t.slice(0, 600), '\n...TAIL', t.slice(-500));
  await page.shot(args[0] || 'work/logs/peek.png');
};
