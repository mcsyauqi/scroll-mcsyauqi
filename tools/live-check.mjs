// node tools/live-check.mjs  -> fetch live page + every referenced asset; print status/type/size summary and grep counts
const BASE = 'https://scroll.mcsyauqi.com/';
const r = await fetch(BASE);
const html = await r.text();
const count = re => (html.match(re) || []).length;
console.log('page', r.status, r.headers.get('content-type'), html.length + 'B');
console.log('NEW: sections with clip =', count(/"clip": "assets\/vid\//g), '| h2 in SEO block =', count(/<h2>/g), '| finale title =', count(/Manusia \+ AI, tim terbaik/g));
console.log('OLD/forbidden: em dash =', count(/—/g), '| sections without clip (no "clip") =', count(/"still": "assets\/[a-z]+\.webp",\s*"scroll"/g));
const assets = [...new Set([...html.matchAll(/"(assets\/[^"]+)"/g)].map(m => m[1]).concat(['scrub-engine.js']))];
let ok = 0, bad = [];
for (const a of assets) {
  const res = await fetch(BASE + a, { method: 'HEAD' });
  const t = res.headers.get('content-type') || '';
  if (res.status === 200 && /video\/mp4|image\/webp|image\/jpeg|javascript/.test(t)) ok++; else bad.push(`${a} ${res.status} ${t}`);
}
console.log('assets', ok + '/' + assets.length, 'OK', bad.length ? 'BAD: ' + bad.join(', ') : '');
