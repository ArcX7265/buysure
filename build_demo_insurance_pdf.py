from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    KeepTogether,
)

OUT = Path(r"C:\Users\ADARSH\Documents\ChatGPT\IQOO Hackathon\output\pdf\dealtwin_demo_insurance_addendum.pdf")

NAVY = colors.HexColor("#0D2946")
CYAN = colors.HexColor("#00AECA")
MINT = colors.HexColor("#57D7A0")
INK = colors.HexColor("#14283B")
MUTED = colors.HexColor("#607080")
LINE = colors.HexColor("#DCE6E8")
PALE = colors.HexColor("#F3F8F9")
AMBER = colors.HexColor("#E4A53E")
RED = colors.HexColor("#D96060")


def p(text, style):
    return Paragraph(text, style)


def info_table(rows):
    table = Table(rows, colWidths=[49 * mm, 111 * mm], hAlign="LEFT")
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#EEF5F6")),
        ("TEXTCOLOR", (0, 0), (0, -1), NAVY),
        ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
        ("FONTNAME", (1, 0), (1, -1), "Helvetica"),
        ("TEXTCOLOR", (1, 0), (1, -1), INK),
        ("GRID", (0, 0), (-1, -1), 0.45, LINE),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]))
    return table


def main():
    OUT.parent.mkdir(parents=True, exist_ok=True)
    doc = SimpleDocTemplate(
        str(OUT),
        pagesize=A4,
        rightMargin=18 * mm,
        leftMargin=18 * mm,
        topMargin=12 * mm,
        bottomMargin=13 * mm,
        title="DealTwin Demo - Device Protection & Insurance Addendum",
        author="Team ANKOR",
    )
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(name="Kicker", parent=styles["Normal"], fontName="Helvetica-Bold", fontSize=8, leading=11, textColor=CYAN, spaceAfter=4, tracking=1.1))
    styles.add(ParagraphStyle(name="TitleDT", parent=styles["Title"], fontName="Helvetica-Bold", fontSize=22, leading=25, textColor=NAVY, spaceAfter=4))
    styles.add(ParagraphStyle(name="Sub", parent=styles["Normal"], fontName="Helvetica", fontSize=9.5, leading=13, textColor=MUTED, spaceAfter=9))
    styles.add(ParagraphStyle(name="Section", parent=styles["Heading2"], fontName="Helvetica-Bold", fontSize=11.5, leading=14, textColor=NAVY, spaceBefore=9, spaceAfter=5))
    styles.add(ParagraphStyle(name="BodyDT", parent=styles["BodyText"], fontName="Helvetica", fontSize=9.1, leading=12.5, textColor=INK, spaceAfter=5))
    styles.add(ParagraphStyle(name="Small", parent=styles["Normal"], fontName="Helvetica", fontSize=8.1, leading=11, textColor=MUTED))
    styles.add(ParagraphStyle(name="Alert", parent=styles["BodyText"], fontName="Helvetica-Bold", fontSize=10, leading=14, textColor=RED))
    styles.add(ParagraphStyle(name="White", parent=styles["BodyText"], fontName="Helvetica-Bold", fontSize=10, leading=14, textColor=colors.white))

    story = []
    brand = Table([[p("DEALTWIN DEMO DOCUMENT", styles["Kicker"]), p("DEVICE PROTECTION / INSURANCE", styles["Kicker"]) ]], colWidths=[80 * mm, 80 * mm])
    brand.setStyle(TableStyle([("ALIGN", (1, 0), (1, 0), "RIGHT"), ("VALIGN", (0, 0), (-1, -1), "MIDDLE")]))
    story.append(brand)
    story.append(Spacer(1, 2 * mm))
    story.append(p("Device Protection & Insurance Addendum", styles["TitleDT"]))
    story.append(p("Reference document for a sample electronics purchase. This document is intentionally structured for a DealTwin evidence-verification demo.", styles["Sub"]))

    summary = Table([[p("PURCHASE REFERENCE", styles["Kicker"]), p("INSURANCE STATUS", styles["Kicker"])], [p("ZenBook 14 / Demo Buyer / RD-1208", styles["BodyDT"]), p("Optional protection is not included in this purchase.", styles["Alert"]) ]], colWidths=[80 * mm, 80 * mm])
    summary.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), PALE),
        ("BACKGROUND", (1, 1), (1, 1), colors.HexColor("#FFF2F2")),
        ("BOX", (0, 0), (-1, -1), 0.6, LINE),
        ("INNERGRID", (0, 0), (-1, -1), 0.45, LINE),
        ("LEFTPADDING", (0, 0), (-1, -1), 10),
        ("RIGHTPADDING", (0, 0), (-1, -1), 10),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ]))
    story.append(summary)
    story.append(Spacer(1, 3 * mm))

    story.append(p("Purchase and policy record", styles["Section"]))
    story.append(info_table([
        ["Retailer", "Reliance Digital - Demo Store"],
        ["Product", "ZenBook 14, 16 GB / 512 GB"],
        ["Purchase reference", "RD-1208-ANKOR"],
        ["Policy reference", "Not issued - no policy has been attached to this purchase"],
        ["Protection plan", "Optional Theft Protection Add-on"],
        ["Add-on price", "Rs. 1,999 including taxes (not charged in this sample invoice)"],
    ]))

    story.append(p("Coverage position", styles["Section"]))
    story.append(p("The retailer may offer device protection or theft cover at checkout. This addendum does not confirm enrolment in any insurance policy and is not proof of complimentary coverage.", styles["BodyDT"]))

    warning = Table([[p("IMPORTANT FOR VERIFICATION", styles["Kicker"])], [p("No complimentary theft insurance benefit, policy number, certificate of insurance, insurer name, coverage period, or claim contact has been recorded for this purchase reference.", styles["White"]) ]], colWidths=[160 * mm])
    warning.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (0, 0), colors.HexColor("#FFF6E7")),
        ("BACKGROUND", (0, 1), (0, 1), NAVY),
        ("BOX", (0, 0), (-1, -1), 0.6, AMBER),
        ("LEFTPADDING", (0, 0), (-1, -1), 11),
        ("RIGHTPADDING", (0, 0), (-1, -1), 11),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]))
    story.append(Spacer(1, 2 * mm))
    story.append(warning)

    story.append(p("What would be needed to confirm insurance", styles["Section"]))
    confirmation_rows = [
        [p("Evidence required", styles["Kicker"]), p("Status in this document", styles["Kicker"])],
        [p("Policy or certificate number", styles["BodyDT"]), p("Not present", styles["Alert"])],
        [p("Insurer and administrator", styles["BodyDT"]), p("Not present", styles["Alert"])],
        [p("Coverage start and end dates", styles["BodyDT"]), p("Not present", styles["Alert"])],
        [p("Theft cover terms and exclusions", styles["BodyDT"]), p("Not present", styles["Alert"])],
        [p("Premium paid or complimentary benefit reference", styles["BodyDT"]), p("Not present", styles["Alert"])],
    ]
    confirmation = Table(confirmation_rows, colWidths=[99 * mm, 61 * mm])
    confirmation.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), PALE),
        ("GRID", (0, 0), (-1, -1), 0.45, LINE),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]))
    story.append(confirmation)

    story.append(Spacer(1, 5 * mm))
    footer = Table([[p("DEMO NOTE: This is a fictional document created by Team ANKOR for the DealTwin prototype. It is not an insurance policy or financial advice.", styles["Small"]) ]], colWidths=[160 * mm])
    footer.setStyle(TableStyle([("LINEABOVE", (0, 0), (-1, -1), 0.55, LINE), ("TOPPADDING", (0, 0), (-1, -1), 8)]))
    story.append(footer)

    def draw_page(canvas, document):
        canvas.saveState()
        canvas.setStrokeColor(LINE)
        canvas.setLineWidth(0.5)
        canvas.line(18 * mm, 12 * mm, 192 * mm, 12 * mm)
        canvas.setFont("Helvetica", 7.5)
        canvas.setFillColor(MUTED)
        canvas.drawString(18 * mm, 8 * mm, "DealTwin demo insurance addendum")
        canvas.drawRightString(192 * mm, 8 * mm, f"Page {document.page}")
        canvas.restoreState()

    doc.build(story, onFirstPage=draw_page, onLaterPages=draw_page)


if __name__ == "__main__":
    main()
