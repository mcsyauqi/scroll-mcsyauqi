// node build.mjs  -> encode assets (idempotent) + write site/index.html from scenes.json
// work/stills/<id>.png (Flow Nano Banana Pro) -> site/assets/<id>.webp
// work/raw/<id>.mp4    (Flow Veo 3.1 Fast)    -> site/assets/vid/<id>.mp4 (+ poster = its own first frame)
import { readFileSync, writeFileSync, existsSync, copyFileSync, mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const S = JSON.parse(readFileSync('scenes.json', 'utf8'));
const SITE = 'https://scroll.mcsyauqi.com/';
const ff = (...a) => execFileSync('ffmpeg', ['-v', 'error', '-y', ...a], { stdio: 'inherit' });
mkdirSync('site/assets/vid', { recursive: true });
copyFileSync('scrub-engine.js', 'site/scrub-engine.js');   // project copy of the skill engine (one local patch, see primeVideo)

const sections = [];
for (const [i, s] of S.sections.entries()) {
  const still = `site/assets/${s.id}.webp`, raw = `work/raw/${s.id}.mp4`, clip = `site/assets/vid/${s.id}.mp4`, poster = `site/assets/${s.id}-poster.webp`;
  if (!existsSync(`work/stills/${s.id}.png`)) { console.log('MISSING still', s.id); continue; }
  if (!existsSync(still)) ff('-i', `work/stills/${s.id}.png`, '-c:v', 'libwebp', '-quality', '82', still);
  if (existsSync(raw) && !existsSync(clip)) {
    // scrub-friendly: no audio, GOP 4 (cheap seeks on phones too), light sharpen, faststart
    ff('-i', raw, '-an', '-vf', 'unsharp=5:5:0.8:5:5:0.0', '-c:v', 'libx264', '-preset', 'slow', '-crf', '21',
       '-pix_fmt', 'yuv420p', '-g', '4', '-keyint_min', '4', '-sc_threshold', '0', '-movflags', '+faststart', clip);
    ff('-ss', '0', '-i', clip, '-frames:v', '1', '-c:v', 'libwebp', '-quality', '84', poster);
  }
  const hasClip = existsSync(clip);
  const edge = i === 0 || i === S.sections.length - 1;
  sections.push({
    id: s.id, label: s.label, accent: s.accent,
    still: `assets/${s.id}.webp`,
    ...(hasClip ? { poster: `assets/${s.id}-poster.webp`, clip: `assets/vid/${s.id}.mp4` } : {}),
    scroll: edge ? 1.8 : 1.35, linger: edge ? 0.4 : 0.3,
    eyebrow: s.eyebrow, title: s.title, body: s.body, tags: s.tags,
    ...(s.cta ? { cta: s.cta } : {}),
  });
}
if (!existsSync('site/assets/og.jpg')) ff('-i', 'work/stills/pagi.png', '-q:v', '3', 'site/assets/og.jpg');

const esc = t => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const hero = S.sections[0], fin = S.sections.at(-1);
const title = 'Biar Mesin yang Repot: AI & Automation untuk Hidup dan Bisnis | mcsyauqi';
const desc = 'Terbang melewati 21 tempat di mana AI dan automation diam-diam menghemat waktu, tenaga, dan biaya, dari rumah, keuangan pribadi, sampai gudang, pabrik, dan warung UMKM.';
const seo = [
  `<h1>${esc(hero.title)} AI &amp; automation untuk hidup dan bisnis</h1>`,
  `<p>${esc(desc)}</p>`,
  ...S.sections.map(s => `<h2>${esc(s.eyebrow)}: ${esc(s.title)}</h2>\n      <p>${esc(s.body)}</p>`),
  `<p><a href="${esc(fin.cta.primary.href)}">${esc(fin.cta.primary.label)}</a></p>`,
  `<p>Semua visual di halaman ini dibuat dengan AI (Google Flow: Nano Banana Pro untuk gambar, Veo 3.1 untuk video).</p>`,
].join('\n      ');

const config = {
  brand: { name: 'mcsyauqi', href: 'https://mcsyauqi.com' },
  cta: { label: 'mcsyauqi.com', href: 'https://mcsyauqi.com' },
  hint: 'scroll untuk terbang masuk',
  nav: false,
  diveScroll: 1.35, connScroll: 0.9,
  crossfade: 0.3,                                   // ponytail: null connectors = direct dissolve; wider band hides the cut
  sections,
  connectors: Array(sections.length - 1).fill(null),
};

writeFileSync('site/index.html', `<!doctype html>
<html lang="id">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(desc)}" />
  <link rel="canonical" href="${SITE}" />
  <meta name="theme-color" content="#0F1B3D" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${SITE}" />
  <meta property="og:title" content="${esc(title)}" />
  <meta property="og:description" content="${esc(desc)}" />
  <meta property="og:image" content="${SITE}assets/og.jpg" />
  <meta name="twitter:card" content="summary_large_image" />
  <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='8' fill='%230F1B3D'/%3E%3Ccircle cx='16' cy='16' r='7' fill='%2331DDB0'/%3E%3C/svg%3E" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Rethink+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
  <link rel="preload" as="image" href="${sections[0].poster || sections[0].still}" />
  <style>
    :root, .sw-root {
      --sw-bg: #0F1B3D; --sw-ink: #F4F7FB; --sw-ink-soft: #9FB0D6; --sw-accent: #31DDB0;
      --sw-font-display: 'Rethink Sans', system-ui, sans-serif; --sw-font-body: 'Rethink Sans', system-ui, sans-serif;
    }
    html, body { background: #0F1B3D; }
    .sw-sky__glow { background: radial-gradient(60% 42% at 74% 16%, color-mix(in srgb, var(--sw-accent) 16%, transparent), transparent 70%); }
    .sw-brand__mark, .sw-copy__num { display: none; }
    .sw-brand__name { font-weight: 800; letter-spacing: -.01em; }
    .sw-topcta { background: transparent; color: var(--sw-ink); border: 1.5px solid color-mix(in srgb, var(--sw-ink) 30%, transparent); border-radius: 10px; }
    .sw-copy__title { font-weight: 800; letter-spacing: -.025em; }
    .sw-copy__tags li { color: var(--sw-accent); background: color-mix(in srgb, var(--sw-accent) 12%, transparent); border-color: color-mix(in srgb, var(--sw-accent) 35%, transparent); border-radius: 8px; }
    .sw-btn { border-radius: 10px; }
    .sw-btn--primary { background: var(--sw-accent); color: #0F1B3D; }
    .sw-btn--ghost { color: var(--sw-ink); }
    .sw-route { gap: 10px; }
    .sw-route__label { background: color-mix(in srgb, #0F1B3D 88%, transparent); color: var(--sw-ink); }
    /* desktop: push the dioramas right so the copy column sits on open navy, not on the island */
    @media (min-width: 1024px) { .sw-scene { transform: translateX(9vw); } }
    /* mid-dive the clip fills the frame: a deeper navy scrim keeps the copy column readable */
    @media (min-width: 861px) {
      .sw-copylayer::before { width: min(64vw, 920px); background: linear-gradient(90deg, var(--sw-bg) 0%, color-mix(in srgb, var(--sw-bg) 92%, transparent) 38%, color-mix(in srgb, var(--sw-bg) 55%, transparent) 66%, transparent 100%); }
    }
    .sw-copy__title { text-shadow: 0 2px 24px rgba(8, 14, 36, .85); }
    .sw-copy__body { text-shadow: 0 1px 14px rgba(8, 14, 36, .95); }
    .ai-note { position: fixed; left: clamp(18px, 5vw, 64px); bottom: 18px; z-index: 45; font: 500 .72rem/1.3 'Rethink Sans', system-ui, sans-serif; color: var(--sw-ink-soft); opacity: .8; }
    @media (max-width: 860px) {
      .sw-route { gap: 4px; }
      .sw-copy { right: 44px; }              /* keep text clear of the route rail */
      .sw-hint { display: none; }            /* collided with tags + AI note; scrolling is self-evident on touch */
      .ai-note { left: 50%; transform: translateX(-50%); bottom: 6px; white-space: nowrap; }
    }
    @media (hover: none) and (pointer: coarse) { .sw-route__dot { width: 18px; height: 18px; } }
  </style>
</head>
<body>
  <div id="top"></div>
  <div id="world">
    <section data-sw-seo>
      ${seo}
    </section>
  </div>
  <p class="ai-note">Semua visual dibuat dengan AI (Nano Banana Pro + Veo 3.1)</p>
  <script src="scrub-engine.js"></script>
  <script>
    mountScrollWorld(document.getElementById('world'), ${JSON.stringify(config, null, 2).replace(/\n/g, '\n    ')});
  </script>
</body>
</html>
`);
console.log('built', sections.length, 'sections,', sections.filter(s => s.clip).length, 'with clips');
