import fs from "node:fs/promises";
import { Presentation, PresentationFile } from "@oai/artifact-tool";

const OUT = "C:/Users/ADARSH/Documents/ChatGPT/IQOO Hackathon/DealTwin_Team_ANKOR_iQOO_Hackathon.pptx";
const BUILD = "C:/Users/ADARSH/Documents/ChatGPT/IQOO Hackathon/dealTwin_deck_build";
const HERO = `${BUILD}/assets/dealtwin-hero.png`;

const C = {
  bg: "#F3F7FA",
  white: "#FFFFFF",
  navy: "#0B1F3A",
  ink: "#15263F",
  muted: "#607188",
  blue: "#2F80ED",
  blue2: "#73B4FF",
  ice: "#DCEEFF",
  ice2: "#EAF4FF",
  cyan: "#67D5E8",
  green: "#27B67A",
  greenBg: "#E4F7EF",
  red: "#E24B5B",
  redBg: "#FCE9EC",
  yellow: "#F4B93A",
  line: "#C9D8E7",
};

const pres = Presentation.create({ slideSize: { width: 1280, height: 720 } });

function box(slide, left, top, width, height, fill, radius = true, line = "none", lineWidth = 0) {
  return slide.shapes.add({
    geometry: radius ? "roundRect" : "rect",
    position: { left, top, width, height },
    fill,
    line: { style: "solid", fill: line, width: lineWidth },
    ...(radius ? { borderRadius: "rounded-xl" } : {}),
  });
}

function text(slide, value, left, top, width, height, size = 24, color = C.ink, bold = false, align = "left") {
  const s = slide.shapes.add({
    geometry: "textbox",
    position: { left, top, width, height },
    fill: "none",
    line: { style: "solid", fill: "none", width: 0 },
  });
  s.text = value;
  s.text.style = { fontSize: size, color, bold, alignment: align };
  return s;
}

function header(slide, section, page) {
  text(slide, "TEAM ANKOR", 58, 31, 170, 24, 13, C.navy, true);
  text(slide, section.toUpperCase(), 1000, 31, 200, 24, 13, C.muted, true, "right");
  box(slide, 58, 62, 1164, 2, C.line, false);
  text(slide, String(page).padStart(2, "0"), 1175, 670, 46, 22, 12, C.muted, true, "right");
}

function titleBlock(slide, eyebrow, title, subtitle = "") {
  text(slide, eyebrow.toUpperCase(), 72, 100, 520, 24, 14, C.blue, true);
  text(slide, title, 72, 136, 780, 110, 46, C.navy, true);
  if (subtitle) text(slide, subtitle, 72, 250, 760, 72, 20, C.muted, false);
}

function label(slide, value, left, top, width, fill, color = C.navy) {
  box(slide, left, top, width, 36, fill, true);
  text(slide, value, left + 12, top + 8, width - 24, 20, 13, color, true, "center");
}

function statusRow(slide, y, promise, status, source, fill, statusColor) {
  box(slide, 425, y, 765, 63, C.white, true, C.line, 1);
  text(slide, promise, 452, y + 16, 350, 30, 17, C.ink, true);
  label(slide, status, 820, y + 13, 150, fill, statusColor);
  text(slide, source, 985, y + 18, 170, 24, 14, C.muted, false, "right");
}

function step(slide, x, num, name, detail, fill = C.white) {
  box(slide, x, 365, 200, 178, fill, true, C.line, 1);
  box(slide, x + 18, 383, 38, 38, C.navy, true);
  text(slide, String(num), x + 18, 391, 38, 20, 14, C.white, true, "center");
  text(slide, name, x + 18, 438, 164, 30, 19, C.navy, true);
  text(slide, detail, x + 18, 474, 164, 54, 14, C.muted);
}

function addSourcesNote(slide, lines = []) {
  if (!lines.length) return;
  try {
    slide.notes = `[Sources]\n${lines.map((x) => `- ${x}`).join("\n")}\n[/Sources]`;
  } catch {}
}

// Slide 1 — Cover
{
  const s = pres.slides.add();
  s.background.fill = C.bg;
  const heroBytes = await fs.readFile(HERO);
  s.images.add({
    blob: heroBytes.buffer.slice(heroBytes.byteOffset, heroBytes.byteOffset + heroBytes.byteLength),
    contentType: "image/png",
    alt: "Smartphone comparing purchase evidence and final paperwork",
    fit: "cover",
    position: { left: 610, top: 0, width: 670, height: 720 },
  });
  box(s, 0, 0, 760, 720, C.bg, false);
  text(s, "iQOO HACKATHON 2026", 70, 62, 300, 24, 14, C.blue, true);
  text(s, "DealTwin", 70, 166, 490, 84, 64, C.navy, true);
  text(s, "The memory every purchase should have.", 70, 260, 500, 76, 28, C.ink, true);
  text(s, "Capture what was promised. Compare it with what you sign. Understand the true deal before you pay.", 70, 355, 480, 98, 20, C.muted);
  label(s, "MOBILE-FIRST • LOCAL-FIRST", 70, 488, 275, C.ice, C.navy);
  text(s, "Presented by TEAM ANKOR", 70, 608, 380, 30, 18, C.navy, true);
  text(s, "Remember the promise. Verify the deal.", 70, 645, 420, 24, 15, C.muted);
  addSourcesNote(s, ["Hero visual generated for this deck with OpenAI image generation."]);
}

// Slide 2 — Problem
{
  const s = pres.slides.add(); s.background.fill = C.bg; header(s, "The problem", 2);
  titleBlock(s, "A familiar consumer failure", "The deal people understand often changes before they sign.", "Promises live in one place. Fees, exclusions and altered terms appear somewhere else.");
  const sources = [
    ["AD", "No-cost EMI", 74, 355, C.ice],
    ["VOICE", "Free insurance", 74, 425, C.ice2],
    ["CHAT", "2-year warranty", 74, 495, C.ice],
    ["INVOICE", "+ Processing fee", 334, 390, C.redBg],
    ["KFS", "Cash discount lost", 334, 470, C.redBg],
  ];
  for (const [tag, val, x, y, fill] of sources) {
    box(s, x, y, 220, 55, fill, true, C.line, 1);
    text(s, tag, x + 14, y + 11, 54, 20, 11, C.blue, true);
    text(s, val, x + 72, y + 13, 132, 24, 16, C.ink, true);
  }
  text(s, "→", 565, 435, 70, 60, 44, C.blue, true, "center");
  box(s, 650, 345, 500, 230, C.white, true, C.line, 1);
  text(s, "THE FINAL DEAL", 684, 373, 200, 22, 13, C.muted, true);
  text(s, "₹2,148 more", 684, 412, 300, 56, 42, C.red, true);
  text(s, "than the customer expected", 684, 470, 350, 30, 18, C.ink, true);
  text(s, "The problem is not missing information. It is missing comparison.", 684, 516, 410, 42, 17, C.muted);
}

// Slide 3 — Solution
{
  const s = pres.slides.add(); s.background.fill = C.bg; header(s, "The solution", 3);
  titleBlock(s, "Not another document summarizer", "DealTwin builds a verifiable Promise Ledger.", "Every conclusion points back to the exact screenshot, clause or consented audio timestamp.");
  box(s, 72, 354, 295, 220, C.navy, true);
  text(s, "PROMISE\nLEDGER", 100, 386, 235, 82, 34, C.white, true);
  text(s, "What was said\nWhat was signed\nWhat changed", 100, 485, 220, 82, 17, C.ice);
  statusRow(s, 344, "No-cost EMI", "CHANGED", "Invoice §4", C.redBg, C.red);
  statusRow(s, 417, "2-year warranty", "KEPT", "Warranty card", C.greenBg, C.green);
  statusRow(s, 490, "Free insurance", "MISSING", "KFS + invoice", C.redBg, C.red);
  text(s, "Five evidence-based outcomes: Kept • Changed • Missing • Contradicted • Unverifiable", 425, 576, 765, 30, 16, C.muted, true);
}

// Slide 4 — Mobile flow
{
  const s = pres.slides.add(); s.background.fill = C.bg; header(s, "Mobile-first journey", 4);
  titleBlock(s, "The phone is the product", "One iQOO phone turns scattered evidence into action.", "Camera, microphone and on-device AI make DealTwin useful at the exact moment a purchase is made.");
  step(s, 72, 1, "Capture", "Ads, voice, screenshots and documents", C.white);
  step(s, 304, 2, "Understand", "Extract price, fee, EMI and warranty claims", C.ice2);
  step(s, 536, 3, "Compare", "Match the promise against final paperwork", C.white);
  step(s, 768, 4, "Calculate", "Reconstruct the true payable cost", C.ice2);
  step(s, 1000, 5, "Act", "Generate a neutral seller clarification", C.white);
  text(s, "ON-DEVICE OCR", 93, 570, 190, 22, 13, C.blue, true, "center");
  text(s, "LOCAL / OPEN LLM", 325, 570, 190, 22, 13, C.blue, true, "center");
  text(s, "EVIDENCE LINKS", 557, 570, 190, 22, 13, C.blue, true, "center");
  text(s, "DETERMINISTIC MATH", 789, 570, 190, 22, 13, C.blue, true, "center");
  text(s, "SHAREABLE OUTPUT", 1021, 570, 190, 22, 13, C.blue, true, "center");
}

// Slide 5 — MVP
{
  const s = pres.slides.add(); s.background.fill = C.bg; header(s, "Flagship MVP", 5);
  titleBlock(s, "Focus creates reliability", "Start with the purchase journey people already distrust: no-cost EMI.", "Electronics purchases combine advertisements, verbal offers, invoices, KFS documents and warranties—perfect for a convincing end-to-end demo.");
  box(s, 72, 365, 470, 215, C.white, true, C.line, 1);
  text(s, "PROMISED", 104, 394, 150, 22, 13, C.green, true);
  text(s, "₹50,000", 104, 432, 230, 48, 40, C.navy, true);
  text(s, "12 months • zero interest\nFree insurance • 2-year warranty", 104, 492, 360, 62, 17, C.muted);
  text(s, "→", 558, 438, 74, 60, 44, C.blue, true, "center");
  box(s, 648, 365, 540, 215, C.navy, true);
  text(s, "TRUE PAYABLE COST", 680, 394, 220, 22, 13, C.ice, true);
  text(s, "₹52,148", 680, 432, 260, 48, 40, C.white, true);
  text(s, "+ ₹999 processing fee\n+ ₹1,149 discount loss", 680, 494, 280, 58, 17, C.ice);
  label(s, "DISCREPANCY FOUND", 968, 434, 185, C.redBg, C.red);
  text(s, "MVP output: Promise Ledger + true-cost explanation + seller clarification card", 72, 610, 1115, 30, 17, C.muted, true);
}

// Slide 6 — Architecture
{
  const s = pres.slides.add(); s.background.fill = C.bg; header(s, "Implementation architecture", 6);
  titleBlock(s, "Local-first by design", "Fast, private and explainable—without turning AI into a black box.", "The language model extracts and matches claims; deterministic rules calculate money and preserve accountability.");
  const stages = [
    ["01", "Capture", "Camera • mic • files"],
    ["02", "Extract", "OCR • speech-to-text"],
    ["03", "Normalize", "Price • fee • condition"],
    ["04", "Compare", "Semantic + rule matching"],
    ["05", "Calculate", "EMI • tax • discount"],
    ["06", "Explain", "Ledger • evidence • action"],
  ];
  stages.forEach((it, i) => {
    const x = 72 + i * 190;
    box(s, x, 365, 165, 156, i % 2 ? C.ice2 : C.white, true, C.line, 1);
    text(s, it[0], x + 18, 384, 42, 22, 14, C.blue, true);
    text(s, it[1], x + 18, 424, 130, 28, 19, C.navy, true);
    text(s, it[2], x + 18, 465, 130, 40, 14, C.muted);
    if (i < 5) text(s, "→", x + 162, 420, 28, 30, 24, C.blue, true, "center");
  });
  box(s, 72, 555, 1115, 62, C.navy, true);
  text(s, "ENCRYPTED LOCAL VAULT", 100, 575, 260, 22, 14, C.white, true);
  text(s, "User-controlled evidence • offline access • optional cloud fallback only", 380, 575, 770, 22, 16, C.ice);
}

// Slide 7 — Hackathon build plan
{
  const s = pres.slides.add(); s.background.fill = C.bg; header(s, "Hackathon execution", 7);
  titleBlock(s, "Designed around Red Light and Green Light", "The build plan treats phone-first development as an advantage—not a restriction.");
  box(s, 72, 334, 638, 74, C.red, true);
  text(s, "55%  RED LIGHT • PHONE-FIRST", 100, 356, 580, 28, 21, C.white, true, "center");
  box(s, 710, 334, 478, 74, C.green, true);
  text(s, "45%  GREEN LIGHT • BOTH", 735, 356, 428, 28, 21, C.white, true, "center");
  box(s, 72, 438, 535, 140, C.white, true, C.line, 1);
  text(s, "RED LIGHT", 98, 460, 140, 22, 14, C.red, true);
  text(s, "Android UI • camera and microphone flows • on-device inference • end-to-end phone testing", 98, 496, 470, 66, 17, C.ink);
  box(s, 625, 438, 563, 140, C.white, true, C.line, 1);
  text(s, "GREEN LIGHT", 651, 460, 160, 22, 14, C.green, true);
  text(s, "Model preparation • laptop-heavy integration • debugging • performance tuning • demo polish", 651, 496, 500, 66, 17, C.ink);
  label(s, "OFFICE KIT", 72, 608, 150, C.ice, C.navy);
  text(s, "Screen mirror • shared clipboard • file transfer • remote input", 244, 615, 650, 24, 16, C.muted, true);
  text(s, "10% OF SCORE", 1000, 615, 188, 24, 16, C.blue, true, "right");
}

// Slide 8 — Demo and scale
{
  const s = pres.slides.add(); s.background.fill = C.bg; header(s, "Demo + scale", 8);
  titleBlock(s, "A focused demo proves the product today—and its scale tomorrow", "One visible discrepancy is more persuasive than ten unfinished features.");
  box(s, 72, 335, 530, 265, C.navy, true);
  text(s, "LIVE DEMO", 104, 362, 180, 24, 14, C.cyan, true);
  const demo = ["Capture the no-cost EMI ad", "Record a consented explanation", "Scan invoice / KFS", "Reveal the extra ₹2,148", "Create clarification card"];
  demo.forEach((d, i) => {
    box(s, 104, 404 + i * 36, 28, 28, C.blue, true);
    text(s, String(i + 1), 104, 410 + i * 36, 28, 16, 12, C.white, true, "center");
    text(s, d, 148, 407 + i * 36, 405, 22, 16, C.white, i === 3);
  });
  text(s, "SCALE THE SAME ENGINE", 660, 352, 330, 24, 14, C.blue, true);
  const domains = ["Appliances", "Insurance", "Telecom", "Travel", "Rentals", "Education", "Healthcare", "Subscriptions"];
  domains.forEach((d, i) => {
    const x = 660 + (i % 2) * 250;
    const y = 394 + Math.floor(i / 2) * 48;
    box(s, x, y, 220, 36, i % 3 === 0 ? C.ice : C.white, true, C.line, 1);
    text(s, d, x + 14, y + 8, 192, 20, 14, C.navy, true);
  });
  text(s, "RUBRIC FIT", 660, 598, 110, 20, 12, C.muted, true);
  text(s, "30 Quality  •  20 Novelty  •  15 Tech  •  15 Phone  •  10 Office Kit  •  10 Demo", 786, 596, 405, 28, 14, C.navy, true, "right");
}

// Slide 9 — Conclusion
{
  const s = pres.slides.add(); s.background.fill = C.bg; header(s, "Conclusion", 9);
  text(s, "DealTwin can become the trust layer\nbetween a promise and a payment.", 72, 118, 900, 116, 46, C.navy, true);
  const reasons = [
    ["01", "Real utility", "A familiar problem with immediate financial impact."],
    ["02", "Defensible output", "Evidence links and deterministic calculations build trust."],
    ["03", "Built to scale", "The same engine works across consumer contracts."],
  ];
  reasons.forEach((r, i) => {
    const x = 72 + i * 380;
    box(s, x, 300, 340, 185, i === 1 ? C.ice2 : C.white, true, C.line, 1);
    text(s, r[0], x + 24, 324, 48, 22, 14, C.blue, true);
    text(s, r[1], x + 24, 366, 280, 30, 22, C.navy, true);
    text(s, r[2], x + 24, 416, 286, 50, 16, C.muted);
  });
  box(s, 72, 548, 1100, 82, C.navy, true);
  text(s, "Companies remember what customers signed. DealTwin remembers what they were promised.", 104, 572, 1036, 34, 22, C.white, true, "center");
}

// Slide 10 — Thank you
{
  const s = pres.slides.add(); s.background.fill = C.navy;
  text(s, "TEAM ANKOR", 72, 60, 220, 26, 14, C.cyan, true);
  text(s, "Thank you.", 72, 214, 660, 92, 64, C.white, true);
  text(s, "Remember the promise. Verify the deal.", 72, 322, 680, 46, 28, C.ice, true);
  box(s, 72, 430, 285, 52, C.blue, true);
  text(s, "QUESTIONS + LIVE DEMO", 88, 446, 253, 22, 15, C.white, true, "center");
  box(s, 890, 140, 245, 440, C.white, true);
  box(s, 910, 176, 205, 360, C.ice2, true);
  label(s, "PROMISE LEDGER", 932, 220, 160, C.white, C.navy);
  label(s, "KEPT", 932, 292, 160, C.greenBg, C.green);
  label(s, "CHANGED", 932, 344, 160, C.redBg, C.red);
  label(s, "TRUE COST", 932, 396, 160, C.white, C.blue);
  text(s, "DealTwin", 932, 472, 160, 28, 20, C.navy, true, "center");
  text(s, "10 / 10", 1120, 672, 80, 20, 12, C.ice, true, "right");
}

await fs.mkdir(`${BUILD}/renders`, { recursive: true });
for (const [i, slide] of pres.slides.items.entries()) {
  const png = await pres.export({ slide, format: "png", scale: 1 });
  await fs.writeFile(`${BUILD}/renders/slide-${String(i + 1).padStart(2, "0")}.png`, new Uint8Array(await png.arrayBuffer()));
}
const montage = await pres.export({ format: "webp", montage: true, scale: 1 });
await fs.writeFile(`${BUILD}/montage.webp`, new Uint8Array(await montage.arrayBuffer()));
const pptx = await PresentationFile.exportPptx(pres);
await pptx.save(OUT);
console.log(OUT);
