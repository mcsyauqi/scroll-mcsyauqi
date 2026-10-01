// PROJ=<video project> node tools/cdp.mjs tools/gen-video.mjs <id...>
// For each scene: pick work/stills/<id>.png (already uploaded) from the ingredients panel, add to prompt, ask the agent
// for ONE Veo 3.1 Fast 16:9 clip that starts exactly on that frame (dive-in camera, per scroll-world prompts.md).
import { readFileSync, appendFileSync } from 'node:fs';
import { submit } from './flowlib.mjs';
const S = JSON.parse(readFileSync('scenes.json', 'utf8'));
export const videoPrompt = s => `Generate exactly one 16:9 video with Veo 3.1 Fast. Do not ask follow-up questions and do not generate any new image. ` +
  `Use the attached image ${s.id}.png as the exact FIRST FRAME (start frame) of the video, not as a style reference. ` +
  `Video prompt: Single continuous cinematic camera move, no cuts. The video opens exactly on this frame, the whole miniature diorama seen from outside like a tiny model. ` +
  `The camera slowly glides forward and gently descends toward ${s.focal}, as if flying into the little world, while the tiny robots and toy figurines come alive and go about their work. ` +
  `In the final second the camera settles into a slow, steady forward drift. Soft matte clay diorama, tilt-shift miniature, warm light with teal glow, plain deep navy background around the island. ` +
  `Smooth, graceful, slow motion, subtle parallax. No text, no captions, no logos.`;
export default async ({ page, args }) => {
  for (const id of args) {
    const s = S.sections.find(x => x.id === id);
    for (let k = 0; k < 3 && await page.locator('.cdk-overlay-backdrop').count(); k++) { await page.locator('.cdk-overlay-backdrop').last().click({ force: true }); await page.waitForTimeout(500); }
    await page.waitForSelector('button[aria-label="Start generation"]', { timeout: 600000 });
    const chips = (await page.evaluate(() => document.body.innerText)).replace(/\s+/g, ' ');
    if (!chips.includes(`${id}.png cancel`)) {   // attached chip renders as "image <name> cancel"
      const add = page.getByRole('button', { name: 'Add ingredients to the prompt box' });
      if ((await add.getAttribute('aria-expanded')) !== 'true') await add.click();
      await page.waitForTimeout(1500);
      await page.getByPlaceholder('Search assets').fill(id);
      await page.waitForTimeout(2000);
      await page.locator('.cdk-overlay-pane').getByText(`${id}.png`, { exact: true }).first().click();   // clicking the asset attaches it
      await page.waitForTimeout(1500);
      const atp = page.getByRole('button', { name: 'Add to prompt' });
      if (await atp.isVisible().catch(() => false)) await atp.click();
      await page.waitForTimeout(1000);
    }
    await submit(page, videoPrompt(s));
    appendFileSync('work/logs/video-submits.log', `${new Date().toISOString()} ${id}\n`);
    console.log(new Date().toLocaleTimeString(), 'SUBMITTED', id);
    await page.waitForTimeout(20000);
  }
  await page.shot('work/logs/video.png');
};
