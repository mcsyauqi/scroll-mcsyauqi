# py tools/sheet.py out.jpg img1 img2 ...  -> labelled 3-column contact sheet for visual QA
import sys, os
from PIL import Image, ImageDraw
out, files = sys.argv[1], sys.argv[2:]
W, H, C = 480, 268, 3
rows = (len(files) + C - 1) // C
sheet = Image.new('RGB', (W * C, (H + 22) * rows), (20, 20, 20))
d = ImageDraw.Draw(sheet)
for i, f in enumerate(files):
    im = Image.open(f).convert('RGB'); im.thumbnail((W, H))
    x, y = (i % C) * W, (i // C) * (H + 22)
    sheet.paste(im, (x, y + 22)); d.text((x + 6, y + 5), os.path.basename(f), fill=(255, 255, 255))
sheet.save(out, quality=85)
