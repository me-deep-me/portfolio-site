"""
Script one-shot: genera web/favicon.ico (multi-size) per
PackagingOptimizer.
Eseguire una volta: py make_icon.py
"""
from PIL import Image, ImageDraw
import os, math

OUT = os.path.join(os.path.dirname(__file__), "web", "favicon.ico")
SIZES = [16, 24, 32, 48, 64, 128, 256]

# Palette
BG      = (11,  18,  50,  255)   # navy scuro
ACCENT  = (99,  168, 255, 255)   # azzurro chiaro
ACCENT2 = (160, 130, 255, 255)   # viola chiaro
WHITE   = (230, 240, 255, 255)


def draw_frame(size: int) -> Image.Image:
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d   = ImageDraw.Draw(img)
    s   = size

    # --- sfondo arrotondato ---
    r  = max(3, s // 5)
    d.rounded_rectangle([0, 0, s - 1, s - 1], radius=r, fill=BG)

    # --- container: rettangolo in primo piano ---
    m  = max(2, s // 6)           # margine esterno
    lw = max(1, s // 20)          # spessore linee

    bx1, by1 = m, int(s * 0.28)
    bx2, by2 = s - m - 1, int(s * 0.80)
    bw = bx2 - bx1
    bh = by2 - by1

    # corpo container (fill scuro + bordo accent)
    d.rectangle([bx1, by1, bx2, by2],
                fill=(20, 35, 80, 200), outline=ACCENT, width=lw)

    # linea coperchio (1/4 dall'alto)
    lid_y = by1 + bh // 4
    d.line([bx1, lid_y, bx2, lid_y], fill=ACCENT, width=lw)

    # divisori verticali (solo per size >= 32)
    if s >= 32:
        third = bw // 3
        for i in (1, 2):
            xv = bx1 + third * i
            d.line([xv, lid_y, xv, by2], fill=(*ACCENT[:3], 130), width=max(1, lw - 1))

    # freccia "up" sopra il container (solo size >= 24)
    if s >= 24:
        ax  = s // 2
        a_top = max(2, int(s * 0.06))
        a_bot = by1 - max(2, s // 10)
        aw  = max(2, s // 7)
        # gambo
        d.line([ax, a_bot, ax, a_top + aw], fill=ACCENT2, width=max(1, lw))
        # punta
        d.polygon([
            (ax,        a_top),
            (ax - aw,   a_top + aw),
            (ax + aw,   a_top + aw),
        ], fill=ACCENT2)

    return img


frames = []
for sz in SIZES:
    frames.append(draw_frame(sz))

frames[0].save(
    OUT,
    format="ICO",
    sizes=[(s, s) for s in SIZES],
    append_images=frames[1:],
)
print(f"Icona salvata in: {OUT}")
