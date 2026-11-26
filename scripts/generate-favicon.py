"""Generate the site's multi-resolution ICO from the supplied brand asset.

Usage: python scripts/generate-favicon.py
Requires Pillow; not part of the normal site build.
"""
from pathlib import Path

from PIL import Image

root = Path(__file__).resolve().parents[1]
source = root / "assets/brand/product-icon-original.png"
output = root / "public/favicon.ico"

with Image.open(source) as image:
    # Keep the complete mark and its background, with balanced outer margins.
    icon = image.crop((154, 146, 1382, 1374)).convert("RGBA")
    icon.save(
        output,
        format="ICO",
        sizes=[(size, size) for size in (16, 24, 32, 48, 64, 128, 256)],
    )

print(f"Favicon: {output.stat().st_size:,} bytes; 16–256 px")
