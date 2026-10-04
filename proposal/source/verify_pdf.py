"""Verify the actual generated PDF and render all pages with bundled Poppler."""
import json
import os
from pathlib import Path
import re
import subprocess
import sys

from pypdf import PdfReader
from PIL import Image, ImageChops

sys.stdout.reconfigure(encoding="utf-8")
data = json.load(sys.stdin)
root = Path("proposal")
reader = PdfReader(root / "ube-farm-mvp-costing-proposal.pdf")
assert len(reader.pages) == data["pageCount"], "Unexpected PDF page count"
pages = [page.extract_text() for page in reader.pages]
for index, (page, text) in enumerate(zip(reader.pages, pages), 1):
    assert len(text) > 500, f"Unexpectedly empty page {index}"
    assert abs(float(page.mediabox.width) - 595.28) < 2
    assert abs(float(page.mediabox.height) - 841.89) < 2
    assert re.search(rf"{index}\s*/\s*{data['pageCount']}", text), f"Missing footer on page {index}"

combined = re.sub(r"\s+", " ", "\n".join(pages))
combined = re.sub(r"₱\s+(?=\d)", "₱", combined)
money = lambda value: f"₱{value:,}"
total = sum(item["amount"] for item in data["costItems"])
amounts = [total] + [item["amount"] for item in data["costItems"]]
amounts += [total * item["percent"] // 100 for item in data["payment"]]
amounts += [total + 12 * data["hostingBudget"][edge] + data["domainBudget"][edge] for edge in ("min", "max")]
for amount in amounts:
    assert money(amount) in combined, f"Missing searchable amount: {money(amount)}"
for phrase in [
    "Roote Origin System", "New backend included", "What the MVP includes",
    "Farm & produce inventory", "Farming & harvest records", "Public per-batch QR",
    "Brand owner / distributor", "Protected ecosystem data", "Approved public QR summary",
    "Costing is negotiable", "Additional features incur additional cost", "negotiations",
    "MERN stack", "MongoDB", "Express", "React", "Node.js 26", "TypeScript", "10 weeks", "30-day", "password recovery",
]:
    assert phrase.casefold() in combined.casefold(), f"Missing searchable scope clause: {phrase}"
for week in range(1, 11):
    assert f"Week {week}" in pages[4], f"Missing delivery week {week}"
for stale in [
    "3–4 weeks", "frontend-only/static-data", "No server application or database is required",
    "Why this pricing fits the work", "Market context & sources", "free static hosting", "PostgreSQL", "Supabase",
]:
    assert stale not in combined, f"Obsolete scope or sources appendix present: {stale}"
assert not re.search(r"[\u2010-\u2015\u2212]", combined), "Unexpected non-ASCII hyphen"
assert "\ufffd" not in combined, "Replacement glyph present"

layout = json.loads((root / "source/layout-report.json").read_text(encoding="utf-8"))
assert len(layout) == data["pageCount"]
assert all(item["fits"] and not item["horizontalOverflow"] for item in layout)
(root / "source/extracted-pdf-text.txt").write_text(
    "\n\n".join(f"PAGE {i + 1}\n{text}" for i, text in enumerate(pages)), encoding="utf-8"
)

poppler_dir = Path(os.environ["USERPROFILE"]) / ".cache/codex-runtimes/codex-primary-runtime/dependencies/native/poppler/Library/bin"
pdftoppm = os.environ.get("PROPOSAL_PDFTOPPM", str(poppler_dir / "pdftoppm.exe"))
# Render separately: this Poppler build can omit reused header/footer graphics
# when cached XObjects are shared across several pages in a single invocation.
for index in range(1, len(pages) + 1):
    subprocess.run([pdftoppm, "-f", str(index), "-l", str(index), "-r", "120", "-png", str(root / "ube-farm-mvp-costing-proposal.pdf"), str(root / "previews/pdf-page")], check=True, capture_output=True)
    with Image.open(root / f"previews/pdf-page-{index}.png") as preview:
        width, height = preview.size
        for label, fractions in [
            ("header", (0.08, 0.024, 0.92, 0.07)),
            ("footer reference", (0.08, 0.955, 0.45, 0.974)),
        ]:
            box = tuple(int(value * (width if i % 2 == 0 else height)) for i, value in enumerate(fractions))
            crop = preview.crop(box).convert("RGB")
            background = Image.new("RGB", crop.size, preview.getpixel((1, 1)))
            assert ImageChops.difference(crop, background).getbbox(), f"Missing rendered {label} on page {index}"
report = {
    "pages": len(pages),
    "searchableText": True,
    "characters": len(combined),
    "projectFee": total,
    "weeks": len(data["delivery"]),
    "backend": "New backend included",
    "stack": "MERN (MongoDB, Express, React, Node.js) with TypeScript",
    "checks": [
        "Seven A4 pages; no research/sources appendix",
        "Every page has searchable text and correct footer",
        "Itemized costs, payments and first-year budget verified",
        "Farm inventory, protected batch chain and public QR included",
        "All ten weekly milestones and negotiable/additional-cost clauses present",
        "No stale static-only scope or free-backend-hosting claim",
        "All pages fit without footer collision or horizontal overflow",
        "All final PDF pages rendered with Poppler for visual review",
    ],
}
(root / "source/pdf-verification.json").write_text(json.dumps(report, indent=2), encoding="utf-8")
print(f"PDF verified and rendered: {len(pages)} A4 pages, {len(combined)} searchable characters, PHP {total:,}, {len(data['delivery'])} weeks.")
