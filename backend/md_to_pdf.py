import re
import html
import os

from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Preformatted, Spacer,
    HRFlowable, ListFlowable, ListItem, Table, TableStyle,
)
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT, TA_JUSTIFY
from markdown import markdown


# ---------------------------------------------------------------------------
# WeasyPrint CSS
# ---------------------------------------------------------------------------

WEASYPRINT_CSS = """
body {
    font-family: 'Segoe UI', Arial, sans-serif;
    font-size: 11pt;
    line-height: 1.7;
    color: #1a1a2e;
    max-width: 820px;
    margin: 0 auto;
    padding: 40px 50px;
}
h1 {
    font-size: 26pt;
    color: #1a1a2e;
    border-bottom: 3px solid #f97316;
    padding-bottom: 8px;
    margin-top: 36px;
    margin-bottom: 16px;
}
h2 {
    font-size: 19pt;
    color: #c2410c;
    border-bottom: 1px solid #ffedd5;
    padding-bottom: 4px;
    margin-top: 28px;
    margin-bottom: 12px;
}
h3 {
    font-size: 15pt;
    color: #ea580c;
    margin-top: 22px;
    margin-bottom: 8px;
}
h4, h5, h6 {
    font-size: 13pt;
    color: #f97316;
    margin-top: 18px;
    margin-bottom: 6px;
}
p { margin: 0 0 12px 0; }
code {
    background: #f1f5f9;
    border: 1px solid #e2e8f0;
    border-radius: 4px;
    padding: 2px 6px;
    font-family: 'Courier New', monospace;
    font-size: 10pt;
    color: #e11d48;
}
pre {
    background: #1e293b;
    color: #e2e8f0;
    border-radius: 8px;
    padding: 18px 20px;
    margin: 16px 0;
    line-height: 1.5;
}
pre code {
    background: none;
    border: none;
    padding: 0;
    color: #e2e8f0;
    font-size: 10pt;
}
blockquote {
    border-left: 4px solid #f97316;
    margin: 16px 0;
    padding: 8px 16px;
    background: #fff7ed;
    color: #c2410c;
    border-radius: 0 6px 6px 0;
}
table {
    border-collapse: collapse;
    width: 100%;
    margin: 16px 0;
    font-size: 10pt;
}
th {
    background: #f97316;
    color: white;
    font-weight: 600;
    padding: 10px 14px;
    text-align: left;
}
td {
    border: 1px solid #e2e8f0;
    padding: 8px 14px;
}
tr:nth-child(even) td { background: #f8fafc; }
ul, ol { margin: 8px 0 12px 0; padding-left: 24px; }
li { margin: 4px 0; }
strong { font-weight: 700; color: #1e1b4b; }
em { font-style: italic; color: #ea580c; }
hr { border: none; border-top: 2px solid #ffedd5; margin: 24px 0; }
a { color: #f97316; text-decoration: none; }
"""


# ---------------------------------------------------------------------------
# ReportLab style definitions
# ---------------------------------------------------------------------------

def build_styles():
    s = {}

    s["Normal"] = ParagraphStyle(
        "Normal",
        fontName="Helvetica", fontSize=11, leading=17,
        spaceAfter=8, textColor=colors.HexColor("#1a1a2e"),
        alignment=TA_JUSTIFY,
    )
    for level, (pt, clr) in enumerate(
        [(22, "#1a1a2e"), (17, "#c2410c"), (14, "#ea580c"), (12, "#f97316")],
        start=1,
    ):
        s[f"H{level}"] = ParagraphStyle(
            f"H{level}",
            fontName="Helvetica-Bold", fontSize=pt,
            leading=int(pt * 1.3), spaceBefore=14, spaceAfter=6,
            textColor=colors.HexColor(clr),
        )

    s["Code"] = ParagraphStyle(
        "Code",
        fontName="Courier", fontSize=9, leading=13,
        spaceBefore=8, spaceAfter=8,
        backColor=colors.HexColor("#1e293b"),
        textColor=colors.HexColor("#e2e8f0"),
        borderPadding=10, leftIndent=10, rightIndent=10,
    )
    s["Blockquote"] = ParagraphStyle(
        "Blockquote",
        fontName="Helvetica-Oblique", fontSize=11, leading=16,
        leftIndent=20, spaceBefore=8, spaceAfter=8,
        textColor=colors.HexColor("#c2410c"),
        backColor=colors.HexColor("#fff7ed"),
        borderPadding=8,
    )
    s["BulletItem"] = ParagraphStyle(
        "BulletItem",
        fontName="Helvetica", fontSize=11, leading=16,
        leftIndent=16, spaceAfter=3,
        textColor=colors.HexColor("#1a1a2e"),
    )
    return s


def safe_paragraph(text, style):
    """Create a ReportLab Paragraph safely; on parse error return escaped text.

    This prevents malformed inline XML from crashing the whole document build.
    """
    try:
        return Paragraph(text, style)
    except Exception as e:
        # Log the problematic input and return an escaped fallback paragraph
        print(f"ReportLab paragraph parse error; using escaped fallback: {e}\ntext={text!r}")
        return Paragraph(html.escape(text), style)


# ---------------------------------------------------------------------------
# Inline Markdown -> ReportLab XML
# ---------------------------------------------------------------------------

def inline_md_to_rl(text):
    """Convert inline markdown (bold, italic, code, links) to ReportLab XML."""
    # Escape HTML first, then restore/add tags
    text = html.escape(text, quote=False)
    # Protect code spans and links first to avoid interfering with emphasis tags
    text = re.sub(
        r"`(.+?)`",
        r'<font name="Courier" color="#e11d48">\1</font>',
        text,
    )
    # links -> underlined label
    text = re.sub(r"\[(.+?)\]\(.+?\)", r"<u><font color=\"#f97316\">\1</font></u>", text)

    # Then emphasis/bold (process longest sequences first)
    text = re.sub(r"\*\*\*(.+?)\*\*\*", r"<b><i>\1</i></b>", text)
    text = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", text)
    text = re.sub(r"__(.+?)__", r"<b>\1</b>", text)
    text = re.sub(r"\*(.+?)\*", r"<i>\1</i>", text)
    text = re.sub(r"_(.+?)_", r"<i>\1</i>", text)
    return text


# ---------------------------------------------------------------------------
# Main conversion
# ---------------------------------------------------------------------------

def md_to_pdf(md_file, output_pdf):
    with open(md_file, "r", encoding="utf-8") as f:
        md_text = f.read()

    # ---- WeasyPrint (preferred) ----
    try:
        from weasyprint import HTML, CSS

        html_body = markdown(
            md_text,
            output_format="html5",
            extensions=["tables", "fenced_code", "nl2br"],
        )

        full_html = f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>{WEASYPRINT_CSS}</style>
</head>
<body>{html_body}</body>
</html>"""

        css_path = os.path.join(os.path.dirname(__file__), "templates", "style.css")
        if os.path.exists(css_path):
            HTML(string=full_html).write_pdf(
                output_pdf, stylesheets=[CSS(filename=css_path)]
            )
        else:
            HTML(string=full_html).write_pdf(output_pdf)

        print(f"PDF generated with WeasyPrint: {output_pdf}")
        return
    except Exception as e:
        print(f"WeasyPrint unavailable ({e}), using ReportLab fallback")

    # ---- ReportLab fallback ----
    styles = build_styles()
    doc = SimpleDocTemplate(
        output_pdf,
        pagesize=letter,
        leftMargin=inch,
        rightMargin=inch,
        topMargin=inch,
        bottomMargin=inch,
    )
    elements = []

    lines = md_text.split("\n")
    i = 0

    while i < len(lines):
        line = lines[i]

        # Fenced code block
        if line.strip().startswith("```"):
            code_lines = []
            i += 1
            while i < len(lines) and not lines[i].strip().startswith("```"):
                code_lines.append(lines[i])
                i += 1
            elements.append(
                Preformatted("\n".join(code_lines), styles["Code"])
            )
            elements.append(Spacer(1, 8))
            i += 1
            continue

        # Headings
        h = re.match(r"^(#{1,6})\s+(.*)", line)
        if h:
            level = min(len(h.group(1)), 4)
            text = inline_md_to_rl(h.group(2).strip())
            elements.append(safe_paragraph(text, styles[f"H{level}"]))
            # Decorative rule under H1 / H2
            if level == 1:
                elements.append(
                    HRFlowable(width="100%", thickness=2,
                               color=colors.HexColor("#f97316"), spaceAfter=6)
                )
            elif level == 2:
                elements.append(
                    HRFlowable(width="100%", thickness=1,
                               color=colors.HexColor("#ffedd5"), spaceAfter=4)
                )
            i += 1
            continue

        # Horizontal rule
        if re.match(r"^[-*_]{3,}\s*$", line):
            elements.append(
                HRFlowable(width="100%", thickness=1,
                           color=colors.HexColor("#ffedd5"),
                           spaceBefore=8, spaceAfter=8)
            )
            i += 1
            continue

        # Blockquote
        if line.startswith(">"):
            bq_lines = []
            while i < len(lines) and lines[i].startswith(">"):
                bq_lines.append(lines[i][1:].strip())
                i += 1
            text = inline_md_to_rl(" ".join(bq_lines))
            elements.append(safe_paragraph(text, styles["Blockquote"]))
            continue

        # Unordered list
        if re.match(r"^[-*+]\s+", line):
            items = []
            while i < len(lines) and re.match(r"^[-*+]\s+", lines[i]):
                item_text = inline_md_to_rl(
                    re.sub(r"^[-*+]\s+", "", lines[i])
                )
                items.append(
                    ListItem(
                        safe_paragraph(item_text, styles["BulletItem"]),
                        bulletColor=colors.HexColor("#f97316"),
                    )
                )
                i += 1
            elements.append(
                ListFlowable(
                    items, bulletType="bullet", leftIndent=20,
                    bulletColor=colors.HexColor("#f97316"),
                )
            )
            elements.append(Spacer(1, 6))
            continue

        # Ordered list
        if re.match(r"^\d+\.\s+", line):
            items = []
            while i < len(lines) and re.match(r"^\d+\.\s+", lines[i]):
                item_text = inline_md_to_rl(
                    re.sub(r"^\d+\.\s+", "", lines[i])
                )
                items.append(ListItem(safe_paragraph(item_text, styles["BulletItem"])))
                i += 1
            elements.append(
                ListFlowable(items, bulletType="1", leftIndent=20)
            )
            elements.append(Spacer(1, 6))
            continue

        # Markdown table
        if "|" in line and i + 1 < len(lines) and re.match(r"^[\|\s\-:]+$", lines[i + 1]):
            table_lines = []
            while i < len(lines) and "|" in lines[i]:
                table_lines.append(lines[i])
                i += 1
            rows = []
            for tl in table_lines:
                if re.match(r"^[\|\s\-:]+$", tl):
                    continue  # separator row
                cols = [c.strip() for c in tl.strip().strip("|").split("|")]
                rows.append(cols)
            if rows:
                col_count = max(len(r) for r in rows)
                rows = [r + [""] * (col_count - len(r)) for r in rows]
                table_data = []
                for ri, row in enumerate(rows):
                    row_cells = []
                    for cell in row:
                        st = styles["H4"] if ri == 0 else styles["Normal"]
                        # table cells are escaped then wrapped safely
                        row_cells.append(safe_paragraph(html.escape(cell), st))
                    table_data.append(row_cells)
                t = Table(table_data, repeatRows=1, hAlign="LEFT")
                t.setStyle(TableStyle([
                    ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#f97316")),
                    ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                    ("ROWBACKGROUNDS", (0, 1), (-1, -1),
                     [colors.HexColor("#f8fafc"), colors.white]),
                    ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
                    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                    ("FONTSIZE", (0, 0), (-1, -1), 10),
                    ("TOPPADDING", (0, 0), (-1, -1), 6),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
                    ("LEFTPADDING", (0, 0), (-1, -1), 8),
                    ("RIGHTPADDING", (0, 0), (-1, -1), 8),
                    ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ]))
                elements.append(t)
                elements.append(Spacer(1, 10))
            continue

        # Empty line
        if not line.strip():
            elements.append(Spacer(1, 8))
            i += 1
            continue

        # Normal paragraph
        rl_text = inline_md_to_rl(line)
        try:
            elements.append(Paragraph(rl_text, styles["Normal"]))
        except Exception as e:
            # Fallback: log the problematic text and insert an escaped paragraph
            print(f"ReportLab paragraph parse error for line: {line!r} -> {e}")
            elements.append(Paragraph(html.escape(line), styles["Normal"]))
        i += 1

    doc.build(elements)
    print(f"PDF generated (ReportLab): {output_pdf}")
