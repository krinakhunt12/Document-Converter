import json
import pandas as pd
import io

def json_to_csv(json_bytes: bytes, out_path: str):
    """Convert JSON bytes array to a flat CSV spreadsheet, auto-flattening nested structures."""
    data = json.loads(json_bytes.decode("utf-8"))
    if isinstance(data, dict):
        data = [data]
    
    # Automatically normalize/flatten any nested objects (e.g. key: {subkey: val})
    df = pd.json_normalize(data)
    df.to_csv(out_path, index=False, encoding="utf-8")

def csv_to_json(csv_bytes: bytes, out_path: str):
    """Convert CSV bytes to a structured, beautifully formatted JSON list of records."""
    df = pd.read_csv(io.BytesIO(csv_bytes), encoding="utf-8")
    # Export to a structured array of JSON records with pretty indent=2
    df.to_json(out_path, orient="records", indent=2, force_ascii=False)
