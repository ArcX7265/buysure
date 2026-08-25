import fs from "node:fs/promises";
import { Presentation, PresentationFile } from "@oai/artifact-tool";

const BUILD = "C:/Users/ADARSH/Documents/ChatGPT/IQOO Hackathon/dealtwin_technical_build";
const OUT = "C:/Users/ADARSH/Documents/ChatGPT/IQOO Hackathon/DealTwin_Technical_Selection_Deck_Team_ANKOR.pptx";

const C = {
  bg: "#F4F8FC", white: "#FFFFFF", navy: "#071C35", ink: "#132A45",
  muted: "#5A6F88", blue: "#2479F2", blue2: "#5BA6FF", ice: "#DCEEFF",
  ice2: "#EBF5FF", cyan: "#56D4E8", green: "#16A66A", greenBg: "#DFF5EB",
  red: "#DE465B", redBg: "#FCE7EB", amber: "#E4A326", amberBg: "#FFF3D5",
  line: "#C7D7E8", dark2: "#102C4C", code: "#07182D"
};

const pres = Presentation.create({ slideSize: { width: 1280, height: 720 } });

function box(slide, left, top, width, height, fill, radius=true, line="none", lineWidth=0) {
  return slide.shapes.add({
    geometry: radius ? "roundRect" : "rect",
    position: { left, top, width, height }, fill,
    line: { style: "solid", fill: line, width: lineWidth },
    ...(radius ? { borderRadius: "rounded-xl" } : {})
  });
}

function text(slide, value, left, top, width, height, size=20, color=C.ink, bold=false, align="left") {
  const s = slide.shapes.add({
    geometry: "textbox", position: { left, top, width, height }, fill: "none",
    line: { style: "solid", fill: "none", width: 0 }
  });
  s.text = value;
  s.text.style = { fontSize: size, color, bold, alignment: align };
  return s;
}

function header(slide, section, page) {
  text(slide, "TEAM ANKOR", 58, 28, 175, 24, 13, C.navy, true);
  text(slide, section.toUpperCase(), 965, 28, 255, 24, 13, C.muted, true, "right");
  box(slide, 58, 60, 1164, 2, C.line, false);
  text(slide, String(page).padStart(2, "0"), 1170, 674, 48, 18, 12, C.muted, true, "right");
}

function titleBlock(slide, eyebrow, title, subtitle="", titleWidth=1060) {
  text(slide, eyebrow.toUpperCase(), 72, 88, 760, 22, 13, C.blue, true);
  text(slide, title, 72, 122, titleWidth, 102, 43, C.navy, true);
  if (subtitle) text(slide, subtitle, 72, 226, 1080, 48, 18, C.muted);
}

function tag(slide, value, left, top, width, fill=C.ice, color=C.navy) {
  box(slide, left, top, width, 30, fill, true);
  text(slide, value, left+10, top+6, width-20, 18, 12, color, true, "center");
}

function arrow(slide, left, top, width=32, color=C.blue) {
  text(slide, "→", left, top, width, 30, 25, color, true, "center");
}

function note(slide, lines=[]) {
  if (!lines.length) return;
  try { slide.notes = `[Sources]\n${lines.map(x=>`- ${x}`).join("\n")}\n[/Sources]`; } catch {}
}

function miniNode(slide, x, y, w, title, detail, fill=C.white, accent=C.blue) {
  box(slide, x, y, w, 88, fill, true, C.line, 1);
  box(slide, x, y, 5, 88, accent, false);
  text(slide, title, x+18, y+15, w-32, 24, 17, C.navy, true);
  text(slide, detail, x+18, y+46, w-32, 30, 13, C.muted);
}

// 1 — Technical cover
{
  const s = pres.slides.add(); s.background.fill = C.bg;
  text(s, "iQOO HACKATHON 2026  •  TECHNICAL SELECTION DECK", 70, 54, 620, 22, 13, C.blue, true);
  text(s, "DealTwin", 70, 130, 520, 82, 62, C.navy, true);
  text(s, "A local-first evidence reconciliation engine for consumer transactions.", 70, 218, 610, 76, 27, C.ink, true);
  text(s, "It converts advertisements, conversations and final paperwork into a source-linked Promise Ledger—before payment or signature.", 70, 312, 560, 80, 18, C.muted);
  tag(s, "EXPLAINABLE", 70, 430, 140, C.ice, C.navy);
  tag(s, "PHONE-FIRST", 220, 430, 140, C.ice2, C.navy);
  tag(s, "LOCAL AI", 370, 430, 120, C.greenBg, C.green);
  text(s, "TEAM ANKOR", 70, 620, 240, 28, 18, C.navy, true);

  // Technical thesis graphic; no decorative product photo.
  box(s, 715, 82, 500, 545, C.navy, true);
  text(s, "VERIFICATION PIPELINE", 752, 116, 420, 22, 14, C.cyan, true);
  text(s, "Evidence becomes a testable claim—not a summary.", 752, 148, 400, 54, 24, C.white, true);
  const ys = [236, 334, 432];
  const titles = ["01  CAPTURE", "02  RECONCILE", "03  VERIFY"];
  const details = [
    "Camera • screenshots • consented audio • PDF",
    "Structured claims • evidence graph • source authority",
    "Constraint checks • true-cost math • traceable outcome"
  ];
  ys.forEach((y,i)=>{
    box(s, 752, y, 415, 76, i===1 ? C.dark2 : "#0C2644", true, "#294966", 1);
    text(s, titles[i], 774, y+13, 160, 20, 14, i===2 ? C.greenBg : C.ice, true);
    text(s, details[i], 774, y+39, 365, 25, 14, C.white);
    if (i<2) text(s, "↓", 935, y+75, 50, 24, 19, C.cyan, true, "center");
  });
  text(s, "OUTPUT  Promise Ledger + true payable cost + clarification card", 752, 548, 420, 34, 14, C.cyan, true);
}

// 2 — Problem model
{
  const s = pres.slides.add(); s.background.fill=C.bg; header(s,"Problem model",2);
  titleBlock(s,"The technical failure is state divergence","The promise and the contract evolve in separate, incompatible channels.","DealTwin treats this as an evidence reconciliation problem—not as generic document summarization.");
  text(s,"PRE-COMMITMENT STATE",72,300,290,22,13,C.blue,true);
  miniNode(s,72,333,260,"Advertisement","₹50,000 • no-cost EMI",C.ice2,C.blue);
  miniNode(s,72,437,260,"Seller explanation","Free insurance • 2-year warranty",C.white,C.cyan);
  miniNode(s,72,541,260,"Chat / screenshot","Offer validity • conditions",C.ice2,C.blue);

  arrow(s,348,425,42);
  box(s,400,340,300,255,C.navy,true);
  text(s,"NORMALIZATION GAP",430,370,240,24,15,C.cyan,true,"center");
  text(s,"Same concept, different wording\nMissing units and conditions\nConflicting timestamps\nUnequal source authority",430,419,240,116,18,C.white,false,"center");
  tag(s,"NO SHARED SCHEMA",470,548,160,C.redBg,C.red);
  arrow(s,716,425,42);

  text(s,"FINAL COMMITMENT STATE",770,300,360,22,13,C.blue,true);
  miniNode(s,770,333,380,"Invoice + KFS","₹999 fee • cash discount removed",C.redBg,C.red);
  miniNode(s,770,437,380,"Warranty / policy","Coverage differs from the verbal claim",C.white,C.amber);
  box(s,770,541,380,62,C.white,true,C.line,1);
  text(s,"DEMO DELTA",792,555,120,18,12,C.muted,true);
  text(s,"₹2,148 above expected cost",920,551,205,28,20,C.red,true,"right");
  text(s,"Illustrative hackathon scenario",770,618,380,18,12,C.muted,false,"right");
  note(s,["The ₹2,148 figure is a constructed demo scenario, not a market statistic."]);
}

// 3 — End-to-end workflow swimlane
{
  const s=pres.slides.add(); s.background.fill=C.bg; header(s,"End-to-end workflow",3);
  titleBlock(s,"Every outcome remains linked to the evidence that produced it","Capture → extract → reconcile → verify → act, with human review at low confidence.");
  const laneY=[304,406,508];
  ["USER / DEVICE","ON-DEVICE INTELLIGENCE","VERIFIABLE OUTPUT"].forEach((v,i)=>{
    text(s,v,72,laneY[i]+30,165,24,13,i===1?C.blue:C.muted,true);
    box(s,230,laneY[i],955,1,C.line,false);
  });
  const xs=[250,438,626,814,1002];
  const stages=[
    ["1","CAPTURE","Camera, files, consented audio"],
    ["2","EXTRACT","OCR + structured claim JSON"],
    ["3","RECONCILE","Candidate match + source authority"],
    ["4","VERIFY","Rules + deterministic cost engine"],
    ["5","ACT","Ledger + neutral clarification"]
  ];
  // arrows before nodes
  for(let i=0;i<4;i++) arrow(s,xs[i]+150,344,36);
  stages.forEach((st,i)=>{
    box(s,xs[i],318,158,122,i%2?C.ice2:C.white,true,C.line,1);
    tag(s,st[0],xs[i]+14,330,34,C.navy,C.white);
    text(s,st[1],xs[i]+14,369,130,22,16,C.navy,true);
    text(s,st[2],xs[i]+14,397,130,32,12,C.muted);
  });
  // AI lane details
  tag(s,"BUNDLED OCR",252,456,142,C.ice,C.navy);
  tag(s,"LOCAL OPEN MODEL",420,456,164,C.ice2,C.navy);
  tag(s,"EMBEDDING RETRIEVAL",610,456,184,C.ice,C.navy);
  tag(s,"RULE ENGINE",820,456,140,C.greenBg,C.green);
  tag(s,"CONFIDENCE GATE",986,456,174,C.amberBg,C.amber);
  text(s,"If confidence < threshold → mark UNVERIFIABLE and request user confirmation",332,508,746,24,16,C.amber,true,"center");
  // output lane
  text(s,"KEPT",300,562,100,20,14,C.green,true,"center");
  text(s,"CHANGED",452,562,120,20,14,C.red,true,"center");
  text(s,"MISSING",622,562,120,20,14,C.red,true,"center");
  text(s,"CONTRADICTED",792,562,150,20,14,C.amber,true,"center");
  text(s,"UNVERIFIABLE",1000,562,150,20,14,C.muted,true,"center");
  text(s,"Consent boundary: audio is opt-in; no background recording.",72,636,650,22,14,C.muted,true);
}

// 4 — System architecture
{
  const s=pres.slides.add(); s.background.fill=C.bg; header(s,"System architecture",4);
  titleBlock(s,"The phone contains the trust boundary; the cloud is optional","A modular pipeline isolates probabilistic extraction from deterministic financial verification.");
  // connectors first
  [323,555,787,1019].forEach(x=>arrow(s,x,400,32));
  // top input adapters
  text(s,"INPUT ADAPTERS",72,300,180,20,13,C.blue,true);
  ["CameraX","Screenshot share","PDF / image","Consented audio"].forEach((v,i)=>tag(s,v,72+i*145,330,132,i%2?C.white:C.ice2,C.navy));
  // trust boundary
  box(s,72,382,1115,198,"none",true,C.blue,2);
  text(s,"ON-DEVICE TRUST BOUNDARY",90,392,250,20,12,C.blue,true);
  const nodes=[
    [90,"OCR + STT","Bundled OCR; offline speech adapter"],
    [337,"Claim parser","Schema-constrained JSON"],
    [584,"Evidence graph","Embedding retrieval + source rank"],
    [831,"Verifier","Constraints + true-cost engine"],
    [1048,"Vault","Encrypted local vault"]
  ];
  nodes.forEach((n,i)=>{
    const w=i===4?122:205;
    box(s,n[0],430,w,112,i%2?C.ice2:C.white,true,C.line,1);
    text(s,n[1],n[0]+14,448,w-28,22,16,C.navy,true,"center");
    text(s,n[2],n[0]+12,482,w-24,44,12,C.muted,false,"center");
  });
  tag(s,"OPTIONAL CLOUD FALLBACK",845,606,220,C.white,C.muted);
  text(s,"Only explicit user action; raw evidence stays local by default",760,642,405,22,13,C.muted,false,"right");
  tag(s,"OFFICE KIT",72,606,120,C.ice,C.navy);
  text(s,"screen mirror • shared clipboard • file transfer • remote input",210,612,520,20,14,C.muted,true);
  note(s,[
    "Android CameraX image capture: https://developer.android.com/media/camera/camerax/take-photo",
    "ML Kit on-device text recognition: https://developers.google.com/ml-kit/vision/text-recognition/v2/android",
    "ONNX Runtime QNN execution provider: https://onnxruntime.ai/docs/execution-providers/QNN-ExecutionProvider.html"
  ]);
}

// 5 — Claim model and verification logic
{
  const s=pres.slides.add(); s.background.fill=C.bg; header(s,"Verification engine",5);
  titleBlock(s,"AI proposes the claim; deterministic logic decides the money","The core object is a typed claim with provenance, not an untraceable paragraph of generated text.");
  // schema block
  box(s,72,312,430,292,C.code,true);
  text(s,"CLAIM OBJECT",98,336,170,22,14,C.cyan,true);
  text(s,
`claim_id: c_017\nconcept: "processing_fee"\nvalue: 999\ncurrency: INR\ncondition: "EMI checkout"\nsource: invoice.pdf#p1:b7\ntimestamp: 2026-08-24T...\nauthority: CONTRACTUAL\nconfidence: 0.94`,
  98,374,370,206,16,C.white,false);

  arrow(s,520,424,42);
  box(s,575,312,282,292,C.white,true,C.line,1);
  text(s,"MATCH SCORE",600,336,220,22,14,C.blue,true,"center");
  text(s,"0.40  semantic similarity\n0.25  unit / value consistency\n0.20  condition overlap\n0.15  temporal compatibility",600,380,230,108,16,C.ink);
  box(s,600,510,230,1,C.line,false);
  text(s,"Candidate retrieval only",600,530,230,22,14,C.muted,true,"center");
  text(s,"Never the final verdict",600,558,230,22,14,C.red,true,"center");

  arrow(s,870,424,42);
  box(s,925,312,262,292,C.navy,true);
  text(s,"CONSTRAINT ENGINE",950,336,212,22,14,C.cyan,true,"center");
  text(s,"Fee promised = 0\nFee signed = 999\nCash discount lost = 1,149",950,380,212,82,16,C.white);
  box(s,950,478,212,1,"#355372",false);
  text(s,"TRUE COST",950,496,100,20,13,C.ice,true);
  text(s,"₹50,000 + ₹999 + ₹1,149",950,526,212,26,18,C.white,true);
  tag(s,"CHANGED  •  +₹2,148",950,566,212,C.redBg,C.red);
  text(s,"Every status stores supporting and opposing evidence IDs.",72,628,900,24,15,C.muted,true);
}

// 6 — Implementation and hackathon plan
{
  const s=pres.slides.add(); s.background.fill=C.bg; header(s,"Implementation plan",6);
  titleBlock(s,"The MVP is scoped for a 30-hour build without faking the hard parts","A narrow electronics/EMI journey exercises every architectural component end to end.");
  text(s,"ANDROID APPLICATION",72,304,240,20,13,C.blue,true);
  const stack=[
    ["UI + capture","Kotlin • Jetpack Compose • CameraX"],
    ["OCR","Bundled ML Kit Text Recognition"],
    ["Local inference","Quantized open model • ONNX Runtime adapter"],
    ["Verification","Kotlin rules • BigDecimal cost engine"],
    ["Storage","Room / SQLCipher • evidence hashes"]
  ];
  stack.forEach((v,i)=>{
    const y=334+i*62;
    box(s,72,y,500,52,i%2?C.ice2:C.white,true,C.line,1);
    box(s,72,y,5,52,i===2?C.green:C.blue,false);
    text(s,v[0],98,y+9,145,20,16,C.navy,true);
    text(s,v[1],250,y+10,295,20,13,C.muted);
  });

  text(s,"HACKATHON EXECUTION",625,304,260,20,13,C.blue,true);
  box(s,625,334,560,72,C.red,true);
  text(s,"55%  RED LIGHT  •  PHONE-FIRST",650,353,510,24,20,C.white,true,"center");
  text(s,"UI, capture, OCR, device inference, offline validation",650,380,510,18,13,C.white,false,"center");
  box(s,625,420,560,72,C.green,true);
  text(s,"45%  GREEN LIGHT  •  BOTH DEVICES",650,439,510,24,20,C.white,true,"center");
  text(s,"Model packaging, integration, profiling, demo hardening",650,466,510,18,13,C.white,false,"center");
  box(s,625,512,560,92,C.white,true,C.line,1);
  text(s,"OFFICE KIT  •  10% OF SCORE",650,530,245,22,15,C.navy,true);
  text(s,"Mirror the app • move test documents • paste logs • remote input",650,566,510,22,14,C.muted);
  text(s,"Fallback policy: if NPU integration is unavailable, preserve the same runtime interface and benchmark NNAPI/CPU—functionality never depends on one accelerator.",625,625,560,36,14,C.muted,true);
  note(s,[
    "ML Kit bundled vs. unbundled OCR options: https://developers.google.com/ml-kit/vision/text-recognition/v2/android",
    "ONNX Runtime mobile deployment guidance: https://onnxruntime.ai/docs/tutorials/mobile/",
    "ONNX Runtime QNN supports Snapdragon Android devices: https://onnxruntime.ai/docs/execution-providers/QNN-ExecutionProvider.html"
  ]);
}

// 7 — Conclusion / selection case
{
  const s=pres.slides.add(); s.background.fill=C.bg; header(s,"Conclusion",7);
  titleBlock(s,"DealTwin is technically credible, demonstrable and built to scale","Selection should depend on whether the prototype proves traceable reconciliation—not on the number of screens.");
  text(s,"LIVE SELECTION DEMO",72,302,240,20,13,C.blue,true);
  const demo=["Capture no-cost EMI advertisement","Scan invoice + KFS","Generate structured Promise Ledger","Reveal ₹2,148 delta with sources","Create neutral seller clarification"];
  demo.forEach((d,i)=>{
    box(s,72,334+i*48,34,34,i===3?C.red:C.blue,true);
    text(s,String(i+1),72,342+i*48,34,18,13,C.white,true,"center");
    text(s,d,124,340+i*48,360,22,16,i===3?C.red:C.ink,i===3);
  });

  text(s,"PROTOTYPE ACCEPTANCE TARGETS",545,302,300,20,13,C.blue,true);
  const targets=[
    ["100%","ledger rows link to source evidence"],
    ["100%","scripted cost cases use deterministic math"],
    ["≤ 4 s","reconciliation target on loaner device"],
    ["0","raw documents uploaded by default"]
  ];
  targets.forEach((t,i)=>{
    const y=334+i*58;
    text(s,t[0],545,y,90,34,25,i===3?C.green:C.navy,true);
    text(s,t[1],645,y+4,315,28,15,C.muted);
    box(s,545,y+42,400,1,C.line,false);
  });

  box(s,980,302,208,266,C.navy,true);
  text(s,"SCALE PATH",1004,326,160,20,14,C.cyan,true,"center");
  text(s,"Electronics EMI\n↓\nInsurance + lending\n↓\nTelecom + travel\n↓\nConsumer-contract SDK / API",1004,370,160,160,17,C.white,true,"center");
  box(s,72,600,1116,54,C.navy,true);
  text(s,"Companies preserve what customers signed. DealTwin preserves what they were promised—and verifies the difference.",96,617,1068,24,19,C.white,true,"center");
}

// 8 — Thank you
{
  const s=pres.slides.add(); s.background.fill=C.navy;
  text(s,"TEAM ANKOR",72,60,230,24,14,C.cyan,true);
  text(s,"Thank you.",72,186,620,84,60,C.white,true);
  text(s,"Remember the promise.\nVerify the deal.",72,292,580,92,32,C.ice,true);
  tag(s,"QUESTIONS  •  ARCHITECTURE  •  LIVE DEMO",72,448,390,C.blue,C.white);
  text(s,"DealTwin",72,618,240,28,20,C.white,true);
  // closing system loop
  text(s,"THE PRODUCT LOOP",760,112,350,22,14,C.cyan,true,"center");
  const loop=[
    ["CAPTURE","Evidence"],["STRUCTURE","Claims"],["VERIFY","Constraints"],["ACT","Clarification"]
  ];
  loop.forEach((v,i)=>{
    const y=166+i*98;
    box(s,790,y,300,68,i===2?C.greenBg:C.white,true);
    text(s,v[0],810,y+13,105,20,14,i===2?C.green:C.blue,true);
    text(s,v[1],920,y+13,145,22,18,C.navy,true,"right");
    if(i<3) text(s,"↓",915,y+68,50,28,20,C.cyan,true,"center");
  });
  text(s,"8 / 8",1130,675,70,18,12,C.ice,true,"right");
}

await fs.mkdir(`${BUILD}/renders`,{recursive:true});
for (const [i,slide] of pres.slides.items.entries()) {
  const png=await pres.export({slide,format:"png",scale:1});
  await fs.writeFile(`${BUILD}/renders/slide-${String(i+1).padStart(2,"0")}.png`,new Uint8Array(await png.arrayBuffer()));
  const layout=await slide.export({format:"layout"});
  await fs.writeFile(`${BUILD}/renders/slide-${String(i+1).padStart(2,"0")}.layout.json`,await layout.text());
}
const montage=await pres.export({format:"webp",montage:true,scale:1});
await fs.writeFile(`${BUILD}/montage.webp`,new Uint8Array(await montage.arrayBuffer()));
const pptx=await PresentationFile.exportPptx(pres);
await pptx.save(OUT);
console.log(OUT);
