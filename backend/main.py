"""
main.py  –  Universal File Converter API
Endpoints:
  GET  /                    API info
  POST /pdf-to-md           PDF → Markdown
  POST /md-to-pdf           Markdown → PDF
  POST /image/convert       Image → any format (jpg/png/webp/gif/bmp/tiff/ico/svg)
  POST /image/formats       List all supported image formats
  POST /excel-to-csv        Excel (.xlsx/.xls) → CSV (or ZIP for multi-sheet)
  POST /csv-to-excel        CSV → styled Excel (.xlsx)
  POST /pdf-to-excel        PDF (table extraction) → Excel (.xlsx)

All endpoints accept an optional ?filename=<name> query param to set
the downloaded file's name.
"""

import os
import re
import uuid
import shutil
from pathlib import Path

from fastapi import FastAPI, UploadFile, File, Query, HTTPException
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from pdf_to_md          import pdf_to_markdown
from md_to_pdf          import md_to_pdf
from image_converter    import convert_image, ALL_SUPPORTED, supported_conversions
from spreadsheet_converter import excel_to_csv, csv_to_excel
from data_converter     import json_to_csv, csv_to_json

# ---------------------------------------------------------------------------
# App
# ---------------------------------------------------------------------------

App = FastAPI(
    title="Universal File Converter API 🚀",
    description=(
        "Convert between PDF, Markdown, Images (JPG/PNG/WEBP/GIF/BMP/TIFF/ICO/SVG), "
        "Excel, CSV and more."
    ),
    version="3.0.0",
)

# Enable CORS for the frontend origin
origins = [
    "https://document-converter-pi.vercel.app",
    "http://localhost:5173",
    "http://localhost:3000",
]

App.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "temp"
os.makedirs(UPLOAD_DIR, exist_ok=True)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _tmp(ext: str) -> str:
    """Return a unique temp file path."""
    return os.path.join(UPLOAD_DIR, f"{uuid.uuid4()}{ext}")


def _safe_filename(name: str, default: str, ext: str) -> str:
    """Sanitise a user-supplied filename and enforce correct extension."""
    if not name:
        return f"{default}{ext}"
    name = os.path.basename(name)
    name = re.sub(r'[<>:"/\\|?*\x00-\x1f]', "_", name)
    base, _ = os.path.splitext(name)
    base = base.strip("._") or default
    return f"{base}{ext}"


def _save_upload(upload: UploadFile, ext: str) -> str:
    path = _tmp(ext)
    with open(path, "wb") as f:
        shutil.copyfileobj(upload.file, f)
    return path


def _download(path: str, media_type: str, filename: str):
    return FileResponse(
        path,
        media_type=media_type,
        filename=filename,
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


# ---------------------------------------------------------------------------
# Root
# ---------------------------------------------------------------------------

@App.get("/", summary="API overview")
def root():
    return {
        "name":    "Universal File Converter API",
        "version": "3.0.0",
        "endpoints": {
            "POST /pdf-to-md":      "PDF → Markdown",
            "POST /md-to-pdf":      "Markdown → styled PDF",
            "POST /image/convert":  "Image → any format  (?to=png|jpg|svg|webp|gif|bmp|tiff|ico)",
            "GET  /image/formats":  "List all supported image formats",
            "POST /excel-to-csv":   "Excel → CSV (ZIP for multi-sheet workbooks)",
            "POST /csv-to-excel":   "CSV → styled Excel",
            "POST /data-convert":   "Convert between JSON and CSV",
        },
        "tip": "Add ?filename=your_name to any POST endpoint to name the downloaded file.",
    }


# ---------------------------------------------------------------------------
# PDF ↔ Markdown
# ---------------------------------------------------------------------------

@App.post("/pdf-to-md", summary="Convert PDF to structured Markdown")
async def route_pdf_to_md(
    file: UploadFile = File(...),
    filename: str = Query(default="", description="Custom download filename (no extension)"),
):
    pdf_path = _save_upload(file, ".pdf")
    md_path  = _tmp(".md")

    md_text = pdf_to_markdown(pdf_path)
    with open(md_path, "w", encoding="utf-8") as f:
        f.write(md_text)

    return _download(md_path, "text/markdown", _safe_filename(filename, "converted", ".md"))


@App.post("/md-to-pdf", summary="Convert Markdown to styled PDF")
async def route_md_to_pdf(
    file: UploadFile = File(...),
    filename: str = Query(default="", description="Custom download filename (no extension)"),
):
    md_path  = _save_upload(file, ".md")
    pdf_path = _tmp(".pdf")
    md_to_pdf(md_path, pdf_path)
    return _download(pdf_path, "application/pdf", _safe_filename(filename, "converted", ".pdf"))


# ---------------------------------------------------------------------------
# Image conversion
# ---------------------------------------------------------------------------

@App.get("/image/formats", summary="List all supported image formats")
def route_image_formats():
    return supported_conversions()


@App.post("/image/convert", summary="Convert image to any supported format")
async def route_image_convert(
    file: UploadFile = File(..., description="Source image file"),
    to: str = Query(
        ...,
        description=f"Target format. One of: {', '.join(ALL_SUPPORTED)}",
        examples=["png"],
    ),
    filename: str = Query(default="", description="Custom download filename (no extension)"),
):
    target_fmt = to.lower().lstrip(".")

    if target_fmt not in ALL_SUPPORTED:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported target format '{target_fmt}'. Supported: {', '.join(ALL_SUPPORTED)}",
        )

    src_ext  = Path(file.filename or "image.bin").suffix or ".bin"
    src_path = _save_upload(file, src_ext)
    out_ext  = ".jpg" if target_fmt in ("jpg", "jpeg") else f".{target_fmt}"
    out_path = _tmp(out_ext)

    try:
        convert_image(src_path, out_path, target_fmt)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    media_types = {
        "jpg": "image/jpeg", "jpeg": "image/jpeg",
        "png": "image/png", "webp": "image/webp",
        "gif": "image/gif", "bmp":  "image/bmp",
        "tiff": "image/tiff", "tif": "image/tiff",
        "ico": "image/x-icon", "svg": "image/svg+xml",
    }
    media = media_types.get(target_fmt, "application/octet-stream")

    dl_name = _safe_filename(filename, "converted", out_ext)
    return _download(out_path, media, dl_name)


# ---------------------------------------------------------------------------
# Excel ↔ CSV
# ---------------------------------------------------------------------------

@App.post("/excel-to-csv", summary="Convert Excel to CSV")
async def route_excel_to_csv(
    file: UploadFile = File(..., description="Excel file (.xlsx or .xls)"),
    filename: str = Query(default="", description="Custom download filename (no extension)"),
):
    src_ext  = Path(file.filename or "data.xlsx").suffix or ".xlsx"
    src_path = _save_upload(file, src_ext)
    out_path = _tmp(".csv")

    try:
        result_path, is_zip = excel_to_csv(src_path, out_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    if is_zip:
        dl_name   = _safe_filename(filename, "converted_sheets", ".zip")
        media     = "application/zip"
    else:
        dl_name   = _safe_filename(filename, "converted", ".csv")
        media     = "text/csv"

    return _download(result_path, media, dl_name)


@App.post("/csv-to-excel", summary="Convert CSV to styled Excel")
async def route_csv_to_excel(
    file: UploadFile = File(..., description="CSV file"),
    filename: str = Query(default="", description="Custom download filename (no extension)"),
):
    src_path = _save_upload(file, ".csv")
    out_path = _tmp(".xlsx")

    try:
        csv_to_excel(src_path, out_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    dl_name = _safe_filename(filename, "converted", ".xlsx")
    return _download(
        out_path,
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        dl_name,
    )


# ---------------------------------------------------------------------------
# JSON ↔ CSV Translator
# ---------------------------------------------------------------------------

@App.post("/data-convert", summary="Convert between JSON and CSV formats")
async def route_data_convert(
    file: UploadFile = File(..., description="JSON or CSV file to translate"),
    filename: str = Query(default="", description="Custom download filename (no extension)"),
):
    upload_name = file.filename or ""
    ext = Path(upload_name).suffix.lower()

    if ext == ".json":
        try:
            content = await file.read()
            out_path = _tmp(".csv")
            json_to_csv(content, out_path)
            
            dl_name = _safe_filename(filename, "converted", ".csv")
            return _download(out_path, "text/csv", dl_name)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to convert JSON to CSV: {str(e)}")
            
    elif ext == ".csv":
        try:
            content = await file.read()
            out_path = _tmp(".json")
            csv_to_json(content, out_path)
            
            dl_name = _safe_filename(filename, "converted", ".json")
            return _download(out_path, "application/json", dl_name)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to convert CSV to JSON: {str(e)}")
            
    else:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format '{ext}'. Please upload a valid .json or .csv file."
        )

# Alias App to app so both command syntax conventions (main:app and main:App) function correctly
app = App
