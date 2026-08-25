from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    KeepTogether,
    PageBreak,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)


ROOT = Path(__file__).resolve().parent
OUTPUT = ROOT / "output" / "pdf" / "dealtwin_demo_video_script.pdf"

NAVY = colors.HexColor("#0D2946")
INK = colors.HexColor("#0B1F35")
CYAN = colors.HexColor("#00AECA")
MINT = colors.HexColor("#57D7A0")
LIME = colors.HexColor("#C9F36B")
PAPER = colors.HexColor("#F4F8F8")
MUTED = colors.HexColor("#5F7382")
LINE = colors.HexColor("#D9E5E7")
WARNING = colors.HexColor("#E6A645")
RED = colors.HexColor("#D85F63")
WHITE = colors.white


def register_fonts():
    regular = Path("C:/Windows/Fonts/segoeui.ttf")
    semibold = Path("C:/Windows/Fonts/seguisb.ttf")
    bold = Path("C:/Windows/Fonts/segoeuib.ttf")
    if regular.exists() and semibold.exists() and bold.exists():
        pdfmetrics.registerFont(TTFont("DealRegular", str(regular)))
        pdfmetrics.registerFont(TTFont("DealSemibold", str(semibold)))
        pdfmetrics.registerFont(TTFont("DealBold", str(bold)))
        return "DealRegular", "DealSemibold", "DealBold"
    return "Helvetica", "Helvetica-Bold", "Helvetica-Bold"


REGULAR, SEMIBOLD, BOLD = register_fonts()
styles = getSampleStyleSheet()

cover_kicker = ParagraphStyle(
    "CoverKicker", fontName=BOLD, fontSize=9, leading=12, textColor=LIME,
    tracking=1.8, spaceAfter=10,
)
cover_title = ParagraphStyle(
    "CoverTitle", fontName=BOLD, fontSize=34, leading=37, textColor=WHITE,
    spaceAfter=15,
)
cover_subtitle = ParagraphStyle(
    "CoverSubtitle", fontName=REGULAR, fontSize=13, leading=18, textColor=colors.HexColor("#C8D8E3"),
    spaceAfter=24,
)
cover_meta = ParagraphStyle(
    "CoverMeta", fontName=SEMIBOLD, fontSize=9, leading=14, textColor=WHITE,
)
h1 = ParagraphStyle(
    "H1", fontName=BOLD, fontSize=20, leading=24, textColor=INK,
    spaceBefore=2, spaceAfter=10,
)
h2 = ParagraphStyle(
    "H2", fontName=BOLD, fontSize=12.5, leading=16, textColor=NAVY,
    spaceBefore=7, spaceAfter=6,
)
body = ParagraphStyle(
    "Body", fontName=REGULAR, fontSize=9.2, leading=13.2, textColor=INK,
    spaceAfter=6,
)
body_small = ParagraphStyle(
    "BodySmall", fontName=REGULAR, fontSize=8.1, leading=11.4, textColor=INK,
)
muted = ParagraphStyle(
    "Muted", fontName=REGULAR, fontSize=8, leading=11, textColor=MUTED,
)
label = ParagraphStyle(
    "Label", fontName=BOLD, fontSize=7.2, leading=9, textColor=CYAN,
    tracking=1.1, spaceAfter=3,
)
scene_title = ParagraphStyle(
    "SceneTitle", fontName=BOLD, fontSize=11, leading=14, textColor=NAVY,
    spaceAfter=4,
)
quote = ParagraphStyle(
    "Quote", fontName=REGULAR, fontSize=9, leading=13.2, textColor=INK,
    leftIndent=8, rightIndent=6,
)
table_head = ParagraphStyle(
    "TableHead", fontName=BOLD, fontSize=7.4, leading=9, textColor=WHITE,
)
table_text = ParagraphStyle(
    "TableText", fontName=REGULAR, fontSize=7.4, leading=10, textColor=INK,
)
table_time = ParagraphStyle(
    "TableTime", fontName=BOLD, fontSize=7.4, leading=10, textColor=CYAN,
)
center_small = ParagraphStyle(
    "CenterSmall", fontName=SEMIBOLD, fontSize=8, leading=11, textColor=NAVY, alignment=TA_CENTER,
)


def cover_page(canvas, doc):
    w, h = A4
    canvas.saveState()
    canvas.setFillColor(NAVY)
    canvas.rect(0, 0, w, h, fill=1, stroke=0)
    canvas.setFillColor(colors.HexColor("#123858"))
    canvas.circle(w - 42 * mm, h - 34 * mm, 54 * mm, fill=1, stroke=0)
    canvas.setFillColor(colors.HexColor("#164663"))
    canvas.circle(w - 12 * mm, 19 * mm, 46 * mm, fill=1, stroke=0)
    canvas.setFillColor(CYAN)
    canvas.roundRect(22 * mm, h - 32 * mm, 15 * mm, 15 * mm, 4 * mm, fill=1, stroke=0)
    canvas.setFillColor(NAVY)
    canvas.setFont(BOLD, 15)
    canvas.drawCentredString(29.5 * mm, h - 26.8 * mm, "D")
    canvas.setFillColor(WHITE)
    canvas.setFont(BOLD, 13)
    canvas.drawString(41 * mm, h - 25.7 * mm, "DealTwin")
    canvas.setFont(REGULAR, 7.5)
    canvas.setFillColor(colors.HexColor("#AFC3D0"))
    canvas.drawString(41 * mm, h - 30 * mm, "PROMISE-TO-PROOF VERIFICATION")
    canvas.setFillColor(LIME)
    canvas.rect(22 * mm, 20 * mm, 55 * mm, 2 * mm, fill=1, stroke=0)
    canvas.restoreState()


def standard_page(canvas, doc):
    w, h = A4
    canvas.saveState()
    canvas.setFillColor(PAPER)
    canvas.rect(0, 0, w, h, fill=1, stroke=0)
    canvas.setFillColor(NAVY)
    canvas.rect(0, h - 10 * mm, w, 10 * mm, fill=1, stroke=0)
    canvas.setFillColor(LIME)
    canvas.rect(0, h - 10 * mm, 48 * mm, 1.3 * mm, fill=1, stroke=0)
    canvas.setFont(BOLD, 8)
    canvas.setFillColor(WHITE)
    canvas.drawString(15 * mm, h - 6.3 * mm, "DEALTWIN")
    canvas.setFont(REGULAR, 7)
    canvas.setFillColor(colors.HexColor("#BCD0DB"))
    canvas.drawRightString(w - 15 * mm, h - 6.3 * mm, "DEMO VIDEO RECORDING GUIDE")
    canvas.setStrokeColor(LINE)
    canvas.line(15 * mm, 13 * mm, w - 15 * mm, 13 * mm)
    canvas.setFont(REGULAR, 7)
    canvas.setFillColor(MUTED)
    canvas.drawString(15 * mm, 8.5 * mm, "Team ANKOR | iQOO Hackathon")
    canvas.drawRightString(w - 15 * mm, 8.5 * mm, f"Page {doc.page}")
    canvas.restoreState()


def callout(title, text, accent=CYAN, background=colors.white):
    content = Paragraph(f"<font color='{accent.hexval()}'><b>{title}</b></font><br/>{text}", body_small)
    table = Table([[content]], colWidths=[166 * mm])
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), background),
        ("BOX", (0, 0), (-1, -1), 0.7, LINE),
        ("LINEBEFORE", (0, 0), (0, -1), 4, accent),
        ("LEFTPADDING", (0, 0), (-1, -1), 12),
        ("RIGHTPADDING", (0, 0), (-1, -1), 10),
        ("TOPPADDING", (0, 0), (-1, -1), 9),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 9),
    ]))
    return table


def bullet_list(items):
    rows = []
    for item in items:
        rows.append([
            Paragraph("+", ParagraphStyle("Plus", fontName=BOLD, fontSize=10, textColor=CYAN, alignment=TA_CENTER)),
            Paragraph(item, body_small),
        ])
    table = Table(rows, colWidths=[7 * mm, 159 * mm])
    table.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 4),
        ("TOPPADDING", (0, 0), (-1, -1), 2),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ]))
    return table


def scene_card(number, timestamp, title, screen, narration, delivery):
    header = Table([
        [Paragraph(f"SCENE {number}", label), Paragraph(timestamp, table_time), Paragraph(title, scene_title)]
    ], colWidths=[23 * mm, 24 * mm, 119 * mm])
    header.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 4),
        ("TOPPADDING", (0, 0), (-1, -1), 0),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
    ]))
    details = Table([
        [Paragraph("ON SCREEN", label), Paragraph(screen, body_small)],
        [Paragraph("VOICE-OVER", label), Paragraph(f"\"{narration}\"", quote)],
        [Paragraph("DELIVERY", label), Paragraph(delivery, muted)],
    ], colWidths=[28 * mm, 138 * mm])
    details.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.white),
        ("BOX", (0, 0), (-1, -1), 0.65, LINE),
        ("INNERGRID", (0, 0), (-1, -1), 0.35, colors.HexColor("#E8EFF0")),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
    ]))
    return KeepTogether([header, details, Spacer(1, 7)])


def build_pdf():
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    doc = BaseDocTemplate(
        str(OUTPUT), pagesize=A4,
        leftMargin=22 * mm, rightMargin=22 * mm,
        topMargin=19 * mm, bottomMargin=18 * mm,
        title="DealTwin Demo Video Script",
        author="Team ANKOR",
        subject="iQOO Hackathon prototype demonstration and recording guide",
    )
    cover_frame = Frame(22 * mm, 20 * mm, 166 * mm, 238 * mm, id="cover", showBoundary=0)
    body_frame = Frame(22 * mm, 17 * mm, 166 * mm, 260 * mm, id="body", showBoundary=0)
    doc.addPageTemplates([
        PageTemplate(id="Cover", frames=[cover_frame], onPage=cover_page, autoNextPageTemplate="Body"),
        PageTemplate(id="Body", frames=[body_frame], onPage=standard_page),
    ])

    story = []
    story += [
        Spacer(1, 57 * mm),
        Paragraph("TEAM ANKOR | IQOO HACKATHON", cover_kicker),
        Paragraph("DealTwin Demo<br/>Video Script", cover_title),
        Paragraph("A production-ready recording guide for demonstrating pre-purchase risk detection, real PDF ingestion, and promise-to-proof verification.", cover_subtitle),
        Table([
            [Paragraph("TARGET LENGTH", cover_meta), Paragraph("2:45-3:10", cover_meta)],
            [Paragraph("WORKING FEATURE", cover_meta), Paragraph("Local PDF extraction + rule-based verification", cover_meta)],
            [Paragraph("PROTOTYPE URL", cover_meta), Paragraph("dealtwin-ankor.teamankor7.chatgpt.site", cover_meta)],
        ], colWidths=[42 * mm, 91 * mm], style=TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#173C59")),
            ("BOX", (0, 0), (-1, -1), 0.7, colors.HexColor("#31566F")),
            ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#31566F")),
            ("LEFTPADDING", (0, 0), (-1, -1), 9),
            ("RIGHTPADDING", (0, 0), (-1, -1), 9),
            ("TOPPADDING", (0, 0), (-1, -1), 8),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ])),
        Spacer(1, 27 * mm),
        Paragraph("DON'T TRUST THE DEAL. VERIFY IT.", ParagraphStyle("Tag", fontName=BOLD, fontSize=10, leading=12, textColor=LIME, tracking=1.2)),
        Paragraph("Prepared for prototype submission and reviewer walkthrough", ParagraphStyle("CoverFoot", fontName=REGULAR, fontSize=8.5, leading=12, textColor=colors.HexColor("#AFC3D0"))),
        PageBreak(),
    ]

    story += [
        Paragraph("1. Recording Strategy", h1),
        Paragraph("The video should tell one consumer story, demonstrate one technical feature for real, and close with a credible path to scale. The strongest narrative is: <b>promise - evidence - contradiction - action</b>.", body),
        callout("DEMO PRINCIPLE", "Use prepared seller promises for a clean story, but upload the actual insurance PDF during the recording. This proves that document ingestion and verification are working rather than being a static mock-up.", CYAN, colors.HexColor("#ECF9FB")),
        Spacer(1, 8),
        Paragraph("What the reviewer must understand", h2),
        bullet_list([
            "DealTwin intervenes both <b>before purchase</b> and <b>after purchase</b>.",
            "The user is protected from vague marketing language before money changes hands.",
            "The final PDF is parsed locally, then checked for missing policy fields and contradictions.",
            "Every verdict remains linked to the exact source excerpt.",
            "Unknown claims are marked <b>unverified</b>; the product does not fabricate conclusions.",
            "The architecture can expand across electronics, insurance, lending, e-commerce, and subscriptions.",
        ]),
        Paragraph("Honest implementation boundary", h2),
        Table([
            [Paragraph("WORKING NOW", table_head), Paragraph("PROTOTYPE ADAPTERS", table_head), Paragraph("FUTURE EXTENSIONS", table_head)],
            [Paragraph("Text-based PDF upload, browser-local extraction, policy-field checks, contradiction rules, risk report, and source-linked evidence.", table_text),
             Paragraph("Prepared seller-promise sample, camera capture placeholder, and consented-audio placeholder.", table_text),
             Paragraph("On-device OCR, on-device ASR, open-model claim normalization, and user-triggered official-source verification.", table_text)],
        ], colWidths=[55.3 * mm] * 3, style=TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), NAVY),
            ("BACKGROUND", (0, 1), (-1, -1), colors.white),
            ("BOX", (0, 0), (-1, -1), 0.6, LINE),
            ("INNERGRID", (0, 0), (-1, -1), 0.4, LINE),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("LEFTPADDING", (0, 0), (-1, -1), 7),
            ("RIGHTPADDING", (0, 0), (-1, -1), 7),
            ("TOPPADDING", (0, 0), (-1, -1), 7),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
        ])),
        Spacer(1, 8),
        callout("TARGET DURATION", "Aim for 2 minutes 50 seconds. Leave 10-15 seconds of buffer for loading, cursor movement, and natural pauses. Avoid exceeding 3 minutes unless the submission rules explicitly allow it.", WARNING, colors.HexColor("#FFF8EA")),
        PageBreak(),
    ]

    timeline = [
        [Paragraph("TIME", table_head), Paragraph("SCREEN", table_head), Paragraph("PURPOSE", table_head)],
        [Paragraph("0:00-0:15", table_time), Paragraph("DealTwin home", table_text), Paragraph("Establish the consumer problem and the product in one sentence.", table_text)],
        [Paragraph("0:15-0:30", table_time), Paragraph("Two intervention modes", table_text), Paragraph("Explain before-purchase prevention and after-purchase verification.", table_text)],
        [Paragraph("0:30-1:15", table_time), Paragraph("Before Purchase sample", table_text), Paragraph("Show missing policy essentials, risk score, and seller questions.", table_text)],
        [Paragraph("1:15-1:45", table_time), Paragraph("After Purchase promise ledger", table_text), Paragraph("Show promises becoming normalized, source-bound claims.", table_text)],
        [Paragraph("1:45-2:10", table_time), Paragraph("Upload the real demo PDF", table_text), Paragraph("Prove genuine local PDF ingestion and contradiction detection.", table_text)],
        [Paragraph("2:10-2:35", table_time), Paragraph("Verdict + View Source", table_text), Paragraph("Show missing insurance, unverified claims, and exact evidence.", table_text)],
        [Paragraph("2:35-2:55", table_time), Paragraph("Architecture statement", table_text), Paragraph("Explain current pipeline and phone-first extensions.", table_text)],
        [Paragraph("2:55-3:10", table_time), Paragraph("Home / closing frame", table_text), Paragraph("State scalability, value proposition, and final tagline.", table_text)],
    ]
    story += [
        Paragraph("2. Three-Minute Run of Show", h1),
        Paragraph("This timing keeps the product demonstration dominant. The architecture and scalability claims support the evidence rather than interrupting it.", body),
        Table(timeline, colWidths=[24 * mm, 52 * mm, 90 * mm], repeatRows=1, style=TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), NAVY),
            ("BACKGROUND", (0, 1), (-1, -1), colors.white),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#F2F7F8")]),
            ("BOX", (0, 0), (-1, -1), 0.7, LINE),
            ("INNERGRID", (0, 0), (-1, -1), 0.35, LINE),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("LEFTPADDING", (0, 0), (-1, -1), 7),
            ("RIGHTPADDING", (0, 0), (-1, -1), 7),
            ("TOPPADDING", (0, 0), (-1, -1), 8),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ])),
        Spacer(1, 10),
        Paragraph("Files and screens to prepare", h2),
        bullet_list([
            "Open the private DealTwin deployment and refresh it before recording.",
            "Keep <b>dealtwin_demo_insurance_addendum.pdf</b> in an easy-to-select folder.",
            "Close unrelated tabs, messages, notifications, and personal windows.",
            "Set browser zoom to 100-110 percent and use a 16:9 screen-recording canvas.",
            "Complete one silent rehearsal so all buttons and transitions are familiar.",
        ]),
        callout("IMPORTANT", "During the recording, select Import final insurance PDF and upload the file. Do not use the bypass button. The actual upload is the clearest proof that the prototype is interactive.", RED, colors.HexColor("#FFF1F1")),
        PageBreak(),
    ]

    story += [
        Paragraph("3. Full Script - Problem and Prevention", h1),
        scene_card("01", "0:00-0:15", "The hook", "Begin on the DealTwin home screen. Keep the pointer away from the main text.", "Online and offline purchases often include attractive promises - free insurance, no-cost EMI, or an extended warranty - but the final documents may tell a different story. DealTwin helps buyers verify those promises before and after purchase.", "Speak slowly. Stress 'promises' and 'final documents'. Pause for half a second before saying the product name."),
        scene_card("02", "0:15-0:30", "Two intervention points", "Point to Check an offer, then Verify what arrived. Do not click immediately.", "DealTwin works at two intervention points. Before purchasing, it identifies risky or incomplete offers. After purchasing, it compares what was promised with what the customer actually received.", "Use a clear contrast in tone between 'before' and 'after'."),
        scene_card("03", "0:30-0:50", "Load the offer", "Click Check an offer. Click Load judge-ready sample and wait for the risk-analysis screen.", "First, consider an offer promising complimentary theft insurance. DealTwin converts the offer into a structured claim and checks whether the benefit contains the minimum information required to be useful.", "Allow the transition to finish before describing the result."),
        scene_card("04", "0:50-1:15", "Explain the warning", "Move the cursor over the missing insurer, policy number, dates, exclusions, and claims-process rows. Briefly show the generated questions.", "The offer mentions insurance, but provides no insurer, policy number, coverage dates, exclusions, or claims process. DealTwin warns the buyer before payment and generates precise questions to ask the seller. This changes the interaction from trusting marketing language to requesting verifiable terms.", "Do not read every field mechanically. Let the visible list support the narration."),
        callout("MESSAGE TO LAND", "DealTwin is not merely summarizing a document. It is evaluating whether the promise is specific enough to be useful and claimable.", CYAN, colors.HexColor("#ECF9FB")),
        PageBreak(),
    ]

    story += [
        Paragraph("4. Full Script - Proof and Verification", h1),
        scene_card("05", "1:15-1:30", "Start after-purchase verification", "Return home. Click Verify what arrived, then Load judge-ready sample.", "Now let us verify what happens after the purchase. The prepared case contains three seller promises: no-cost EMI, complimentary theft insurance, and a two-year warranty.", "Keep this transition brisk; the central technical proof comes next."),
        scene_card("06", "1:30-1:45", "Confirm the promise ledger", "Show the three normalized claims. Click Confirm promise ledger.", "Each promise is normalized into a source-bound ledger instead of being stored as an unstructured screenshot or conversation.", "Point briefly to the normalized values and source labels."),
        scene_card("07", "1:45-2:10", "Upload and process the PDF", "Click Import final insurance PDF. Select dealtwin_demo_insurance_addendum.pdf. Wait until the file is marked parsed locally, then click Compare promise vs proof.", "We now upload the insurance document the customer actually received. This PDF is genuinely processed inside the browser. Its text is extracted locally and checked using deterministic policy rules - without automatically searching the internet or uploading the document to a cloud service.", "Pause after 'processed inside the browser'. Do not speak over the file picker."),
        scene_card("08", "2:10-2:30", "Explain the verdict", "Keep the result visible. Point to the missing insurance verdict, then to the unverified EMI and warranty claims.", "DealTwin detects that theft protection is described as optional and that no policy was issued. It marks the promised free insurance as missing. EMI and warranty remain unverified because their supporting documents have not been uploaded - DealTwin does not invent conclusions from missing evidence.", "Stress 'unverified'. This demonstrates trustworthy system behavior."),
        scene_card("09", "2:30-2:42", "Open the source", "Click View source and pause on the exact extracted excerpt.", "Every verdict remains linked to the exact extracted evidence, making the result understandable, auditable, and useful during a seller conversation or complaint.", "Let the evidence stay visible for at least three seconds."),
        PageBreak(),
    ]

    story += [
        Paragraph("5. Full Script - Architecture and Closing", h1),
        scene_card("10", "2:42-2:58", "Technical credibility", "Return to the result overview or keep the source-linked verdict visible.", "The current prototype implements real PDF extraction and rule-based verification. Camera OCR, consented audio capture, and on-device open-model extraction extend the same pipeline on the iQOO phone.", "Say 'extend' rather than implying those adapters are already complete."),
        scene_card("11", "2:58-3:10", "Scale and close", "Return to the home screen so the product name and two modes are visible.", "DealTwin can scale across electronics, insurance, lending, e-commerce, and subscription purchases - anywhere the promise made before payment can differ from the proof delivered afterwards. DealTwin: don't trust the deal. Verify it. Thank you.", "End cleanly. Hold the final screen for two seconds after 'Thank you'."),
        Paragraph("Technical story in one diagram", h2),
        Table([
            [Paragraph("1. CAPTURE", center_small), Paragraph("2. EXTRACT", center_small), Paragraph("3. NORMALIZE", center_small), Paragraph("4. RECONCILE", center_small), Paragraph("5. EXPLAIN", center_small)],
            [Paragraph("Offer or final PDF", table_text), Paragraph("Local PDF text layer", table_text), Paragraph("Typed promise fields", table_text), Paragraph("Rules detect gaps and conflicts", table_text), Paragraph("Verdict linked to source", table_text)],
        ], colWidths=[33.2 * mm] * 5, style=TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#E7F8FA")),
            ("BACKGROUND", (0, 1), (-1, 1), colors.white),
            ("BOX", (0, 0), (-1, -1), 0.65, LINE),
            ("INNERGRID", (0, 0), (-1, -1), 0.35, LINE),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("ALIGN", (0, 0), (-1, -1), "CENTER"),
            ("LEFTPADDING", (0, 0), (-1, -1), 5),
            ("RIGHTPADDING", (0, 0), (-1, -1), 5),
            ("TOPPADDING", (0, 0), (-1, -1), 8),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ])),
        Paragraph("How this supports the hackathon rubric", h2),
        Table([
            [Paragraph("CRITERION", table_head), Paragraph("WHAT THE VIDEO PROVES", table_head)],
            [Paragraph("End-product quality", table_text), Paragraph("A coherent mobile workflow with a clear decision and evidence-backed output.", table_text)],
            [Paragraph("Novelty and impact", table_text), Paragraph("Promise-to-proof verification intervenes before harm and supports action after harm.", table_text)],
            [Paragraph("Creative phone use", table_text), Paragraph("The phone becomes the capture, consent, analysis, and evidence surface.", table_text)],
            [Paragraph("Technical depth", table_text), Paragraph("Local extraction, typed claims, deterministic checks, confidence, and provenance.", table_text)],
            [Paragraph("Demo and presentation", table_text), Paragraph("One real PDF travels through the full pipeline to an auditable verdict.", table_text)],
        ], colWidths=[45 * mm, 121 * mm], style=TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), NAVY),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#F2F7F8")]),
            ("BOX", (0, 0), (-1, -1), 0.6, LINE),
            ("INNERGRID", (0, 0), (-1, -1), 0.35, LINE),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("LEFTPADDING", (0, 0), (-1, -1), 7),
            ("RIGHTPADDING", (0, 0), (-1, -1), 7),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ])),
        PageBreak(),
    ]

    story += [
        Paragraph("6. Final Recording Checklist", h1),
        Paragraph("Before pressing Record", h2),
        bullet_list([
            "Refresh the deployed prototype and confirm that both home-screen modes open correctly.",
            "Test the complete upload once, then restart the demo so no previous state remains.",
            "Place the demo PDF in a folder with no personal files visible around it.",
            "Disable desktop notifications, messaging pop-ups, and automatic updates.",
            "Check microphone level and remove echo, fan noise, and keyboard noise.",
            "Use a clean 1920 x 1080 recording canvas when available.",
        ]),
        Paragraph("During the recording", h2),
        bullet_list([
            "Keep the cursor still while speaking, then move deliberately to the next action.",
            "Wait for each processing state to finish before explaining the result.",
            "Do not scroll rapidly or repeatedly click a button.",
            "If the PDF picker reveals personal filenames, stop and record again.",
            "State clearly that PDF processing is implemented and camera/audio are extensions.",
        ]),
        Paragraph("Before uploading the video", h2),
        bullet_list([
            "Watch the complete export once with headphones.",
            "Confirm that the prototype URL, Team ANKOR, and DealTwin are readable.",
            "Verify that the PDF upload and final source excerpt are visible long enough to understand.",
            "Remove dead time, file-picker hesitation, and accidental cursor movement.",
            "Upload the video as an unlisted or public link that reviewers can open without requesting access.",
            "Test both the video link and prototype link in a private/incognito browser before submission.",
        ]),
        callout("FINAL HANDOFF", "After the recording is approved, make the DealTwin site public and test it while signed out. Keep the same deployment available throughout the review period.", MINT, colors.HexColor("#ECFAF4")),
        Spacer(1, 10),
        Paragraph("Fallback lines for common recording issues", h2),
        Table([
            [Paragraph("SITUATION", table_head), Paragraph("WHAT TO SAY", table_head)],
            [Paragraph("PDF takes a moment", table_text), Paragraph("The document is being processed locally and converted into source-linked policy fields.", table_text)],
            [Paragraph("Reviewer asks about camera/audio", table_text), Paragraph("Those are mobile capture adapters for the same evidence pipeline; the submission prototype demonstrates the PDF path end to end.", table_text)],
            [Paragraph("Reviewer asks about internet research", table_text), Paragraph("DealTwin analyzes only user-selected evidence by default. Any official-source check would be explicit, optional, and limited to trusted domains.", table_text)],
            [Paragraph("Reviewer asks about AI", table_text), Paragraph("The architecture combines extraction and claim normalization with deterministic verification rules so the final verdict is explainable.", table_text)],
        ], colWidths=[50 * mm, 116 * mm], style=TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), NAVY),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#F2F7F8")]),
            ("BOX", (0, 0), (-1, -1), 0.6, LINE),
            ("INNERGRID", (0, 0), (-1, -1), 0.35, LINE),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("LEFTPADDING", (0, 0), (-1, -1), 7),
            ("RIGHTPADDING", (0, 0), (-1, -1), 7),
            ("TOPPADDING", (0, 0), (-1, -1), 7),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
        ])),
    ]

    doc.build(story)
    print(OUTPUT)


if __name__ == "__main__":
    build_pdf()
