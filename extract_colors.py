# -*- coding: utf-8 -*-
from PIL import Image
from pathlib import Path
import colorsys, re

site = Path(r'C:/Users/曲绍阳/Desktop/portfolio-site')
imgdir = site / 'images'
colors = []
for i in range(1, 18):
    p = imgdir / f'photo-{i:02d}.jpg'
    im = Image.open(p).convert('RGB')
    im.thumbnail((120, 120))
    pixels = list(im.getdata())
    candidates = []
    for r,g,b in pixels[::3]:
        h,s,v = colorsys.rgb_to_hsv(r/255, g/255, b/255)
        # Avoid near-black/near-white/very gray colors; choose visible accent colors.
        if s > 0.22 and 0.30 < v < 0.95:
            candidates.append((r,g,b,s,v))
    if not candidates:
        candidates = [(r,g,b,*colorsys.rgb_to_hsv(r/255,g/255,b/255)[1:]) for r,g,b in pixels]
    # Quantize to 24-level buckets and choose a frequent, saturated bucket.
    buckets = {}
    for r,g,b,s,v in candidates:
        key = (round(r/24)*24, round(g/24)*24, round(b/24)*24)
        score = buckets.get(key, 0)
        buckets[key] = score + 1 + s * 2 + v
    rgb = max(buckets.items(), key=lambda x: x[1])[0]
    # brighten slightly for dark modal readability
    rr,gg,bb = rgb
    h,s,v = colorsys.rgb_to_hsv(rr/255, gg/255, bb/255)
    v = max(v, 0.72)
    s = min(max(s, 0.35), 0.75)
    rr,gg,bb = [round(x*255) for x in colorsys.hsv_to_rgb(h,s,v)]
    colors.append(f'#{rr:02x}{gg:02x}{bb:02x}')

js = site / 'data.js'
s = js.read_text(encoding='utf-8')
s = re.sub(r"\nconst PHOTO_COLORS = \[[\s\S]*?\];\n?", "\n", s)
s += "\nconst PHOTO_COLORS = [\n  " + ",\n  ".join(repr(c) for c in colors) + "\n];\n"
js.write_text(s, encoding='utf-8')
for idx, c in enumerate(colors, 1):
    print(f'photo-{idx:02d}: {c}')
