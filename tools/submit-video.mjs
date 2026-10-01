// submit the video prompt for <id> with whatever chip is attached (test helper)
import { readFileSync } from 'node:fs';
import { submit } from './flowlib.mjs';
import { videoPrompt } from './gen-video.mjs';
const S = JSON.parse(readFileSync('scenes.json', 'utf8'));
export default async ({ page, args }) => {
  await submit(page, videoPrompt(S.sections.find(x => x.id === args[0])));
  console.log(new Date().toLocaleTimeString(), 'SUBMITTED', args[0]);
  await page.waitForTimeout(30000);
  const t = (await page.evaluate(() => document.body.innerText)).replace(/\s+/g, ' ');
  console.log('TAIL', t.slice(-600));
  await page.shot('work/logs/video-submit.png');
};
