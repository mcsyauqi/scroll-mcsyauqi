// node tools/cdp.mjs <step.mjs> [args]  -> connect to the long-lived Flow Chrome on :9420 and run a step module.
// Launch Chrome first (plain chrome.exe, no webdriver flag):
//   chrome.exe --user-data-dir=%USERPROFILE%\.config\flow-pp-cli\chrome-profiles\primary --remote-debugging-port=9420 https://flow.google.com/
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
const { chromium } = createRequire('D:/Projects/Creativism App/package.json')('playwright');
const browser = await chromium.connectOverCDP('http://127.0.0.1:9420');
const ctx = browser.contexts()[0];
const page = ctx.pages().find(p => p.url().includes(process.env.PROJ || 'bcb0e02a')) || ctx.pages()[0];
// Playwright screenshots time out on Flow (font wait) -> raw CDP capture
page.shot = async file => {
  const s = await ctx.newCDPSession(page);
  const { data } = await s.send('Page.captureScreenshot', { format: 'png' });
  (await import('node:fs')).writeFileSync(file, Buffer.from(data, 'base64'));
};
const step = await import(pathToFileURL(path.resolve(process.argv[2])).href);
try { await step.default({ page, ctx, browser, args: process.argv.slice(3) }); } catch (e) { console.log('STEP ERR', e.message.slice(0, 600)); }
process.exit(0);
