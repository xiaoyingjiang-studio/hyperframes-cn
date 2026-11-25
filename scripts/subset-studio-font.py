"""Build the landing page's self-hosted Noto Sans SC variable font subset.

Usage: python scripts/subset-studio-font.py /path/to/NotoSansSC-VF.ttf
Requires fontTools[woff] and Brotli. Not part of the normal site build.
"""
import argparse
import json
from pathlib import Path

from fontTools import subset

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("source", type=Path)
args = parser.parse_args()
root = Path(__file__).resolve().parents[1]
files = [
    "src/pages/index.astro",
    "src/components/Header.astro",
    "src/components/Footer.astro",
    "src/lib/site.ts",
]
text = "".join((root / path).read_text(encoding="utf-8") for path in files)
home = next(page for page in json.loads((root / "content/discovery.json").read_text(encoding="utf-8"))["pages"] if page["id"] == "home")
text += json.dumps(home, ensure_ascii=False)
options = subset.Options()
options.flavor = "woff2"
options.recalc_timestamp = False
font = subset.load_font(str(args.source), options)
subsetter = subset.Subsetter(options=options)
subsetter.populate(unicodes=set(map(ord, text)) | set(range(32, 127)))
subsetter.subset(font)
output = root / "public/fonts/studio-sans.woff2"
output.parent.mkdir(parents=True, exist_ok=True)
subset.save_font(font, str(output), options)
print(f"Studio font: {output.stat().st_size:,} bytes; variable weight axis preserved")
