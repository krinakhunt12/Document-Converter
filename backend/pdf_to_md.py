import fitz  # PyMuPDF
import re
from collections import Counter


# ---------------------------------------------------------------------------
# Font analysis helpers
# ---------------------------------------------------------------------------

def get_font_stats(doc):
    """
    Analyse font sizes across the whole document.
    Returns (heading_map, body_size).
    """
    font_sizes = []
    for page in doc:
        for block in page.get_text("dict")["blocks"]:
            if block.get("type") != 0:
                continue
            for line in block.get("lines", []):
                for span in line.get("spans", []):
                    font_sizes.append(round(span["size"]))

    if not font_sizes:
        return {}, 12

    counter = Counter(font_sizes)
    body_size = counter.most_common(1)[0][0]
    heading_sizes = sorted(
        {s for s in font_sizes if s > body_size + 1}, reverse=True
    )[:3]
    heading_map = {size: level + 1 for level, size in enumerate(heading_sizes)}
    return heading_map, body_size


# ---------------------------------------------------------------------------
# Inline formatting
# ---------------------------------------------------------------------------

def spans_to_md(spans):
    """Convert span list to Markdown with bold/italic preserved."""
    parts = []
    for span in spans:
        text = span.get("text", "")
        if not text.strip():
            parts.append(text)
            continue
        flags = span.get("flags", 0)
        bold   = bool(flags & (1 << 4)) or "Bold"   in span.get("font", "")
        italic = bool(flags & (1 << 1)) or "Italic" in span.get("font", "") \
                                        or "Oblique" in span.get("font", "")
        if bold and italic:
            text = f"***{text.strip()}***"
        elif bold:
            text = f"**{text.strip()}**"
        elif italic:
            text = f"*{text.strip()}*"
        parts.append(text)
    return "".join(parts).strip()


# ---------------------------------------------------------------------------
# Table helpers
# ---------------------------------------------------------------------------

def detect_table(text_lines, start):
    table = []
    for i in range(start, min(start + 12, len(text_lines))):
        raw = text_lines[i].strip()
        if not raw:
            if table:
                break
            continue
        cols = re.split(r"\s{2,}", raw)
        if len(cols) >= 2:
            table.append(cols)
        else:
            if table:
                break
    return table if len(table) >= 2 else []


def table_to_md(table):
    if not table:
        return ""
    col_count = max(len(r) for r in table)
    rows = [r + [""] * (col_count - len(r)) for r in table]
    header    = "| " + " | ".join(rows[0]) + " |"
    separator = "| " + " | ".join(["---"] * col_count) + " |"
    body = "\n".join("| " + " | ".join(r) + " |" for r in rows[1:])
    return "\n".join([header, separator, body])


# ---------------------------------------------------------------------------
# Code-block detection
# ---------------------------------------------------------------------------

_CODE_KEYWORDS = (
    "def ", "class ", "function ", "return ", "const ", "let ", "var ",
    "import ", "#include", "print(", "console.log", "=>", "->", "elif ",
)


def is_code_like(text):
    if any(kw in text for kw in _CODE_KEYWORDS):
        return True
    if re.match(r"^\s{4,}\S", text):
        return True
    punct = sum(1 for c in text if c in "{}[]();=<>|&^%$#@!")
    if len(text) > 0 and punct / len(text) > 0.15:
        return True
    return False


# ---------------------------------------------------------------------------
# Post-processing: split inline bold labels into bullet points
# ---------------------------------------------------------------------------

def split_inline_labels(text):
    """
    Convert a paragraph that has multiple **Label:** sections into
    a proper bullet-point list.

    Handles both:
      **Technical Skills:** value  (colon inside bold)
      **Technical Skills**: value  (colon outside bold)
    """
    # Matches **Label:** or **Label**: or **Label **:
    label_pattern = re.compile(r"(\*\*[^*]+:?\*\*\s*:?\s*)")

    parts = label_pattern.split(text)

    labels = []
    i = 0
    while i < len(parts):
        chunk = parts[i].strip()
        if label_pattern.match(parts[i]) and (parts[i].rstrip().endswith("**") or ":**" in parts[i] or "**: " in parts[i]):
            label   = parts[i].strip()
            content = parts[i + 1].strip() if i + 1 < len(parts) else ""
            labels.append(f"- {label} {content}")
            i += 2
        else:
            if chunk:
                labels.append(chunk)
            i += 1

    if len(labels) > 1:
        return "\n".join(labels)
    return text


def split_inline_projects(text):
    """
    Convert a paragraph containing multiple **ProjectName:** descriptions
    into separate bullet points.
    """
    # Matches **Name:** or **Name (detail):** (colon inside or outside)
    proj_pattern = re.compile(r"(\*\*[^*]+:?\*\*\s*:?\s*)")

    parts = proj_pattern.split(text)

    items = []
    i = 0
    while i < len(parts):
        raw = parts[i]
        if proj_pattern.match(raw) and (":**" in raw or "**: " in raw or raw.rstrip().endswith("**")):
            label   = raw.strip()
            content = parts[i + 1].strip() if i + 1 < len(parts) else ""
            items.append(f"- {label} {content}")
            i += 2
        else:
            chunk = raw.strip()
            if chunk:
                items.append(chunk)
            i += 1

    if len(items) > 1:
        return "\n".join(items)
    return text


def post_process(md_text):
    """
    Walk through every paragraph and apply smart splitting where needed.
    """
    # Unified bold-label pattern (colon inside OR outside the **)
    BOLD_LABEL = re.compile(r"\*\*[^*]+:?\*\*\s*:?")

    blocks = md_text.split("\n\n")
    result = []

    for block in blocks:
        stripped = block.strip()

        # Skip headings, code fences, tables, already-list paragraphs
        if (stripped.startswith("#")
                or stripped.startswith("```")
                or stripped.startswith("|")
                or stripped.startswith("-")
                or stripped.startswith("*  ")):
            result.append(block)
            continue

        bold_labels = BOLD_LABEL.findall(stripped)
        # Only split if there are 2+ distinct bold labels in the paragraph
        if len(bold_labels) >= 2:
            lower = stripped.lower()
            if any(kw in lower for kw in
                   ["skills", "language", "certif", "soft", "technical"]):
                result.append(split_inline_labels(stripped))
            else:
                result.append(split_inline_projects(stripped))
            continue

        result.append(block)

    return "\n\n".join(result)


# ---------------------------------------------------------------------------
# Main conversion
# ---------------------------------------------------------------------------

def pdf_to_markdown(pdf_path):
    doc = fitz.open(pdf_path)
    heading_map, body_size = get_font_stats(doc)

    md_output = []

    for page in doc:
        blocks     = page.get_text("dict")["blocks"]
        plain_lines = []
        block_meta  = []

        for block in blocks:
            if block.get("type") != 0:
                continue
            b_lines = block.get("lines", [])
            if not b_lines:
                continue

            plain_parts, spans_md_parts = [], []
            max_size = 0
            total_chars = bold_chars = 0

            for line in b_lines:
                spans = line.get("spans", [])
                if not spans:
                    continue
                line_size = max(round(s["size"]) for s in spans)
                max_size  = max(max_size, line_size)

                for s in spans:
                    tc = len(s["text"])
                    total_chars += tc
                    if s.get("flags", 0) & (1 << 4) or "Bold" in s.get("font", ""):
                        bold_chars += tc

                plain_parts.append("".join(s["text"] for s in spans).strip())
                spans_md_parts.append(spans_to_md(spans))

            plain_text = " ".join(p for p in plain_parts if p)
            spans_md   = " ".join(p for p in spans_md_parts if p)
            is_bold    = total_chars > 0 and bold_chars / total_chars > 0.5

            plain_lines.append(plain_text)
            block_meta.append((plain_text, spans_md, max_size, is_bold))

        i = 0
        while i < len(block_meta):
            plain_text, spans_md, max_size, is_bold = block_meta[i]

            if not plain_text:
                i += 1
                continue

            # --- TABLE ---
            table = detect_table(plain_lines, i)
            if table:
                md_output.append(table_to_md(table))
                i += len(table)
                continue

            # --- HEADING ---
            heading_level = heading_map.get(max_size, 0)
            if not heading_level and is_bold and max_size > body_size:
                heading_level = 3

            if heading_level:
                clean = spans_md.strip().lstrip("*").rstrip("*").strip()
                md_output.append(f"{'#' * heading_level} {clean}")
                i += 1
                continue

            # --- CODE BLOCK ---
            if is_code_like(plain_text):
                code_lines = [plain_text]
                i += 1
                while i < len(block_meta) and is_code_like(block_meta[i][0]):
                    code_lines.append(block_meta[i][0])
                    i += 1
                md_output.append("```\n" + "\n".join(code_lines) + "\n```")
                continue

            # --- NORMAL PARAGRAPH ---
            md_output.append(spans_md)
            i += 1

    raw_md = "\n\n".join(md_output)
    return post_process(raw_md)


# ---------------------------------------------------------------------------
# CLI entry-point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    import sys

    input_pdf = sys.argv[1] if len(sys.argv) > 1 else "input.pdf"
    output_md = sys.argv[2] if len(sys.argv) > 2 else "output.md"

    md_text = pdf_to_markdown(input_pdf)

    with open(output_md, "w", encoding="utf-8") as f:
        f.write(md_text)

    print(f"Converted to Markdown: {output_md}")
