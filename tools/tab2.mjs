// open a second tab with a fresh Flow project (for video work) and print its URL
export default async ({ ctx }) => {
  const p = await ctx.newPage();
  await p.goto('https://flow.google.com/', { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(6000);
  await p.getByText('New project').click();
  await p.waitForTimeout(8000);
  for (const name of ['Get started', 'Close', 'Got it']) { const b = p.getByRole('button', { name }); if (await b.count()) await b.first().click().catch(() => {}); }
  console.log('URL', p.url());
};
