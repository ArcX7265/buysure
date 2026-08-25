from pathlib import Path
from datetime import date
from math import ceil

from PIL import Image, ImageDraw, ImageFont
from docx import Document
from docx.enum.section import WD_SECTION
from docx.enum.table import WD_CELL_VERTICAL_ALIGNMENT, WD_ROW_HEIGHT_RULE, WD_TABLE_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.style import WD_STYLE_TYPE
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Inches, Pt, RGBColor


ROOT = Path(__file__).resolve().parent
WORK = ROOT / "_report_work"
WORK.mkdir(exist_ok=True)
OUTPUT = ROOT / "DealTwin_Super_Detailed_Project_Report.docx"

# Selected design preset: standard_business_brief.
# Named visual override: DealTwin accent gold (#F2B01E) and deep ink (#0B2545)
# are used for cover/kickers/callouts while preset geometry and spacing remain intact.
PAGE_WIDTH_DXA = 9360
TABLE_INDENT_DXA = 120
NAVY = "0B2545"
BLUE = "2E74B5"
DARK_BLUE = "1F4D78"
GOLD = "F2B01E"
GOLD_LIGHT = "FFF5D8"
INK = "17212B"
MUTED = "5D6773"
LIGHT = "F2F4F7"
BLUE_GRAY = "E8EEF5"
GREEN = "1F6B52"
GREEN_LIGHT = "EAF5F0"
RED = "9B1C1C"
RED_LIGHT = "FCECEC"
WHITE = "FFFFFF"


def rgb(hex_value):
    return RGBColor.from_string(hex_value)


def pil_color(hex_value):
    return "#" + hex_value.lstrip("#")


def set_run_font(run, name="Calibri", size=11, color=INK, bold=False, italic=False):
    run.font.name = name
    run._element.get_or_add_rPr().rFonts.set(qn("w:ascii"), name)
    run._element.get_or_add_rPr().rFonts.set(qn("w:hAnsi"), name)
    run.font.size = Pt(size)
    run.font.color.rgb = rgb(color)
    run.bold = bold
    run.italic = italic


def shade_cell(cell, fill):
    tc_pr = cell._tc.get_or_add_tcPr()
    shd = tc_pr.find(qn("w:shd"))
    if shd is None:
        shd = OxmlElement("w:shd")
        tc_pr.append(shd)
    shd.set(qn("w:fill"), fill)


def set_cell_margins(cell, top=80, start=120, bottom=80, end=120):
    tc = cell._tc
    tc_pr = tc.get_or_add_tcPr()
    tc_mar = tc_pr.first_child_found_in("w:tcMar")
    if tc_mar is None:
        tc_mar = OxmlElement("w:tcMar")
        tc_pr.append(tc_mar)
    for tag, value in (("top", top), ("start", start), ("bottom", bottom), ("end", end)):
        node = tc_mar.find(qn(f"w:{tag}"))
        if node is None:
            node = OxmlElement(f"w:{tag}")
            tc_mar.append(node)
        node.set(qn("w:w"), str(value))
        node.set(qn("w:type"), "dxa")


def set_table_borders(table, color="D5DAE1", size=6):
    tbl_pr = table._tbl.tblPr
    borders = tbl_pr.find(qn("w:tblBorders"))
    if borders is None:
        borders = OxmlElement("w:tblBorders")
        tbl_pr.append(borders)
    for edge in ("top", "left", "bottom", "right", "insideH", "insideV"):
        el = borders.find(qn(f"w:{edge}"))
        if el is None:
            el = OxmlElement(f"w:{edge}")
            borders.append(el)
        el.set(qn("w:val"), "single")
        el.set(qn("w:sz"), str(size))
        el.set(qn("w:space"), "0")
        el.set(qn("w:color"), color)


def set_table_geometry(table, widths_dxa, indent_dxa=TABLE_INDENT_DXA):
    assert sum(widths_dxa) == PAGE_WIDTH_DXA
    table.autofit = False
    table.alignment = WD_TABLE_ALIGNMENT.LEFT
    tbl = table._tbl
    tbl_pr = tbl.tblPr
    tbl_w = tbl_pr.find(qn("w:tblW"))
    if tbl_w is None:
        tbl_w = OxmlElement("w:tblW")
        tbl_pr.append(tbl_w)
    tbl_w.set(qn("w:w"), str(PAGE_WIDTH_DXA))
    tbl_w.set(qn("w:type"), "dxa")
    tbl_ind = tbl_pr.find(qn("w:tblInd"))
    if tbl_ind is None:
        tbl_ind = OxmlElement("w:tblInd")
        tbl_pr.append(tbl_ind)
    tbl_ind.set(qn("w:w"), str(indent_dxa))
    tbl_ind.set(qn("w:type"), "dxa")
    grid = tbl.tblGrid
    for child in list(grid):
        grid.remove(child)
    for width in widths_dxa:
        gc = OxmlElement("w:gridCol")
        gc.set(qn("w:w"), str(width))
        grid.append(gc)
    for row in table.rows:
        row.height_rule = WD_ROW_HEIGHT_RULE.AT_LEAST
        for idx, cell in enumerate(row.cells):
            tc_pr = cell._tc.get_or_add_tcPr()
            tc_w = tc_pr.find(qn("w:tcW"))
            if tc_w is None:
                tc_w = OxmlElement("w:tcW")
                tc_pr.append(tc_w)
            tc_w.set(qn("w:w"), str(widths_dxa[idx]))
            tc_w.set(qn("w:type"), "dxa")
            cell.width = Inches(widths_dxa[idx] / 1440)
            cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
            set_cell_margins(cell)


def add_numbering(doc, kind="bullet"):
    numbering = doc.part.numbering_part.element
    abstract_ids = [int(x.get(qn("w:abstractNumId"))) for x in numbering.findall(qn("w:abstractNum"))]
    num_ids = [int(x.get(qn("w:numId"))) for x in numbering.findall(qn("w:num"))]
    abstract_id = max(abstract_ids, default=0) + 1
    num_id = max(num_ids, default=0) + 1
    abstract = OxmlElement("w:abstractNum")
    abstract.set(qn("w:abstractNumId"), str(abstract_id))
    multi = OxmlElement("w:multiLevelType")
    multi.set(qn("w:val"), "singleLevel")
    abstract.append(multi)
    lvl = OxmlElement("w:lvl")
    lvl.set(qn("w:ilvl"), "0")
    start = OxmlElement("w:start")
    start.set(qn("w:val"), "1")
    lvl.append(start)
    num_fmt = OxmlElement("w:numFmt")
    num_fmt.set(qn("w:val"), "bullet" if kind == "bullet" else "decimal")
    lvl.append(num_fmt)
    lvl_text = OxmlElement("w:lvlText")
    lvl_text.set(qn("w:val"), "•" if kind == "bullet" else "%1.")
    lvl.append(lvl_text)
    suff = OxmlElement("w:suff")
    suff.set(qn("w:val"), "tab")
    lvl.append(suff)
    ppr = OxmlElement("w:pPr")
    tabs = OxmlElement("w:tabs")
    tab = OxmlElement("w:tab")
    tab.set(qn("w:val"), "num")
    tab.set(qn("w:pos"), "720")
    tabs.append(tab)
    ppr.append(tabs)
    ind = OxmlElement("w:ind")
    ind.set(qn("w:left"), "720")
    ind.set(qn("w:hanging"), "360")
    ppr.append(ind)
    spacing = OxmlElement("w:spacing")
    spacing.set(qn("w:after"), "160")
    spacing.set(qn("w:line"), "280")
    spacing.set(qn("w:lineRule"), "auto")
    ppr.append(spacing)
    lvl.append(ppr)
    rpr = OxmlElement("w:rPr")
    rfonts = OxmlElement("w:rFonts")
    rfonts.set(qn("w:ascii"), "Calibri")
    rfonts.set(qn("w:hAnsi"), "Calibri")
    rpr.append(rfonts)
    lvl.append(rpr)
    abstract.append(lvl)
    numbering.append(abstract)
    num = OxmlElement("w:num")
    num.set(qn("w:numId"), str(num_id))
    abs_id = OxmlElement("w:abstractNumId")
    abs_id.set(qn("w:val"), str(abstract_id))
    num.append(abs_id)
    numbering.append(num)
    return num_id


def add_page_number(paragraph):
    paragraph.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    run = paragraph.add_run("Page ")
    set_run_font(run, size=9, color=MUTED)
    fld = OxmlElement("w:fldSimple")
    fld.set(qn("w:instr"), "PAGE")
    r = OxmlElement("w:r")
    t = OxmlElement("w:t")
    t.text = "1"
    r.append(t)
    fld.append(r)
    paragraph._p.append(fld)


def add_hyperlink(paragraph, text, url, color=BLUE):
    part = paragraph.part
    rid = part.relate_to(url, "http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink", is_external=True)
    hyperlink = OxmlElement("w:hyperlink")
    hyperlink.set(qn("r:id"), rid)
    new_run = OxmlElement("w:r")
    rpr = OxmlElement("w:rPr")
    c = OxmlElement("w:color")
    c.set(qn("w:val"), color)
    rpr.append(c)
    u = OxmlElement("w:u")
    u.set(qn("w:val"), "single")
    rpr.append(u)
    new_run.append(rpr)
    text_el = OxmlElement("w:t")
    text_el.text = text
    new_run.append(text_el)
    hyperlink.append(new_run)
    paragraph._p.append(hyperlink)


def apply_paragraph_spacing(paragraph, before=0, after=6, line=1.10, keep=False):
    pf = paragraph.paragraph_format
    pf.space_before = Pt(before)
    pf.space_after = Pt(after)
    pf.line_spacing = line
    pf.keep_with_next = keep


def add_body(doc, text, bold_lead=None, italic=False, align=WD_ALIGN_PARAGRAPH.LEFT, after=6):
    p = doc.add_paragraph()
    p.alignment = align
    apply_paragraph_spacing(p, after=after, line=1.10)
    if bold_lead and text.startswith(bold_lead):
        r1 = p.add_run(bold_lead)
        set_run_font(r1, bold=True)
        r2 = p.add_run(text[len(bold_lead):])
        set_run_font(r2, italic=italic)
    else:
        r = p.add_run(text)
        set_run_font(r, italic=italic)
    return p


def add_bullet(doc, text, num_id, level=0, bold_lead=None):
    p = doc.add_paragraph()
    ppr = p._p.get_or_add_pPr()
    num_pr = OxmlElement("w:numPr")
    ilvl = OxmlElement("w:ilvl")
    ilvl.set(qn("w:val"), str(level))
    n = OxmlElement("w:numId")
    n.set(qn("w:val"), str(num_id))
    num_pr.append(ilvl)
    num_pr.append(n)
    ppr.append(num_pr)
    apply_paragraph_spacing(p, after=8, line=1.167)
    if bold_lead and text.startswith(bold_lead):
        r1 = p.add_run(bold_lead)
        set_run_font(r1, bold=True)
        r2 = p.add_run(text[len(bold_lead):])
        set_run_font(r2)
    else:
        set_run_font(p.add_run(text))
    return p


def add_numbered(doc, text, num_id, bold_lead=None):
    return add_bullet(doc, text, num_id, bold_lead=bold_lead)


def add_callout(doc, title, text, fill=GOLD_LIGHT, accent=GOLD):
    table = doc.add_table(rows=1, cols=1)
    set_table_geometry(table, [PAGE_WIDTH_DXA])
    set_table_borders(table, color=accent, size=10)
    cell = table.cell(0, 0)
    shade_cell(cell, fill)
    p = cell.paragraphs[0]
    apply_paragraph_spacing(p, after=2, line=1.10)
    set_run_font(p.add_run(title + "  "), size=11, color=NAVY, bold=True)
    set_run_font(p.add_run(text), size=10.5, color=INK)
    doc.add_paragraph().paragraph_format.space_after = Pt(2)
    return table


def add_heading(doc, text, level=1):
    p = doc.add_paragraph(text, style=f"Heading {level}")
    p.paragraph_format.keep_with_next = True
    return p


def add_table(doc, headers, rows, widths, header_fill=BLUE_GRAY, font_size=9.5):
    table = doc.add_table(rows=1, cols=len(headers))
    set_table_geometry(table, widths)
    set_table_borders(table)
    header = table.rows[0]
    tr_pr = header._tr.get_or_add_trPr()
    tbl_header = OxmlElement("w:tblHeader")
    tbl_header.set(qn("w:val"), "true")
    tr_pr.append(tbl_header)
    for i, text in enumerate(headers):
        cell = header.cells[i]
        shade_cell(cell, header_fill)
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        apply_paragraph_spacing(p, after=0, line=1.0)
        set_run_font(p.add_run(str(text)), size=font_size, color=NAVY, bold=True)
    for row in rows:
        cells = table.add_row().cells
        for i, value in enumerate(row):
            p = cells[i].paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER if len(str(value)) < 18 and i > 0 else WD_ALIGN_PARAGRAPH.LEFT
            apply_paragraph_spacing(p, after=0, line=1.0)
            set_run_font(p.add_run(str(value)), size=font_size, color=INK)
            if len(table.rows) % 2 == 0:
                shade_cell(cells[i], "FAFBFC")
        set_table_geometry(table, widths)
    spacer = doc.add_paragraph()
    spacer.paragraph_format.space_after = Pt(2)
    return table


def set_keep_together(row):
    tr_pr = row._tr.get_or_add_trPr()
    cant_split = OxmlElement("w:cantSplit")
    tr_pr.append(cant_split)


def create_flow_image(path):
    width, height = 1800, 470
    im = Image.new("RGB", (width, height), pil_color(WHITE))
    draw = ImageDraw.Draw(im)
    font_path = Path("C:/Windows/Fonts/arial.ttf")
    bold_path = Path("C:/Windows/Fonts/arialbd.ttf")
    font = ImageFont.truetype(str(font_path), 34)
    small = ImageFont.truetype(str(font_path), 25)
    bold = ImageFont.truetype(str(bold_path), 34)
    steps = [
        ("CAPTURE", "Ad • quote • voice"),
        ("EXTRACT", "Claims + source proof"),
        ("MATCH", "Promise ↔ paperwork"),
        ("CALCULATE", "True cost + impact"),
        ("ACT", "Clarify • export • track"),
    ]
    box_w, box_h, gap = 300, 210, 55
    x0, y = 25, 125
    for i, (title, sub) in enumerate(steps):
        x = x0 + i * (box_w + gap)
        fill = GOLD_LIGHT if i in (0, 4) else BLUE_GRAY
        outline = GOLD if i in (0, 4) else BLUE
        draw.rounded_rectangle((x, y, x + box_w, y + box_h), radius=24, fill=pil_color(fill), outline=pil_color(outline), width=5)
        tw = draw.textlength(title, font=bold)
        draw.text((x + (box_w - tw) / 2, y + 48), title, font=bold, fill=pil_color(NAVY))
        lines = sub.split(" • ")
        for j, line in enumerate(lines):
            lw = draw.textlength(line, font=small)
            draw.text((x + (box_w - lw) / 2, y + 112 + j * 32), line, font=small, fill=pil_color(MUTED))
        if i < len(steps) - 1:
            ax1 = x + box_w + 10
            ax2 = x + box_w + gap - 10
            ay = y + box_h // 2
            draw.line((ax1, ay, ax2, ay), fill=pil_color(NAVY), width=6)
            draw.polygon([(ax2, ay), (ax2 - 20, ay - 13), (ax2 - 20, ay + 13)], fill=pil_color(NAVY))
    draw.text((25, 35), "DealTwin evidence pipeline", font=font, fill=pil_color(NAVY))
    im.save(path, quality=95)


def create_architecture_image(path):
    width, height = 1800, 980
    im = Image.new("RGB", (width, height), pil_color(WHITE))
    draw = ImageDraw.Draw(im)
    regular = ImageFont.truetype("C:/Windows/Fonts/arial.ttf", 25)
    bold = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", 32)
    title = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", 38)
    draw.text((60, 40), "Reference architecture: local-first with optional cloud enrichment", font=title, fill=pil_color(NAVY))
    layers = [
        ("ANDROID EXPERIENCE", "Capture • deal timeline • review • voice • export", GOLD_LIGHT, GOLD),
        ("ON-DEVICE INTELLIGENCE", "OCR • ASR • PII redaction • claim schema • small LLM • calculators", BLUE_GRAY, BLUE),
        ("EVIDENCE ENGINE", "Claim graph • source anchors • contradiction matcher • confidence • audit log", "EDF3FA", DARK_BLUE),
        ("LOCAL DATA & SECURITY", "Encrypted deal vault • hashes • consent metadata • deletion controls", GREEN_LIGHT, GREEN),
        ("OPTIONAL SERVICES", "Model updates • source rules • account sync • anonymized analytics", LIGHT, MUTED),
    ]
    y = 125
    for i, (name, sub, fill, outline) in enumerate(layers):
        draw.rounded_rectangle((120, y, 1680, y + 125), radius=22, fill=pil_color(fill), outline=pil_color(outline), width=4)
        draw.text((160, y + 22), name, font=bold, fill=pil_color(NAVY))
        draw.text((160, y + 70), sub, font=regular, fill=pil_color(INK))
        if i < len(layers) - 1:
            cx = 900
            draw.line((cx, y + 125, cx, y + 155), fill=pil_color(NAVY), width=5)
            draw.polygon([(cx, y + 155), (cx - 12, y + 137), (cx + 12, y + 137)], fill=pil_color(NAVY))
        y += 160
    im.save(path, quality=95)


def configure_document(doc):
    section = doc.sections[0]
    section.page_width = Inches(8.5)
    section.page_height = Inches(11)
    section.top_margin = Inches(1)
    section.bottom_margin = Inches(1)
    section.left_margin = Inches(1)
    section.right_margin = Inches(1)
    section.header_distance = Inches(0.492)
    section.footer_distance = Inches(0.492)

    styles = doc.styles
    normal = styles["Normal"]
    normal.font.name = "Calibri"
    normal._element.rPr.rFonts.set(qn("w:ascii"), "Calibri")
    normal._element.rPr.rFonts.set(qn("w:hAnsi"), "Calibri")
    normal.font.size = Pt(11)
    normal.font.color.rgb = rgb(INK)
    normal.paragraph_format.space_before = Pt(0)
    normal.paragraph_format.space_after = Pt(6)
    normal.paragraph_format.line_spacing = 1.10

    heading_tokens = {
        "Heading 1": (16, BLUE, 16, 8),
        "Heading 2": (13, BLUE, 12, 6),
        "Heading 3": (12, DARK_BLUE, 8, 4),
    }
    for name, (size, color, before, after) in heading_tokens.items():
        st = styles[name]
        st.font.name = "Calibri"
        st._element.rPr.rFonts.set(qn("w:ascii"), "Calibri")
        st._element.rPr.rFonts.set(qn("w:hAnsi"), "Calibri")
        st.font.size = Pt(size)
        st.font.bold = True
        st.font.color.rgb = rgb(color)
        st.paragraph_format.space_before = Pt(before)
        st.paragraph_format.space_after = Pt(after)
        st.paragraph_format.line_spacing = 1.05
        st.paragraph_format.keep_with_next = True

    for section in doc.sections:
        header = section.header
        p = header.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        apply_paragraph_spacing(p, after=0, line=1.0)
        set_run_font(p.add_run("DEALTWIN  |  PRODUCT & HACKATHON DOSSIER"), size=8.5, color=MUTED, bold=True)
        footer = section.footer
        fp = footer.paragraphs[0]
        add_page_number(fp)

def write_cover(doc):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(95)
    p.paragraph_format.space_after = Pt(18)
    set_run_font(p.add_run("iQOO HACKATHON 2026"), size=11, color=GOLD, bold=True)

    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_after = Pt(8)
    set_run_font(p.add_run("DealTwin"), size=34, color=NAVY, bold=True)

    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_after = Pt(24)
    set_run_font(p.add_run("Evidence-Backed Promise-to-Paperwork Intelligence"), size=16, color=DARK_BLUE, bold=True)

    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_after = Pt(46)
    set_run_font(p.add_run("A super-detailed product, technology, execution and pitch report"), size=11.5, color=MUTED, italic=True)

    add_callout(
        doc,
        "Core proposition",
        "Companies remember what customers signed. DealTwin remembers what they were promised - and connects every conclusion to the original evidence.",
        fill=GOLD_LIGHT,
        accent=GOLD,
    )

    doc.add_paragraph().paragraph_format.space_after = Pt(28)
    rows = [
        ("Primary track", "FinTech and Commerce"),
        ("City-battle MVP", "No-cost EMI electronics purchase"),
        ("Product mode", "Android, local-first, evidence-linked"),
        ("Prepared", "24 August 2026"),
        ("Document status", "Strategy and build specification - Version 1.0"),
    ]
    add_table(doc, ["Report field", "Definition"], rows, [2700, 6660], font_size=9.5)
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(18)
    set_run_font(p.add_run("CONFIDENTIAL WORKING DOCUMENT"), size=9, color=MUTED, bold=True)
    doc.add_page_break()


def add_contents(doc, bullet_num):
    add_heading(doc, "Contents", 1)
    sections = [
        "Executive summary and recommendation",
        "Hackathon context and strategic fit",
        "Product definition and scope",
        "Problem analysis and opportunity",
        "Target users, jobs and personas",
        "Experience design and user journeys",
        "Feature system and prioritization",
        "Flagship no-cost EMI scenario",
        "Functional and non-functional requirements",
        "Technical and AI architecture",
        "Data model, evidence and trust design",
        "Hackathon build plan and team execution",
        "Testing, demo and presentation strategy",
        "Competitive positioning and defensibility",
        "Business model, go-to-market and metrics",
        "Risks, ethics and mitigation",
        "Roadmap and honest viability assessment",
        "Appendices: backlog, sample outputs, glossary and sources",
    ]
    for s in sections:
        add_bullet(doc, s, bullet_num)
    add_callout(doc, "How to use this report", "Sections 1-7 define what to build; Sections 8-13 specify how to build and demonstrate it; Sections 14-17 explain how to position, scale and de-risk it.", fill=LIGHT, accent=BLUE)
    doc.add_page_break()


def build_report():
    flow_path = WORK / "dealtwin_flow.png"
    architecture_path = WORK / "dealtwin_architecture.png"
    create_flow_image(flow_path)
    create_architecture_image(architecture_path)

    doc = Document()
    configure_document(doc)
    bullet_num = add_numbering(doc, "bullet")
    decimal_num = add_numbering(doc, "decimal")
    write_cover(doc)
    add_contents(doc, bullet_num)

    add_heading(doc, "1. Executive summary and recommendation", 1)
    add_body(doc, "DealTwin is a mobile, local-first evidence intelligence product that compares what a consumer was promised before a purchase with what appears in the final paperwork, payment terms and fulfilment evidence. It is designed to find claim-level discrepancies without pretending to replace a lawyer, regulator or financial adviser.")
    add_body(doc, "The recommended city-battle MVP is intentionally narrow: an electronics purchase financed through a no-cost EMI offer. The user imports an advertisement, records or uploads a consented sales pitch, scans the invoice and Key Facts Statement, and receives an evidence-linked Promise Ledger plus a deterministic true-cost calculation.")
    add_callout(doc, "Recommendation", "Proceed only if the team commits to a narrow, reliable comparison engine. Do not build a generic contract chatbot. The winning story is evidence reconciliation: promise, paperwork, monetary impact and action.")

    add_heading(doc, "1.1 One-line pitch", 2)
    add_body(doc, "Companies remember what customers signed. DealTwin remembers what they were promised.", italic=True, align=WD_ALIGN_PARAGRAPH.CENTER)

    add_heading(doc, "1.2 Project abstract", 2)
    add_body(doc, "DealTwin captures advertisements, quotations, consented sales conversations, invoices, loan documents and warranties, converting each source into structured, source-anchored claims. Its matching engine labels promises as kept, changed, missing, contradicted or unverifiable. It calculates the financial impact of discrepancies, explains them in simple language and generates neutral clarification material. Sensitive processing is performed on-device where practical, giving the project a credible reason to use the iQOO phone and Snapdragon NPU rather than treating mobile hardware as a decorative interface.")

    add_heading(doc, "1.3 Honest competitive position", 2)
    add_body(doc, "The project is not globally unique. Contract analysis applications and enterprise verbal-versus-written comparison tools exist. DealTwin's defendable wedge is consumer-facing, multimodal, transaction-lifecycle comparison for Indian commerce and finance, with exact source anchors and deterministic cost calculations. A generic implementation would rank poorly; a polished evidence engine could be a finalist.")
    add_table(doc, ["Execution quality", "Likely relative outcome among 100 teams"], [
        ("Generic upload-and-summarize chatbot", "Approximately 35th-60th"),
        ("Working promise-versus-paperwork comparison", "Approximately 12th-20th"),
        ("Reliable evidence-linked, phone-first finance demo", "Approximately 5th-10th"),
        ("Exceptional product polish and presentation", "Potentially top 1-5"),
    ], [5400, 3960])

    add_heading(doc, "2. Hackathon context and strategic fit", 1)
    add_body(doc, "The design below is calibrated to the participant-supplied iQOO Hackathon structure: a 30-hour city battle, approximately 19 hours of pure build time, phone-first development, Red Light and Green Light phases, Office Kit tracking, and a 3-5 minute final pitch. The evaluation weights are unusually product-oriented: end-product quality is the largest criterion, and 25 points are tied to device behavior rather than self-reporting. [S1]")
    add_table(doc, ["Criterion", "Weight", "DealTwin response"], [
        ("End-product quality", "30", "One complete high-value transaction with a reliable result and usable action."),
        ("Novelty and impact", "20", "Multimodal promise-to-paperwork reconciliation rather than document summarization."),
        ("Technical depth", "15", "OCR, ASR, claim schema, evidence graph, semantic matching and deterministic finance."),
        ("Creative phone use", "15", "Camera, microphone, local inference, document capture, voice and secure storage."),
        ("Office Kit use", "10", "Measured phone-laptop bridge use throughout building, debugging and demo preparation."),
        ("Demo and presentation", "10", "A visible contradiction and quantified cost difference in under three minutes."),
    ], [2600, 900, 5860], font_size=9)

    add_heading(doc, "2.1 Red Light / Green Light operating plan", 2)
    add_table(doc, ["Phase", "Available devices", "Best DealTwin work"], [
        ("Red Light", "Phone-first; laptop restricted as build machine", "Capture flows, Android UI, on-device OCR/ASR tests, camera handling, local storage, model benchmarking and Office Kit bridge usage."),
        ("Green Light", "Phone and laptop", "Model conversion, rule implementation, integration, automated tests, report generation, dataset cleanup and demo polish."),
        ("Evaluation windows", "Outside build split", "Stabilize data, preserve working build and avoid risky last-minute changes."),
    ], [1700, 2500, 5160], font_size=9)
    add_callout(doc, "Critical scoring note", "A good product does not automatically earn the 25 HackTracker points. The team must deliberately use the iQOO phone and Office Kit throughout the actual build, because those points are read from device data.", fill=RED_LIGHT, accent=RED)

    add_heading(doc, "3. Product definition and scope", 1)
    add_heading(doc, "3.1 Product vision", 2)
    add_body(doc, "Make the truth of a consumer deal inspectable: every important promise should be traceable from its original source to the final terms, actual cost and eventual fulfilment.")
    add_heading(doc, "3.2 Product principles", 2)
    principles = [
        "Evidence before interpretation: every conclusion must point to a source quote, image region, page or timestamp.",
        "Neutral before accusatory: call something a discrepancy or unresolved difference, not fraud, unless an authoritative body determines otherwise.",
        "Deterministic money: APR, fees, GST, cash discounts and repayment totals should use tested calculators.",
        "Human confirmation at uncertainty: low-confidence OCR and ambiguous clauses require review.",
        "Local-first privacy: raw financial documents and audio remain on the device wherever possible.",
        "Narrow reliability beats universal claims: the MVP supports one transaction deeply.",
    ]
    for item in principles:
        add_bullet(doc, item, bullet_num)

    add_heading(doc, "3.3 Scope boundaries", 2)
    add_table(doc, ["In city-battle scope", "Explicitly out of city-battle scope"], [
        ("One electronics/EMI transaction", "Universal legal document interpretation"),
        ("English + controlled Hinglish voice sample", "All Indian languages"),
        ("Four input types", "Direct bank or marketplace integrations"),
        ("Five discrepancy classes", "Automated legal complaint filing"),
        ("Deterministic true-cost calculator", "Personalized financial advice"),
        ("Evidence export", "Cloud synchronization and family accounts"),
    ], [4680, 4680])

    add_heading(doc, "3.4 Evidence pipeline", 2)
    doc.add_picture(str(flow_path), width=Inches(6.5))
    doc.inline_shapes[-1]._inline.docPr.set("descr", "Five-stage DealTwin evidence pipeline from capture through action")
    cap = doc.add_paragraph("Figure 1. DealTwin's five-stage evidence pipeline.")
    cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
    set_run_font(cap.runs[0], size=9, color=MUTED, italic=True)

    add_heading(doc, "4. Problem analysis and opportunity", 1)
    add_heading(doc, "4.1 The transaction information gap", 2)
    add_body(doc, "Important deal information is fragmented across marketing material, seller conversations, checkout screens and formal documents. The consumer is expected to remember and reconcile these sources manually, often under time pressure. The seller or lender, by contrast, retains standardized records and treats the signed document as the authoritative version.")
    add_body(doc, "Indian consumer-protection rules already recognize concerns around misleading advertisements and deceptive interfaces. The CCPA's dark-pattern guidance includes practices such as bait-and-switch and drip pricing, while RBI's KFS framework requires key loan information including all-in cost to be presented in a simple format. DealTwin does not enforce these rules; it helps a user inspect their own evidence. [S2] [S3] [S4]")

    add_heading(doc, "4.2 Primary pain points", 2)
    pains = [
        "Promises disappear: verbal assurances may never be added to the final written terms.",
        "Numbers are hard to normalize: monthly EMI, APR, processing fee, GST and foregone discount are presented in different places.",
        "Documents are asymmetric: the institution understands the format; the customer may see it only once.",
        "Evidence is scattered: screenshots, brochures, chats, audio and PDFs are not organized around the same claim.",
        "Action is unclear: even when a discrepancy is noticed, the customer may not know what to ask before proceeding.",
    ]
    for item in pains:
        add_bullet(doc, item, bullet_num)

    add_heading(doc, "4.3 Why now", 2)
    add_body(doc, "Mobile commerce, embedded credit and app-based transactions generate abundant digital evidence. On-device OCR, speech recognition and compact language models make it feasible to structure that evidence privately. The regulatory environment also emphasizes clearer disclosure, making an evidence and comprehension tool timely without requiring DealTwin to become a regulator or legal adviser.")

    add_heading(doc, "5. Target users, jobs and personas", 1)
    add_table(doc, ["Persona", "Situation", "Core job", "Failure today"], [
        ("First-time EMI buyer", "Buying a phone or appliance", "Know the real cost before confirming", "Compares only monthly EMI"),
        ("Family decision-maker", "Helping a parent or sibling", "Create one understandable deal record", "Information is spread across chats and papers"),
        ("Small-business purchaser", "Buying equipment or telecom service", "Confirm fees, lock-in and warranty", "Relies on salesperson follow-up"),
        ("Consumer advocate", "Assisting with a dispute", "Organize evidence and chronology", "Manually reconstructs the transaction"),
    ], [1900, 2400, 3000, 2060], font_size=8.7)

    add_heading(doc, "5.1 Jobs to be done", 2)
    jobs = [
        "When I am considering a financed purchase, help me see the real cost before I commit.",
        "When a seller makes an important promise, help me preserve it with context and consent.",
        "When the final document arrives, show exactly what changed and where.",
        "When information is missing, tell me what question to ask without making unsupported accusations.",
        "When a commitment is due later, remind me and preserve the original evidence.",
    ]
    for item in jobs:
        add_bullet(doc, item, bullet_num)

    add_heading(doc, "6. Experience design and user journeys", 1)
    add_heading(doc, "6.1 Primary user journey", 2)
    journey = [
        "Create a deal: choose Electronics + EMI and name the purchase.",
        "Capture the offer: import the product listing and financing advertisement.",
        "Capture the promise: record a consented 20-second voice note or upload written seller messages.",
        "Scan the paperwork: photograph the invoice, KFS and warranty page.",
        "Review extraction: confirm critical numbers and source text.",
        "Generate the Promise Ledger: see kept, changed, missing, contradicted and unverifiable claims.",
        "Calculate the true cost: normalize fees, GST, interest and lost discounts.",
        "Act: ask DealTwin a cited question or export a neutral clarification card.",
    ]
    for item in journey:
        add_numbered(doc, item, decimal_num)

    add_heading(doc, "6.2 Key screens", 2)
    add_table(doc, ["Screen", "Purpose", "Essential elements"], [
        ("Home / Deal Vault", "Find active deals", "Status, unresolved count, due commitments, privacy state"),
        ("New Deal", "Select template", "Electronics + EMI preset, language, consent reminder"),
        ("Capture", "Add evidence", "Camera, file share, screenshot, audio, quality check"),
        ("Extraction Review", "Correct AI", "Source crop, field value, confidence, accept/edit"),
        ("Promise Ledger", "Core comparison", "Claim, source, final term, status and impact"),
        ("True Cost", "Normalize finance", "Advertised vs effective price, fee breakdown, assumptions"),
        ("Ask with Evidence", "Answer questions", "Response, citations, uncertainty and source links"),
        ("Action / Export", "Resolve issue", "Clarification message, evidence card, selected redactions"),
    ], [1800, 2400, 5160], font_size=8.8)

    add_heading(doc, "6.3 Experience rules", 2)
    for item in [
        "The app never hides the original evidence behind a summary.",
        "Money values receive stronger review prompts than descriptive claims.",
        "A low-confidence result cannot be labeled contradicted until confirmed.",
        "All exported evidence is previewed with personal information redacted by default.",
        "The app clearly separates extracted fact, calculated result and model interpretation.",
    ]:
        add_bullet(doc, item, bullet_num)

    add_heading(doc, "7. Feature system and prioritization", 1)
    add_heading(doc, "7.1 P0 city-battle feature set", 2)
    p0 = [
        ("Deal workspace", "Groups all evidence and results for one transaction.", "Must work"),
        ("Screenshot and camera import", "Captures advertisement, invoice and KFS.", "Must work"),
        ("Short audio import/recording", "Captures a consented sales promise.", "Must work"),
        ("Structured claim extraction", "Creates price, fee, warranty and cancellation claims.", "Must work"),
        ("Promise-to-paperwork matcher", "Produces five explicit statuses.", "Hero feature"),
        ("Source anchoring", "Links each result to quote, crop, page or timestamp.", "Hero feature"),
        ("True-cost calculator", "Computes effective cost deterministically.", "Hero feature"),
        ("Clarification card", "Exports a neutral, evidence-backed question.", "Demo close"),
    ]
    add_table(doc, ["Feature", "Purpose", "Priority"], p0, [2600, 4860, 1900], font_size=9)

    add_heading(doc, "7.2 P1 finalist / Grand Finale features", 2)
    for item in [
        "Teach-back mode that checks whether the user understands total cost, refundability and lock-in.",
        "Hindi and Hinglish explanations with spoken playback.",
        "Draft-versus-final document comparison.",
        "Seller confirmation link for individual promises.",
        "Promise due-date tracking for cashback, delivery and warranty registration.",
        "Product-label scan after delivery for observable model, quantity and warranty verification.",
        "Domain templates for telecom, insurance, coaching and home services.",
    ]:
        add_bullet(doc, item, bullet_num)

    add_heading(doc, "7.3 Post-hackathon platform features", 2)
    for item in [
        "Encrypted account synchronization and family deal vault.",
        "Opt-in consumer adviser or advocate collaboration.",
        "Institution-side Deal Receipt API for confirmed promises.",
        "Anonymized pattern analytics that never expose individual documents.",
        "Source-specific rules and model updates delivered without uploading raw evidence.",
        "Enterprise compliance mode for companies wishing to audit their own sales journeys.",
    ]:
        add_bullet(doc, item, bullet_num)

    add_heading(doc, "8. Flagship no-cost EMI scenario", 1)
    add_heading(doc, "8.1 Demo dataset", 2)
    add_table(doc, ["Evidence", "Claim shown", "Ground truth used in demo"], [
        ("Advertisement", "No-cost EMI; ₹49,999; two-year warranty", "Promotional source"),
        ("Sales voice note", "Zero processing fee; cancel anytime", "Consented 20-second sample"),
        ("Invoice", "Cash discount not applied", "Final commerce evidence"),
        ("KFS", "₹2,499 fee + GST; pre-closure charge", "Final finance evidence"),
        ("Warranty page", "One-year warranty", "Final fulfilment term"),
    ], [2100, 3700, 3560], font_size=9)

    add_heading(doc, "8.2 Expected Promise Ledger", 2)
    add_table(doc, ["Promise", "Status", "Evidence-linked explanation"], [
        ("No processing fee", "Contradicted", "Voice 00:18 versus KFS page 2: ₹2,499 + GST"),
        ("No-cost EMI", "Changed", "Financing interest is offset partly, but other costs remain"),
        ("Two-year warranty", "Contradicted", "Advertisement versus one-year warranty page"),
        ("Cancel anytime", "Unverifiable", "No matching cancellation clause found"),
        ("₹49,999 payable", "Changed", "Effective cost increases after fees and lost discount"),
    ], [2600, 1800, 4960], font_size=9)

    add_heading(doc, "8.3 Deterministic true-cost example", 2)
    add_table(doc, ["Component", "Amount"], [
        ("Advertised product price", "₹49,999"),
        ("Processing fee", "+ ₹2,499"),
        ("GST on processing fee", "+ ₹450"),
        ("Illustrative GST on EMI interest", "+ ₹842"),
        ("Cash discount foregone", "+ ₹2,000"),
        ("Effective illustrative cost", "₹55,790"),
        ("Difference from advertised price", "+ ₹5,791"),
    ], [6200, 3160])
    add_callout(doc, "Important", "The numbers above are a controlled demonstration dataset, not a claim about any real lender or retailer. The application must visibly label assumptions and never invent missing values.", fill=RED_LIGHT, accent=RED)

    add_heading(doc, "9. Functional and non-functional requirements", 1)
    add_heading(doc, "9.1 Functional requirements", 2)
    requirements = [
        ("FR-01", "Create, rename and delete a deal locally."),
        ("FR-02", "Import JPG, PNG and PDF evidence through camera, file picker or Android Share."),
        ("FR-03", "Record/import a short consented audio artifact and store consent metadata."),
        ("FR-04", "Extract supported claim fields with confidence and source anchor."),
        ("FR-05", "Allow the user to correct extracted values before matching."),
        ("FR-06", "Match semantically related claims across evidence types."),
        ("FR-07", "Assign one of five statuses with a reason and confidence."),
        ("FR-08", "Compute true cost using validated formulas and user-confirmed values."),
        ("FR-09", "Generate an evidence-linked clarification card."),
        ("FR-10", "Redact selected personal information before export."),
    ]
    add_table(doc, ["ID", "Requirement"], requirements, [1200, 8160], font_size=9)

    add_heading(doc, "9.2 Non-functional requirements", 2)
    nfrs = [
        ("Privacy", "Raw evidence is local by default; any cloud use is explicit and optional."),
        ("Reliability", "Critical numbers require user confirmation or high-confidence extraction."),
        ("Latency", "Each document should become reviewable within a practical mobile interaction."),
        ("Explainability", "Every result includes source and classification rationale."),
        ("Offline behavior", "Core demo works without network after models/assets are installed."),
        ("Accessibility", "Readable contrast, large controls and spoken summary path."),
        ("Security", "Encrypted storage, no secrets in logs and safe deletion."),
        ("Portability", "Exported evidence card opens without requiring the app."),
    ]
    add_table(doc, ["Quality", "Requirement"], nfrs, [1900, 7460], font_size=9)

    add_heading(doc, "10. Technical and AI architecture", 1)
    doc.add_picture(str(architecture_path), width=Inches(6.5))
    doc.inline_shapes[-1]._inline.docPr.set("descr", "Layered local-first DealTwin mobile and AI reference architecture")
    cap = doc.add_paragraph("Figure 2. Reference architecture for a privacy-preserving DealTwin implementation.")
    cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
    set_run_font(cap.runs[0], size=9, color=MUTED, italic=True)

    add_heading(doc, "10.1 Recommended implementation stack", 2)
    add_table(doc, ["Layer", "Hackathon recommendation", "Reason"], [
        ("Android", "Kotlin + Jetpack Compose", "Fast native camera/share integration and clear mobile UI"),
        ("Storage", "Room + encrypted file directory", "Local structured data and evidence references"),
        ("Camera/OCR", "CameraX + ML Kit OCR or equivalent local OCR", "Practical mobile document capture"),
        ("Speech", "On-device ASR where available; bundled short-model fallback", "Privacy and offline demo"),
        ("Claim extraction", "Schema-constrained small local/open model", "Turns text into typed claims"),
        ("Matching", "Rules + embeddings + controlled LLM adjudication", "Balances explainability and semantic flexibility"),
        ("Finance", "Pure Kotlin calculators with unit tests", "No hallucinated arithmetic"),
        ("Export", "Android PDF/image evidence card", "Easy 3-minute demo and practical sharing"),
    ], [1700, 4200, 3460], font_size=8.6)

    add_heading(doc, "10.2 Claim schema", 2)
    add_body(doc, "Every extracted claim should be normalized into a compact typed object. This makes the system testable and reduces open-ended model behavior.")
    add_table(doc, ["Field", "Example", "Purpose"], [
        ("claim_id", "C-017", "Stable internal reference"),
        ("type", "processing_fee", "Controlled claim category"),
        ("value", "2499", "Normalized scalar or text"),
        ("unit", "INR", "Calculation and comparison"),
        ("qualifiers", "non-refundable", "Conditions and exclusions"),
        ("source_id", "KFS-01", "Evidence relationship"),
        ("anchor", "page 2, bbox / timestamp", "Verifiable provenance"),
        ("speaker/issuer", "Sales representative", "Attribution"),
        ("confidence", "0.94", "Human-review decision"),
        ("confirmed_by_user", "true", "Trust boundary"),
    ], [1900, 2600, 4860], font_size=8.7)

    add_heading(doc, "10.3 Matching strategy", 2)
    for item in [
        "Candidate generation: match claims with the same controlled type, compatible entity and related qualifiers.",
        "Normalization: standardize currency, percentages, dates, durations and negations.",
        "Deterministic comparisons: exact numeric differences, missing fields and direct polarity conflicts.",
        "Semantic comparison: use a compact model only for paraphrase and qualifier interpretation.",
        "Evidence gate: a contradiction cannot be emitted without both source anchors.",
        "Confidence gate: ambiguous or low-confidence cases become unverifiable or require review.",
    ]:
        add_numbered(doc, item, decimal_num)

    add_heading(doc, "10.4 On-device versus optional cloud", 2)
    add_table(doc, ["Keep on device", "Optional service later"], [
        ("Raw documents, audio and screenshots", "Model/update manifest"),
        ("OCR/ASR text where feasible", "Opt-in heavy analysis for unsupported formats"),
        ("PII redaction and evidence graph", "Encrypted backup"),
        ("True-cost calculations", "Aggregated, privacy-reviewed product insights"),
        ("Core demo and exports", "Institution-side verification APIs"),
    ], [4680, 4680])

    add_heading(doc, "11. Data model, evidence and trust design", 1)
    add_heading(doc, "11.1 Core entities", 2)
    add_table(doc, ["Entity", "Key relationships"], [
        ("Deal", "Owns evidence, claims, comparisons, calculations, actions and reminders"),
        ("EvidenceSource", "File hash, type, issuer, timestamp, consent, OCR/ASR output"),
        ("Claim", "Normalized proposition linked to one evidence anchor"),
        ("Comparison", "Promise claim, final claim, status, rationale, confidence"),
        ("Calculation", "Inputs, formula version, assumptions and result"),
        ("ActionArtifact", "Clarification message, evidence card or report"),
        ("AuditEvent", "Capture, correction, model version and export event"),
    ], [2400, 6960])

    add_heading(doc, "11.2 Trust model", 2)
    add_body(doc, "DealTwin should visibly separate three layers of output:")
    for item in [
        "Extracted fact: what the system read from a source, with confidence.",
        "Calculated fact: a deterministic result produced from confirmed numbers and a named formula.",
        "Interpretive finding: a model-assisted comparison that may require human confirmation.",
    ]:
        add_bullet(doc, item, bullet_num)
    add_callout(doc, "Trust promise", "No citation, no conclusion. No confirmed numbers, no financial total. No consent, no recording.", fill=GREEN_LIGHT, accent=GREEN)

    add_heading(doc, "11.3 Privacy controls", 2)
    for item in [
        "Automatic detection and masking of account numbers, PAN, Aadhaar-like identifiers, addresses and phone numbers in exports.",
        "Per-evidence delete control plus full deal deletion.",
        "No raw evidence in analytics or crash logs.",
        "Model and formula versions stored with each result for reproducibility.",
        "Recording consent prompt and visible recording indicator.",
        "Export preview that requires the user to choose which evidence leaves the device.",
    ]:
        add_bullet(doc, item, bullet_num)

    add_heading(doc, "12. Hackathon build plan and team execution", 1)
    add_heading(doc, "12.1 Assumed three-person team", 2)
    add_table(doc, ["Role", "Primary ownership", "Secondary ownership"], [
        ("Builder A - Android/Product", "Compose UI, camera, storage and export", "Demo stability and integration"),
        ("Builder B - AI/Data", "OCR/ASR, schema extraction and matching", "Synthetic dataset and evaluation"),
        ("Builder C - Logic/Pitch", "Finance engine, evidence graph and tests", "Story, slides and judging"),
    ], [2600, 3600, 3160], font_size=9)

    add_heading(doc, "12.2 19-hour pure-build schedule", 2)
    schedule = [
        ("0:00-1:00", "Freeze demo and schemas", "Known input pack; written success criteria"),
        ("1:00-3:00", "Android shell + Deal Vault", "Navigation and local data flow"),
        ("3:00-5:00", "Capture + OCR/ASR stubs", "Evidence enters application"),
        ("5:00-7:00", "Claim extraction", "Structured, reviewable claims"),
        ("7:00-9:00", "Matching engine", "First Promise Ledger"),
        ("9:00-10:30", "True-cost calculator", "Tested finance output"),
        ("10:30-12:00", "Source anchors + evidence view", "Trustable discrepancy"),
        ("12:00-13:30", "Export and action", "Clarification card"),
        ("13:30-15:00", "Integration and offline pass", "Complete golden path"),
        ("15:00-16:30", "Edge cases and privacy", "No broken demo inputs"),
        ("16:30-17:30", "Visual polish", "Readable, phone-first UI"),
        ("17:30-18:15", "Demo rehearsal", "Under 3:30 with backup video"),
        ("18:15-19:00", "Freeze and package", "Signed build, reset script and evidence backup"),
    ]
    add_table(doc, ["Time", "Work", "Exit condition"], schedule, [1500, 3400, 4460], font_size=8.6)

    add_heading(doc, "12.3 Red/Green Light task allocation", 2)
    add_body(doc, "Use Red Light for work that demonstrates the phone is the development surface: capture, UI, on-device model testing, local storage and Office Kit-mediated debugging. Reserve Green Light for heavier laptop tasks such as model conversion, dataset tooling, automated testing and build packaging. Avoid depending on a laptop-only inference server; it weakens the phone-first story.")

    add_heading(doc, "12.4 Cut order if behind", 2)
    for item in [
        "Remove chatbot UI first; preserve the Promise Ledger.",
        "Use one fixed audio file rather than live ASR if speech is unstable.",
        "Support one KFS and invoice layout rather than universal OCR.",
        "Reduce discrepancy categories from five to three.",
        "Keep the calculator even if post-purchase monitoring is removed.",
        "Never cut source evidence links; they are the product's credibility.",
    ]:
        add_numbered(doc, item, decimal_num)

    add_heading(doc, "13. Testing, demo and presentation strategy", 1)
    add_heading(doc, "13.1 Acceptance tests", 2)
    tests = [
        ("AT-01", "Advertisement price extracted correctly", "₹49,999 linked to exact crop"),
        ("AT-02", "Voice promise recognized", "Zero processing fee linked to timestamp"),
        ("AT-03", "Fee extracted from KFS", "₹2,499 + GST confirmed"),
        ("AT-04", "Contradiction produced", "Both sources visible side by side"),
        ("AT-05", "True cost recalculated", "Unit-tested expected amount"),
        ("AT-06", "Offline golden path", "No network after app launch"),
        ("AT-07", "PII redaction", "Export contains no selected sensitive fields"),
        ("AT-08", "Reset", "Demo can be repeated within 60 seconds"),
    ]
    add_table(doc, ["Test", "Scenario", "Pass condition"], tests, [1200, 3900, 4260], font_size=8.8)

    add_heading(doc, "13.2 Three-to-five-minute demo script", 2)
    demo = [
        ("0:00-0:25", "Hook", "A ₹49,999 phone can become a ₹55,790 commitment while every screen still says no-cost EMI."),
        ("0:25-0:50", "Capture", "Show advertisement and short sales promise on the iQOO phone."),
        ("0:50-1:20", "Paperwork", "Scan or import the invoice, KFS and warranty page."),
        ("1:20-2:10", "Reveal", "Open Promise Ledger: contradicted fee and warranty, missing cancellation term."),
        ("2:10-2:40", "Quantify", "Show deterministic effective-cost breakdown and assumptions."),
        ("2:40-3:10", "Act", "Generate neutral clarification card with exact evidence."),
        ("3:10-3:35", "Scale", "Loans, insurance, telecom, coaching and services use the same evidence graph."),
        ("3:35-3:55", "Close", "Companies remember what you signed. DealTwin remembers what they promised."),
    ]
    add_table(doc, ["Time", "Beat", "What judges see/hear"], demo, [1400, 1700, 6260], font_size=8.7)

    add_heading(doc, "13.3 Backup strategy", 2)
    for item in [
        "Keep the demo data packaged locally with predictable filenames.",
        "Record a short backup video on the iQOO phone after the first stable build.",
        "Prepare a precomputed extraction fallback while keeping comparison and calculation live.",
        "Use airplane mode during final rehearsal to prove offline readiness.",
        "Keep one clean reset button or reinstallable demo profile.",
    ]:
        add_bullet(doc, item, bullet_num)

    add_heading(doc, "13.4 Judge questions and answers", 2)
    qa = [
        ("Is this legal advice?", "No. It organizes user-provided evidence, performs arithmetic and highlights differences. Findings are neutral and source-linked."),
        ("What if the AI is wrong?", "Critical extraction is reviewable; low-confidence cases are not labeled contradictions; every result shows its sources."),
        ("Why must it run on a phone?", "The evidence originates in camera, screenshots, voice and in-person transactions. Local processing also protects sensitive data."),
        ("How is it different from a contract summarizer?", "It compares multiple pre-sale promises with final evidence and calculates the monetary difference."),
        ("How does it scale?", "A shared claim schema supports vertical templates for finance, electronics, insurance, telecom, coaching and services."),
        ("What is the business model?", "Consumer freemium first; later institution compliance, adviser collaboration and consent-based APIs."),
    ]
    add_table(doc, ["Likely question", "Concise answer"], qa, [3100, 6260], font_size=9)

    add_heading(doc, "14. Competitive positioning and defensibility", 1)
    add_body(doc, "DealTwin should not claim that no similar product exists. Current products cover adjacent parts of the workflow: contract explanation, contract version comparison, voice-to-contract conversion and enterprise verbal-versus-written reconciliation. The strategy is to own the consumer transaction lifecycle rather than one document. [S5] [S6] [S7] [S8]")
    add_table(doc, ["Category", "Existing strength", "DealTwin wedge"], [
        ("Contract analyzers", "Summaries, risk flags and clause explanations", "Compare promises outside the contract with final terms"),
        ("Version diff tools", "Compare two document versions", "Cross-modal ad, audio, chat, invoice, KFS and warranty"),
        ("Meeting intelligence", "Transcribe commitments and action items", "Consumer deal evidence and monetary impact"),
        ("Enterprise commitment diff", "Sales-call versus contract workflows", "Phone-first individual user, India transaction templates and local privacy"),
        ("Expense/receipt tools", "Store receipts and categorize spending", "Pre-signing discrepancy detection and clarification"),
    ], [2400, 3300, 3660], font_size=8.7)

    add_heading(doc, "14.1 Defensibility layers", 2)
    for item in [
        "Evidence graph: a reusable structure linking promises, final terms, calculations and fulfilment.",
        "Domain claim schemas: carefully tested taxonomies for EMI, insurance, telecom and other verticals.",
        "Trust design: source anchors, confidence gates and human corrections become part of product quality.",
        "Local-language transaction understanding: handling code-switching, colloquial money terms and sales phrasing.",
        "Institutional integration: future Deal Receipts allow sellers to confirm promises before purchase.",
        "Privacy reputation: local-first operation can become a durable differentiator for financial evidence.",
    ]:
        add_bullet(doc, item, bullet_num)

    add_heading(doc, "14.2 What is not defensible", 2)
    for item in [
        "A generic LLM prompt that summarizes a PDF.",
        "A one-page EMI calculator.",
        "A proprietary-sounding risk score with no evidence.",
        "A basic receipt vault or reminder feature.",
        "Claims of legal certainty or fraud detection without institutional data.",
    ]:
        add_bullet(doc, item, bullet_num)

    add_heading(doc, "15. Business model, go-to-market and metrics", 1)
    add_heading(doc, "15.1 Scaling path", 2)
    add_table(doc, ["Stage", "Wedge", "Distribution"], [
        ("1. Consumer proof", "Electronics + EMI", "App stores, financial education and creator demonstrations"),
        ("2. Adjacent verticals", "Telecom, coaching, home services", "Consumer communities and partner referrals"),
        ("3. Adviser collaboration", "Shareable evidence packs", "Consumer advocates, financial counsellors and support desks"),
        ("4. Institution compliance", "Sales promise auditing", "Retailers, lenders, insurers and service providers"),
        ("5. Deal Receipt network", "Mutually confirmed claims", "APIs and standardized evidence exchange"),
    ], [1900, 3100, 4360], font_size=8.8)

    add_heading(doc, "15.2 Revenue hypotheses", 2)
    for item in [
        "Freemium consumer application: limited active deals free; advanced comparisons and long-term monitoring paid.",
        "One-time high-value deal review: optional premium report for loans or major purchases.",
        "B2B compliance dashboard: organizations audit whether sales representations match final documents.",
        "API / Deal Receipt: institutions issue standardized, confirmed promise records.",
        "Advocate workspace: paid collaboration tools for advisers and consumer-support organizations.",
    ]:
        add_bullet(doc, item, bullet_num)
    add_callout(doc, "Business-model guardrail", "Never monetize by selling user documents or targeting users with financial products based on sensitive evidence. That would undermine the central trust proposition.", fill=RED_LIGHT, accent=RED)

    add_heading(doc, "15.3 Product metrics", 2)
    add_table(doc, ["Metric family", "Measures"], [
        ("Activation", "First complete deal; evidence sources added; first ledger generated"),
        ("Quality", "Field accuracy; user correction rate; false contradiction rate; citation coverage"),
        ("Value", "Clarifications generated; monetary differences found; prevented/changed transactions"),
        ("Trust", "Percentage processed locally; export redaction usage; deletion completion"),
        ("Retention", "Promise-monitoring return rate; active deals; repeated vertical use"),
        ("Growth", "Invites, adviser shares, institution Deal Receipts and vertical adoption"),
    ], [2300, 7060])

    add_heading(doc, "16. Risks, ethics and mitigation", 1)
    risks = [
        ("Incorrect contradiction", "High", "Require two source anchors, confidence thresholds and user confirmation."),
        ("Legal-advice perception", "High", "Use neutral language, clear limitations and referral for high-stakes decisions."),
        ("Recording without consent", "High", "Consent-first design, visible indicator and user-provided uploads."),
        ("Sensitive-data exposure", "High", "Local storage, encryption, PII redaction and minimal logs."),
        ("OCR on difficult documents", "Medium", "Guided capture, crop review and narrow supported templates."),
        ("Model hallucination", "High", "Schema constraints, retrieval from local evidence and deterministic calculations."),
        ("Overbroad MVP", "High", "Freeze one electronics/EMI scenario and a controlled input pack."),
        ("Competitor similarity", "Medium", "Lead with multimodal evidence reconciliation and consumer lifecycle."),
        ("One-time usage", "Medium", "Add post-purchase promise monitoring and multiple deal verticals later."),
        ("Adversarial documents", "Medium", "Treat extracted text as untrusted data; never execute embedded instructions."),
    ]
    add_table(doc, ["Risk", "Severity", "Mitigation"], risks, [2600, 1300, 5460], font_size=8.6)

    add_heading(doc, "16.1 Ethical boundaries", 2)
    for item in [
        "Do not secretly record a person or claim that the application determines legality.",
        "Do not score a salesperson or infer intent, honesty, emotion or protected characteristics.",
        "Do not upload raw documents for analytics without separate, informed consent.",
        "Do not let a language model perform authoritative arithmetic or fabricate missing contract terms.",
        "Do not produce a public accusation from a single user's unverified evidence.",
        "Do make the user's corrections and uncertainty visible in exported material.",
    ]:
        add_bullet(doc, item, bullet_num)

    add_heading(doc, "17. Roadmap and honest viability assessment", 1)
    add_heading(doc, "17.1 Roadmap", 2)
    roadmap = [
        ("City battle", "One EMI purchase; evidence ledger; cost; export", "Prove the core loop"),
        ("Grand Finale", "Multilingual teach-back; improved matching; promise monitoring", "Prove generalization and retention"),
        ("0-3 months", "Beta with controlled electronics and telecom templates", "Measure accuracy and user correction"),
        ("3-6 months", "Loan/insurance pilots with expert-reviewed schemas", "Establish high-stakes trust"),
        ("6-12 months", "Adviser workspace and institution Deal Receipts", "Build distribution and defensibility"),
        ("12+ months", "Multi-vertical evidence network and optional APIs", "Scale beyond a consumer utility"),
    ]
    add_table(doc, ["Horizon", "Product", "Strategic objective"], roadmap, [1800, 4200, 3360], font_size=8.8)

    add_heading(doc, "17.2 Honest assessment", 2)
    add_body(doc, "DealTwin is a credible finalist idea, not an automatic winner. Its broad market story is stronger than its raw technical novelty. The technical and judging advantage appears only when the application produces a reliable, source-linked comparison on the phone and calculates a consequence the user can act on.")
    add_table(doc, ["Dimension", "Assessment"], [
        ("Real-world usefulness", "High for high-value, confusing or financed transactions"),
        ("Scalability", "High across vertical templates; distribution remains the harder problem"),
        ("Novelty", "Moderate-high in consumer multimodal reconciliation; low if reduced to document summary"),
        ("Phone necessity", "High when capture, audio and local privacy are central"),
        ("19-hour feasibility", "Moderate; feasible only with fixed inputs and controlled schemas"),
        ("Duplicate-team risk", "Low for the complete concept; higher for generic fine-print scanners"),
        ("Winning potential", "Top 5 possible with excellent execution; top 12-20 on concept alone"),
    ], [2600, 6760])
    add_callout(doc, "Go / no-go test", "Continue with DealTwin if the team can demonstrate one undeniable promise-to-paperwork contradiction with exact evidence by the halfway point. If not, reduce scope immediately rather than adding features.", fill=GOLD_LIGHT, accent=GOLD)

    add_heading(doc, "Appendix A. Prioritized backlog", 1)
    backlog = [
        ("P0", "Evidence import", "Camera, screenshot, PDF and one short audio sample"),
        ("P0", "Claim schema", "Price, fee, EMI, warranty and cancellation"),
        ("P0", "Promise Ledger", "Five statuses with exact source anchors"),
        ("P0", "True cost", "Tested finance breakdown"),
        ("P0", "Action card", "Neutral message + redacted evidence"),
        ("P1", "Teach-back", "Three comprehension questions"),
        ("P1", "Hinglish", "Input/output for controlled phrases"),
        ("P1", "Monitoring", "Cashback and warranty reminders"),
        ("P2", "Seller confirmation", "Promise receipt link"),
        ("P2", "Vertical templates", "Telecom, coaching, insurance and services"),
    ]
    add_table(doc, ["Priority", "Epic", "Definition"], backlog, [1300, 2300, 5760], font_size=9)

    add_heading(doc, "Appendix B. Sample clarification output", 1)
    add_callout(doc, "Draft clarification", "The sales material and recorded explanation state that the processing fee is zero. The Key Facts Statement currently lists a processing fee of ₹2,499 plus GST. The advertisement also shows a two-year warranty, while the supplied warranty page states one year. Please confirm the final fee, effective total cost and warranty duration in writing before I proceed.", fill=LIGHT, accent=BLUE)
    add_body(doc, "Evidence attached: advertisement crop; consented recording at 00:18; KFS page 2; warranty page 1. Personally identifying information is redacted by default.")

    add_heading(doc, "Appendix C. Suggested pitch abstract", 1)
    add_body(doc, "Every high-value purchase has two versions: the deal we were promised and the deal written in the paperwork. DealTwin is a local-first mobile intelligence layer that connects those versions. It captures advertisements, consented sales conversations, invoices, loan Key Facts Statements and warranties; builds a source-linked Promise Ledger; detects missing or changed commitments; and calculates the true financial impact. Unlike a contract summarizer, every finding points to the original evidence and leads to a neutral action. The city-battle prototype focuses on one common transaction - a phone sold using no-cost EMI - and demonstrates how a seemingly small fee and warranty mismatch can materially change the deal.")

    add_heading(doc, "Appendix D. Glossary", 1)
    glossary = [
        ("ASR", "Automatic speech recognition."),
        ("Claim", "A normalized proposition extracted from evidence, such as a fee or warranty duration."),
        ("Evidence anchor", "The exact quote, image region, page or timestamp supporting a claim."),
        ("Evidence graph", "Relationships connecting deal sources, claims, comparisons, calculations and actions."),
        ("KFS", "Key Facts Statement for a loan or advance."),
        ("Local-first", "Core processing and storage occur on the user's device by default."),
        ("Promise Ledger", "The main comparison view showing each promise and final status."),
        ("Teach-back", "A comprehension method in which the user explains key terms in their own words."),
        ("True cost", "The effective transaction cost after fees, taxes, interest effects and foregone discounts."),
    ]
    add_table(doc, ["Term", "Definition"], glossary, [2300, 7060])

    add_heading(doc, "Appendix E. Sources and market references", 1)
    sources = [
        ("S1", "Participant-supplied iQOO Hackathon screenshots: format, device rules, tracks, Office Kit and scoring rubric.", None),
        ("S2", "Press Information Bureau - CCPA dark-pattern guidance and 13 identified categories.", "https://www.pib.gov.in/PressReleasePage.aspx?PRID=1988681&lang=2&reg=48"),
        ("S3", "Reserve Bank of India Annual Report - Key Facts Statement requires key information including all-in cost in a simple format.", "https://www.rbi.org.in/scripts/AnnualReportPublications.aspx?Id=1436"),
        ("S4", "Department of Consumer Affairs annual report - misleading-advertisement disclaimer principles.", "https://consumeraffairs.gov.in/public/upload/files/1682683889_AR_2022-23_1733218041.pdf"),
        ("S5", "Sentra - enterprise verbal commitments versus written contract diff use case.", "https://www.sentra.app/use-cases/finance-verbal-vs-written-commitment-diff"),
        ("S6", "LegalHai - Indian-language AI contract understanding product.", "https://legalhai.in/"),
        ("S7", "Pact - consumer AI contract review and version comparison.", "https://www.usepact.org/"),
        ("S8", "Voxdeed - voice-to-contract generation and management.", "https://www.voxdeed.com/"),
        ("S9", "ContraSnap - consumer contract intelligence and alerts.", "https://contrasnap.com/"),
    ]
    for sid, description, url in sources:
        p = doc.add_paragraph()
        apply_paragraph_spacing(p, after=6, line=1.10)
        set_run_font(p.add_run(f"[{sid}] "), size=9.5, color=NAVY, bold=True)
        set_run_font(p.add_run(description + (" " if url else "")), size=9.5, color=INK)
        if url:
            add_hyperlink(p, "Open source", url)

    add_heading(doc, "Appendix F. Final decision checklist", 1)
    checklist = [
        "The core comparison is functional on the iQOO phone without a laptop inference server.",
        "The demo uses a controlled but realistic transaction and clearly labels synthetic data.",
        "Every contradiction has two visible source anchors.",
        "All financial calculations have unit tests and visible assumptions.",
        "Low-confidence extraction is reviewable and never presented as certainty.",
        "The team has logged deliberate phone and Office Kit usage throughout the build.",
        "The demonstration completes in under four minutes with a backup recording.",
        "The pitch explains the difference from contract summarizers in one sentence.",
        "The team presents a credible scaling path without claiming global uniqueness.",
        "Recording consent, privacy and legal limitations are stated clearly.",
    ]
    for item in checklist:
        add_bullet(doc, "☐ " + item, bullet_num)

    # Footer/header fields for any new sections and metadata cleanup.
    doc.core_properties.title = "DealTwin Super-Detailed Project Report"
    doc.core_properties.subject = "iQOO Hackathon 2026 project, technical and execution dossier"
    doc.core_properties.author = "DealTwin Project Team"
    doc.core_properties.keywords = "DealTwin, iQOO Hackathon, FinTech, Commerce, on-device AI, consumer evidence"
    doc.core_properties.comments = "Prepared as a strategic working document."

    for table in doc.tables:
        for row in table.rows:
            set_keep_together(row)

    doc.save(OUTPUT)
    print(OUTPUT)


if __name__ == "__main__":
    build_report()
