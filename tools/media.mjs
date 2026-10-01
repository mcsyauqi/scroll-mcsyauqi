// list project media (grid tiles) + tail of agent chat
export default async ({ page, args }) => {
  const tiles = await page.$$eval('img', is => is.filter(i => /flow-content|googleusercontent|\/image\/|\/video\//.test(i.src)).map(i => ({ alt: (i.alt || '').slice(0, 70), cls: i.className.slice(0, 40), src: i.src.slice(0, 110), w: i.naturalWidth, h: i.naturalHeight })));
  console.log('IMGS', tiles.length); tiles.forEach(t => console.log(JSON.stringify(t)));
  const t = (await page.evaluate(() => document.body.innerText)).replace(/\s+/g, ' ');
  console.log('TAIL', t.slice(-700));
  if (args[0]) await page.shot(args[0]);
};
