// node tools/dns.mjs [create]  -> show (and optionally create) A scroll.mcsyauqi.com -> 72.61.143.148, DNS-only
import { env } from './env.mjs';
const H = { Authorization: `Bearer ${env.CLOUDFLARE_API_TOKEN}`, 'Content-Type': 'application/json' };
const cf = (p, o = {}) => fetch('https://api.cloudflare.com/client/v4' + p, { headers: H, ...o }).then(r => r.json());
const z = await cf('/zones?name=mcsyauqi.com');
if (!z.success || !z.result.length) { console.log('zone lookup failed', JSON.stringify(z.errors)); process.exit(1); }
const zid = z.result[0].id;
const recs = await cf(`/zones/${zid}/dns_records?name=scroll.mcsyauqi.com`);
console.log('existing', JSON.stringify(recs.result.map(r => [r.type, r.content, r.proxied])));
const ref = await cf(`/zones/${zid}/dns_records?name=keyword.mcsyauqi.com`);
console.log('ref keyword', JSON.stringify(ref.result.map(r => [r.type, r.content, r.proxied])));
if (process.argv[2] === 'create' && !recs.result.length) {
  const r = await cf(`/zones/${zid}/dns_records`, { method: 'POST', body: JSON.stringify({ type: 'A', name: 'scroll', content: '72.61.143.148', ttl: 300, proxied: false }) });
  console.log('create', r.success, JSON.stringify(r.errors));
}
