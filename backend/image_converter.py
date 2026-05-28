"""
image_converter.py
Handles all image format conversions:
  Raster ↔ Raster : JPG, PNG, WEBP, GIF, BMP, TIFF, ICO
  Raster  → SVG   : true vectorization via vtracer (fallback: base64 embed)
  SVG     → Raster: via cairosvg
"""

import io
import os
import base64
from pathlib import Path
from PIL import Image

# Supported raster formats and their Pillow save kwargs
RASTER_FORMATS = {
    "jpg":  {"format": "JPEG",  "save_kwargs": {"quality": 95, "optimize": True}},
    "jpeg": {"format": "JPEG",  "save_kwargs": {"quality": 95, "optimize": True}},
    "png":  {"format": "PNG",   "save_kwargs": {"optimize": True}},
    "webp": {"format": "WEBP",  "save_kwargs": {"quality": 90, "method": 6}},
    "gif":  {"format": "GIF",   "save_kwargs": {}},
    "bmp":  {"format": "BMP",   "save_kwargs": {}},
    "tiff": {"format": "TIFF",  "save_kwargs": {}},
    "tif":  {"format": "TIFF",  "save_kwargs": {}},
    "ico":  {"format": "ICO",   "save_kwargs": {"sizes": [(256, 256), (128, 128), (64, 64), (32, 32), (16, 16)]}},
}

ALL_SUPPORTED = list(RASTER_FORMATS.keys()) + ["svg"]


def _normalize_ext(ext: str) -> str:
    return ext.lower().lstrip(".")


def convert_image(input_path: str, output_path: str, target_fmt: str) -> str:
    """
    Convert image at input_path to target_fmt and save to output_path.
    Returns output_path on success.
    """
    target_fmt = _normalize_ext(target_fmt)
    src_ext    = _normalize_ext(Path(input_path).suffix)

    if target_fmt not in ALL_SUPPORTED:
        raise ValueError(f"Unsupported target format: {target_fmt}. "
                         f"Choose from: {', '.join(ALL_SUPPORTED)}")

    # SVG → raster
    if src_ext == "svg":
        return _svg_to_raster(input_path, output_path, target_fmt)

    # raster → SVG
    if target_fmt == "svg":
        return _raster_to_svg(input_path, output_path)

    # raster → raster
    return _raster_to_raster(input_path, output_path, target_fmt)


# ---------------------------------------------------------------------------
# SVG → raster
# ---------------------------------------------------------------------------

def _svg_to_raster(input_path: str, output_path: str, target_fmt: str) -> str:
    import cairosvg

    fmt = RASTER_FORMATS[target_fmt]["format"].lower()
    if fmt == "jpeg":
        fmt = "png"          # cairosvg outputs PNG; we'll convert with Pillow after
        tmp_png = output_path + ".tmp.png"
        cairosvg.svg2png(url=input_path, write_to=tmp_png, dpi=150)
        img = Image.open(tmp_png).convert("RGB")
        kw  = RASTER_FORMATS[target_fmt]["save_kwargs"]
        img.save(output_path, format="JPEG", **kw)
        os.remove(tmp_png)
    elif target_fmt in ("png", "webp", "bmp", "tiff", "tif", "gif", "ico"):
        tmp_png = output_path + ".tmp.png"
        cairosvg.svg2png(url=input_path, write_to=tmp_png, dpi=150)
        img = Image.open(tmp_png)
        kw  = RASTER_FORMATS[target_fmt]["save_kwargs"]
        img.save(output_path, format=RASTER_FORMATS[target_fmt]["format"], **kw)
        os.remove(tmp_png)
    else:
        cairosvg.svg2png(url=input_path, write_to=output_path, dpi=150)

    return output_path


# ---------------------------------------------------------------------------
# raster → SVG  (vectorization)
# ---------------------------------------------------------------------------

def _raster_to_svg(input_path: str, output_path: str) -> str:
    """
    Attempt true vectorization with vtracer.
    Falls back to base64-embedded SVG if vtracer is unavailable.
    """
    try:
        import vtracer

        # vtracer works best on PNG; convert first
        img = Image.open(input_path)
        tmp_png = input_path + ".tmp_for_svg.png"
        img.save(tmp_png, format="PNG")

        vtracer.convert_image_to_svg_py(
            tmp_png,
            output_path,
            colormode="color",          # "color" | "binary"
            hierarchical="stacked",
            mode="spline",
            filter_speckle=4,
            color_precision=6,
            layer_difference=16,
            corner_threshold=60,
            length_threshold=4.0,
            max_iterations=10,
            splice_threshold=45,
            path_precision=8,
        )
        os.remove(tmp_png)
        print(f"SVG vectorized with vtracer: {output_path}")

    except Exception as e:
        print(f"vtracer failed ({e}), using base64 embed fallback")
        _embed_raster_in_svg(input_path, output_path)

    return output_path


def _embed_raster_in_svg(input_path: str, output_path: str):
    """Embed the raster image inside an SVG wrapper (lossless, not vectorized)."""
    img = Image.open(input_path)
    w, h = img.size

    buf = io.BytesIO()
    img.save(buf, format="PNG")
    b64 = base64.b64encode(buf.getvalue()).decode("ascii")

    svg = (
        f'<?xml version="1.0" encoding="UTF-8"?>\n'
        f'<svg xmlns="http://www.w3.org/2000/svg" '
        f'xmlns:xlink="http://www.w3.org/1999/xlink" '
        f'width="{w}" height="{h}" viewBox="0 0 {w} {h}">\n'
        f'  <image width="{w}" height="{h}" '
        f'xlink:href="data:image/png;base64,{b64}"/>\n'
        f'</svg>\n'
    )
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(svg)


# ---------------------------------------------------------------------------
# raster → raster
# ---------------------------------------------------------------------------

def _raster_to_raster(input_path: str, output_path: str, target_fmt: str) -> str:
    img = Image.open(input_path)
    fmt_info = RASTER_FORMATS[target_fmt]
    pil_fmt  = fmt_info["format"]
    kw       = fmt_info["save_kwargs"].copy()

    # JPEG requires RGB (no alpha channel)
    if pil_fmt == "JPEG" and img.mode in ("RGBA", "P", "LA"):
        background = Image.new("RGB", img.size, (255, 255, 255))
        if img.mode == "P":
            img = img.convert("RGBA")
        background.paste(img, mask=img.split()[-1] if img.mode in ("RGBA", "LA") else None)
        img = background

    # GIF / ICO / BMP may need palette conversion
    if pil_fmt == "GIF" and img.mode not in ("P", "L"):
        img = img.convert("P", palette=Image.ADAPTIVE, colors=256)

    if pil_fmt == "ICO":
        # ICO needs RGBA
        if img.mode != "RGBA":
            img = img.convert("RGBA")

    img.save(output_path, format=pil_fmt, **kw)
    return output_path


# ---------------------------------------------------------------------------
# Utility
# ---------------------------------------------------------------------------

def supported_conversions() -> dict:
    """Return a dict describing what can convert to what."""
    return {
        "raster_formats": list(RASTER_FORMATS.keys()),
        "svg_input":  True,
        "svg_output": True,
        "note": "Any raster format can convert to any other raster format or SVG. SVG can convert to any raster format.",
    }
