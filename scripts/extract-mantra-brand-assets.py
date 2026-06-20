#!/usr/bin/env python3
"""Extract Mantra.ai primary logo and favicon PNGs from brand identity board."""

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SRC = Path(
    "/Users/praveen/.cursor/projects/Users-praveen-Documents-Constel-AI-NextGEN/assets/"
    "ChatGPT_Image_Jun_20__2026__10_12_52_AM-3f4d5bfb-16e4-4f97-b9bd-d245b07ebdc9.png"
)
OUT = ROOT / "docs" / "assets" / "mantra-ai-brand"
PUBLIC = ROOT / "apps" / "web" / "public"


def trim_nonwhite(im: Image.Image, pad: int = 10, tol: int = 250) -> Image.Image:
    px = im.load()
    xs, ys = [], []
    for y in range(im.height):
        for x in range(im.width):
            r, g, b, a = px[x, y]
            if a > 10 and (r < tol or g < tol or b < tol):
                xs.append(x)
                ys.append(y)
    if not xs:
        return im
    return im.crop(
        (max(0, min(xs) - pad), max(0, min(ys) - pad), min(im.width, max(xs) + pad), min(im.height, max(ys) + pad))
    )


def main() -> None:
    src = SRC
    if not src.exists():
        raise SystemExit(f"Source board not found: {src}")

    OUT.mkdir(parents=True, exist_ok=True)
    im = Image.open(src).convert("RGBA")

    primary = trim_nonwhite(im.crop((58, 402, 448, 488)))
    favicon = im.crop((710, 448, 910, 648)).resize((512, 512), Image.Resampling.LANCZOS)

    primary.save(OUT / "mantra-ai-logo-primary.png")
    primary.resize((800, int(800 * primary.height / primary.width)), Image.Resampling.LANCZOS).save(
        OUT / "mantra-ai-logo-primary-800w.png"
    )
    favicon.save(OUT / "mantra-ai-favicon.png")
    favicon.resize((192, 192), Image.Resampling.LANCZOS).save(OUT / "mantra-ai-favicon-192.png")
    favicon.resize((32, 32), Image.Resampling.LANCZOS).save(OUT / "mantra-ai-favicon-32.png")

    PUBLIC.mkdir(parents=True, exist_ok=True)
    primary.resize((400, int(400 * primary.height / primary.width)), Image.Resampling.LANCZOS).save(
        PUBLIC / "mantra-ai-logo.png"
    )
    favicon.save(PUBLIC / "favicon.png")
    favicon.resize((180, 180), Image.Resampling.LANCZOS).save(PUBLIC / "apple-touch-icon.png")

    print(f"Extracted from: {src}")
    print(f"Brand assets: {OUT}")
    print(f"Web public:   {PUBLIC}")


if __name__ == "__main__":
    main()
