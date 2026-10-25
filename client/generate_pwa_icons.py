
from pathlib import Path
from PIL import Image, ImageDraw

public = Path("public")
public.mkdir(exist_ok=True)

for size in (192, 512):
    img = Image.new("RGB", (size, size), "#4f46e5")
    draw = ImageDraw.Draw(img)

    # Rounded white task card
    margin = int(size * 0.22)
    radius = int(size * 0.09)
    draw.rounded_rectangle(
        (margin, margin, size - margin, size - margin),
        radius=radius,
        fill="white"
    )

    # Task lines and check marks
    x1 = int(size * 0.39)
    x2 = int(size * 0.69)
    for y_ratio in (0.40, 0.50, 0.60):
        y = int(size * y_ratio)
        r = max(3, int(size * 0.025))
        draw.ellipse((int(size * 0.31)-r, y-r,
                      int(size * 0.31)+r, y+r), fill="#4f46e5")
        draw.rounded_rectangle(
            (x1, y-r, x2, y+r),
            radius=r,
            fill="#4f46e5"
        )

    img.save(public / f"pwa-{size}x{size}.png")

print("Created both PWA icons in the public folder.")
