# scroll.mcsyauqi.com - scroll-world AI & automation (goal 2026-10-01)

Done = skill scroll-world terpasang + https://scroll.mcsyauqi.com live, 21 section scroll-scrubbed (klip Veo per scene + copy animasi), diverifikasi live (fetch + screenshot Playwright + console bersih).

Jalur aset: Higgsfield belum login + berbayar, gemini-web 429 se-IP, chatgpt-web blob bug -> Google Flow UI via CDP (Chrome :9420, profil flow-pp-cli primary, akun ahmadthariqsyauqi PRO). Project Flow: https://flow.google.com/project/bcb0e02a-1bc9-4978-9626-dd1b5b9586b5

- [x] Install skill (~/.claude/skills/scroll-world)
- [x] DNS A scroll.mcsyauqi.com -> 72.61.143.148 (Cloudflare, DNS-only)
- [x] Flow settings: confirm Never, image 16:9 x1 Nano Banana Pro, video 16:9 x1 Veo 3.1 Fast
- [x] Anchor still pagi.png (dicek visual, lolos)
- [x] 20 still sisanya (tools/gen-images.mjs, log work/logs/gen-images.log) - finale menyusul
- [x] QA visual still (sheet1/sheet2: kohesif, tanpa teks)
- [x] 21 klip Veo image-to-video (start frame = still), Flow project 83122f37, kredit 880 -> 480
- [x] Encode -g 4 crf 21 720p + poster dari klip + still webp
- [x] build.mjs -> site/index.html (SEO block, tema gelap brand mcsyauqi)
- [x] Repo github.com/mcsyauqi/scroll-mcsyauqi (master) + Coolify app ae9utmbde8kwrmxwfbd6zvjl (dockerfile nginx), deploy pertama finished, TLS valid
- [x] Verifikasi live: 200 + TLS, 64/64 aset, 21/21 klip scrub desktop + mobile, 0 error, reduced-motion OK (fix: patch engine AbortError + strip Alt-Svc h3)
- [x] Memory + laporan
