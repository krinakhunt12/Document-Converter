# Universal File Converter API

## Run
```bash
pip install -r requirements.txt
uvicorn main:app --reload
```

## Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/pdf-to-md` | PDF → Markdown |
| POST | `/md-to-pdf` | Markdown → Styled PDF |
| POST | `/image/convert?to=FORMAT` | Image → any format |
| GET  | `/image/formats` | List all image formats |
| POST | `/excel-to-csv` | Excel → CSV (ZIP for multi-sheet) |
| POST | `/csv-to-excel` | CSV → Styled Excel |
| POST | `/pdf-to-excel` | PDF table extraction → Excel |

## Custom filename
Add `?filename=your_name` to any POST endpoint to name the downloaded file.

## Image formats supported
jpg, jpeg, png, webp, gif, bmp, tiff, tif, ico, svg

## SVG conversion
- Raster → SVG: Uses `vtracer` for true vectorization
- SVG → Raster: Uses `cairosvg` for high-quality rendering
