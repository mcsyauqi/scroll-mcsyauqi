// read-only: text of the agent chat after the last mention of args[0].png
export default async ({ page, args }) => {
  const t = (await page.evaluate(() => document.body.innerText)).replace(/\s+/g, ' ');
  const i = t.lastIndexOf(`attached image ${args[0]}.png`);
  console.log(i < 0 ? 'not found' : t.slice(i, i + 1400).replace(/Video prompt:.*?no logos\./, '[prompt]'));
};
