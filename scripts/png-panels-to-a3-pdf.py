#!/usr/bin/env python3
import json
import sys
from pathlib import Path

from pypdf import PdfReader
from reportlab.lib.pagesizes import A3, landscape
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen import canvas


def main() -> None:
    if len(sys.argv) != 4:
        raise SystemExit("usage: png-panels-to-a3-pdf.py LEFT.png RIGHT.png OUTPUT.pdf")

    left_path = Path(sys.argv[1]).resolve()
    right_path = Path(sys.argv[2]).resolve()
    output_path = Path(sys.argv[3]).resolve()
    page_size = landscape(A3)

    output_path.parent.mkdir(parents=True, exist_ok=True)
    document = canvas.Canvas(str(output_path), pagesize=page_size, pageCompression=1)
    for image_path in (left_path, right_path):
        image = ImageReader(str(image_path))
        image_width, image_height = image.getSize()
        scale = max(page_size[0] / image_width, page_size[1] / image_height)
        draw_width = image_width * scale
        draw_height = image_height * scale
        document.drawImage(
            image,
            (page_size[0] - draw_width) / 2,
            (page_size[1] - draw_height) / 2,
            width=draw_width,
            height=draw_height,
            preserveAspectRatio=True,
            mask=None,
        )
        document.showPage()
    document.save()

    reader = PdfReader(str(output_path))
    if len(reader.pages) != 2:
        raise RuntimeError("PDF must have exactly two pages")

    expected_width, expected_height = page_size
    pages = []
    for index, page in enumerate(reader.pages, start=1):
        width = float(page.mediabox.width)
        height = float(page.mediabox.height)
        if abs(width - expected_width) > 0.1 or abs(height - expected_height) > 0.1:
            raise RuntimeError(f"page {index} has an unexpected page size")
        resources = page.get("/Resources")
        fonts = resources.get_object().get("/Font", {}) if resources else {}
        if hasattr(fonts, "get_object"):
            fonts = fonts.get_object()
        content = page.get_contents().get_data()
        if b" Tj" in content or b" TJ" in content:
            raise RuntimeError(f"page {index} unexpectedly contains text drawing operators")
        pages.append(
            {
                "page": index,
                "widthPt": width,
                "heightPt": height,
                "fontResources": len(fonts),
                "textDrawingOperators": False,
            }
        )

    print(json.dumps({"pages": pages, "fontMode": "rasterized"}, ensure_ascii=False))


if __name__ == "__main__":
    main()
