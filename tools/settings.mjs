// open the prompt-box Settings panel and dump its controls (also clicks the Agent toggle to inspect modes)
export default async ({ page, args }) => {
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Settings', exact: true }).click();
  await page.waitForTimeout(2000);
  const txt = await page.evaluate(() => [...document.querySelectorAll('.cdk-overlay-container *')].filter(e => e.children.length === 0).map(e => (e.getAttribute('aria-label') || e.innerText || '').trim()).filter(Boolean).join(' | '));
  console.log('PANEL', txt.slice(0, 2500));
  await page.shot(args[0] || 'work/logs/settings.png');
};
