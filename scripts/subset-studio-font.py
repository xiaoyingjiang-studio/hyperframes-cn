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
    "src/pages/404.astro",
    "src/ui/StudioLayout.astro",
    "src/pages/creators/index.astro",
    "src/pages/creators/[slug].astro",
]
text = "".join((root / path).read_text(encoding="utf-8") for path in files)
intents = json.loads((root / "content/discovery.json").read_text(encoding="utf-8"))["pages"]
text += json.dumps([page for page in intents if page["id"] == "studio-home" or page["id"].startswith("creator-")], ensure_ascii=False)
text += (root / "content/creator-guides.json").read_text(encoding="utf-8")
options = subset.Options()
options.flavor = "woff2"
options.recalc_timestamp = False
font = subset.load_font(str(args.source), options)
subsetter = subset.Subsetter(options=options)
subsetter.populate(unicodes=set(map(ord, text)) | set(range(32, 127)))
subsetter.subset(font)
output = root / "public-studio/fonts/studio-sans.woff2"
output.parent.mkdir(parents=True, exist_ok=True)
subset.save_font(font, str(output), options)
print(f"Studio font: {output.stat().st_size:,} bytes; variable weight axis preserved")
