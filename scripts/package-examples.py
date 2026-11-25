"""Create small, reproducible, self-contained teaching project archives."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED

root = Path(__file__).resolve().parent.parent
for name in ("product-intro", "chinese-explainer", "data-story", "footage-edit"):
    project = root / "examples" / name
    target = root / "public" / "examples" / f"{name}.zip"
    files = ["index.html", "gsap.min.js", "font.ttf", "OFL.txt", "hyperframes.json", "meta.json", "package.json", "DESIGN.md"]
    if name == "footage-edit":
        files.append("product-intro.mp4")
    with ZipFile(target, "w", ZIP_DEFLATED) as archive:
        for filename in files:
            archive.write(project / filename, f"{name}/{filename}")
        archive.write(root / "examples" / "shared" / "GSAP-LICENSE.txt", f"{name}/GSAP-LICENSE.txt")
    with ZipFile(target) as archive:
        assert archive.testzip() is None
    print(f"{name}.zip: verified")
