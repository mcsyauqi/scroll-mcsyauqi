// node tools/wait-deploy.mjs [sha]  -> poll the newest Coolify deployment of the app until it ends, print status
import { env } from './env.mjs';
const APP = 'ae9utmbde8kwrmxwfbd6zvjl';
const H = { Authorization: `Bearer ${env.HOSTINGER3_COOLIFY_API_TOKEN}`, Accept: 'application/json' };
const sha = process.argv[2];
for (let i = 0; i < 80; i++) {
  const j = await fetch(`https://coolify.mcsyauqi.com/api/v1/deployments/applications/${APP}`, { headers: H }).then(r => r.json()).catch(() => ({}));
  const d = (j.deployments || []).find(x => !sha || (x.commit || '').startsWith(sha));
  if (d && /finished|failed|cancelled/.test(d.status)) { console.log(d.status, d.deployment_uuid, (d.commit || '').slice(0, 7)); process.exit(d.status === 'finished' ? 0 : 1); }
  await new Promise(r => setTimeout(r, 15000));
}
console.log('timeout'); process.exit(1);
