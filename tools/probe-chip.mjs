export default async ({ page }) => {
  await page.keyboard.press('Escape'); await page.waitForTimeout(800);
  const imgs = await page.$$eval('img', is => is.filter(i => i.offsetParent).map(i => { const r = i.getBoundingClientRect(); return { alt: i.alt.slice(0, 60), src: i.src.slice(0, 80), x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width) }; }));
  console.log(JSON.stringify(imgs, null, 0));
};
