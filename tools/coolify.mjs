// node tools/coolify.mjs <METHOD> <path> [jsonBody]  -> Coolify API on the personal box (token: HOSTINGER3_COOLIFY_API_TOKEN)
import { env } from './env.mjs';
const [m = 'GET', p, body] = process.argv.slice(2);
// path without leading slash (Git Bash rewrites "/x" args into Windows paths)
const r = await fetch('https://coolify.mcsyauqi.com/api/v1/' + p.replace(/^\/+/, ''), { method: m, headers: { Authorization: `Bearer ${env.HOSTINGER3_COOLIFY_API_TOKEN}`, 'Content-Type': 'application/json', Accept: 'application/json' }, body });
const t = await r.text();
let j; try { j = JSON.parse(t); } catch { j = t; }
const sel = process.env.SEL ? new Function('j', 'return ' + process.env.SEL)(j) : j;
console.log(r.status, typeof sel === 'string' ? sel.slice(0, 1500) : JSON.stringify(sel, null, 1).slice(0, 3000));
