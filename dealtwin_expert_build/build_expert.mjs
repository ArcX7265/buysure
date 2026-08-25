import fs from "node:fs/promises";
import { Presentation, PresentationFile } from "@oai/artifact-tool";

const BUILD="C:/Users/ADARSH/Documents/ChatGPT/IQOO Hackathon/dealtwin_consistent_build";
const OUT="C:/Users/ADARSH/Documents/ChatGPT/IQOO Hackathon/DealTwin_Final_Consistent_Selection_Deck_Team_ANKOR.pptx";
const C={bg:"#F2F7FB",white:"#FFFFFF",navy:"#061B33",navy2:"#0D2A49",ink:"#132A45",muted:"#5E7289",blue:"#287CF4",blue2:"#58A6FF",ice:"#DDEEFF",ice2:"#EAF4FF",cyan:"#51D2E7",green:"#13A66A",greenBg:"#DDF5EA",red:"#DF465B",redBg:"#FBE7EB",amber:"#DB9B1E",amberBg:"#FFF2D2",line:"#C5D6E7",purple:"#7C62D9",purpleBg:"#EEE9FF",code:"#07182C"};
const pres=Presentation.create({slideSize:{width:1280,height:720}});

function box(s,x,y,w,h,fill,r=true,line="none",lw=0,geometry=null){return s.shapes.add({geometry:geometry||(r?"roundRect":"rect"),position:{left:x,top:y,width:w,height:h},fill,line:{style:"solid",fill:line,width:lw},...(r&&!geometry?{borderRadius:"rounded-xl"}:{})});}
function text(s,v,x,y,w,h,fs=18,color=C.ink,b=false,a="left"){const q=s.shapes.add({geometry:"textbox",position:{left:x,top:y,width:w,height:h},fill:"none",line:{style:"solid",fill:"none",width:0}});q.text=v;q.text.style={fontSize:fs,color,bold:b,alignment:a};return q;}
function header(s,section,page){text(s,"TEAM ANKOR",58,27,190,22,13,C.navy,true);text(s,`SLIDE ${String(page).padStart(2,"0")}  •  ${section.toUpperCase()}`,720,27,500,22,13,C.blue,true,"right");box(s,58,59,1164,2,C.line,false);text(s,String(page).padStart(2,"0"),1170,675,48,18,12,C.muted,true,"right");}
function titleBlock(s,eyebrow,title,subtitle="",tw=1120){text(s,eyebrow.toUpperCase(),72,86,950,20,13,C.blue,true);text(s,title,72,118,tw,90,40,C.navy,true);if(subtitle)text(s,subtitle,72,210,1100,45,17,C.muted);}
function tag(s,v,x,y,w,fill=C.ice,color=C.navy){box(s,x,y,w,28,fill,true);text(s,v,x+8,y+5,w-16,18,12,color,true,"center");}
function arrow(s,x,y,w=32,color=C.blue,dir="→"){text(s,dir,x,y,w,28,24,color,true,"center");}
function hline(s,x,y,w,color=C.line,h=2){box(s,x,y,w,h,color,false);}
function vline(s,x,y,h,color=C.line,w=2){box(s,x,y,w,h,color,false);}
function node(s,x,y,w,h,title,detail,fill=C.white,accent=C.blue,align="left"){box(s,x,y,w,h,fill,true,C.line,1);box(s,x,y,5,h,accent,false);text(s,title,x+16,y+12,w-28,22,16,C.navy,true,align);if(detail)text(s,detail,x+16,y+39,w-28,h-48,13,C.muted,false,align);}
function note(s,lines=[]){if(!lines.length)return;try{s.notes=`[Sources]\n${lines.map(x=>`- ${x}`).join("\n")}\n[/Sources]`;}catch{}}

// 1 — Balanced project statement
{
 const s=pres.slides.add();s.background.fill=C.navy;
 text(s,"TEAM ANKOR",66,42,220,22,13,C.ice,true);
 text(s,"SLIDE 01  •  PROJECT STATEMENT",820,42,395,22,13,C.cyan,true,"right");
 hline(s,66,72,1182,"#274562",1);
 text(s,"DealTwin",66,100,470,78,60,C.white,true);
 text(s,"A phone-first assistant that verifies whether the final deal matches what the seller promised.",66,182,560,82,25,C.ice,true);
 tag(s,"MVP  ELECTRONICS / NO-COST EMI",66,300,270,C.blue,C.white);
 tag(s,"PRIVATE BY DEFAULT  •  ON DEVICE",348,300,278,C.greenBg,C.green);

 // System map, edges first
 arrow(s,805,181,28,C.cyan);arrow(s,972,181,28,C.cyan);arrow(s,1124,181,28,C.cyan);
 text(s,"HOW THE IDEA WORKS",690,95,480,22,14,C.cyan,true,"center");
 const top=[
  [675,"EVIDENCE","camera • audio • PDF",C.white,C.blue],
  [832,"CLAIM GRAPH","typed + provenance",C.ice,C.purple],
  [995,"VERIFIER","rules + true cost",C.greenBg,C.green],
  [1150,"LEDGER","status + sources",C.white,C.blue]
 ];
 top.forEach((n,i)=>{const w=i===3?98:(i===2?130:135);box(s,n[0],145,w,106,n[3],true,"#31506E",1);text(s,n[1],n[0]+8,161,w-16,21,14,n[4],true,"center");text(s,n[2],n[0]+8,194,w-16,34,13,C.navy,false,"center");});
 box(s,675,276,573,96,C.navy2,true,"#31506E",1);
 text(s,"CORE DIFFERENCE",698,293,130,20,13,C.cyan,true);
 text(s,"AI organizes evidence. Deterministic rules calculate cost and expose uncertainty.",836,290,380,48,17,C.white,true);
 text(s,"Every verdict links back to its exact source.",698,341,515,20,14,C.ice);

 hline(s,66,424,1182,"#274562",1);
 text(s,"WHAT THE USER GETS",66,452,280,22,14,C.cyan,true);
 const outcomes=[
  [66,"01","CAPTURE PROOF","Save the ad, chat, call, or PDF before purchase.",C.blue],
  [455,"02","VERIFY THE FINAL DEAL","Compare the invoice, EMI terms, and benefits.",C.purple],
  [844,"03","ACT WITH CLARITY","See what changed and the real financial impact.",C.green]
 ];
 outcomes.forEach(o=>{text(s,o[1],o[0],492,42,20,14,o[4],true);text(s,o[2],o[0]+44,490,285,22,16,C.white,true);text(s,o[3],o[0]+44,526,315,58,15,C.ice);});
 box(s,66,618,1182,42,"#0B2745",true,"#31506E",1);
 text(s,"PHONE-FIRST  Capture → verify → explain entirely on iQOO",90,629,610,20,15,C.white,true);
 text(s,"OFFICE KIT  profiling • logs • test assets",760,629,460,20,14,C.cyan,true,"right");
}

// 2 — Evidence graph and temporal reconciliation
{
 const s=pres.slides.add();s.background.fill=C.bg;header(s,"Problem + core idea",2);
 titleBlock(s,"Problem first","A deal is promised in one place, but documented, charged, and serviced through entirely different sources.","DealTwin converts both sides into comparable claims, identifies what changed, and explains the financial impact with source evidence.");
 box(s,72,262,535,66,C.redBg,true,"#F3C7CF",1);text(s,"PROBLEM",92,276,100,18,13,C.red,true);text(s,"People cannot manually reconcile scattered promises with final terms.",190,273,390,38,15,C.navy,true);
 box(s,621,262,565,66,C.greenBg,true,"#BDE7D3",1);text(s,"IDEA",641,276,80,18,13,C.green,true);text(s,"Build a promise ledger that compares each claim and keeps the proof attached.",720,273,440,38,15,C.navy,true);
 text(s,"PROMISE EVIDENCE",72,347,270,20,13,C.blue,true);text(s,"COMPARABLE CLAIM",423,347,270,20,13,C.purple,true);text(s,"FINAL EVIDENCE",748,347,270,20,13,C.blue,true);text(s,"VERDICT",1074,347,120,20,13,C.muted,true,"center");
 // edges behind nodes
 const ys=[376,446,516];
 ys.forEach(y=>{hline(s,292,y+34,130,C.blue,2);arrow(s,396,y+20,28,C.blue);hline(s,623,y+34,125,C.purple,2);arrow(s,720,y+20,28,C.purple);hline(s,948,y+34,126,C.muted,2);arrow(s,1046,y+20,28,C.muted);});
 const rows=[
  ["Ad screenshot","no-cost EMI","financing_cost = 0","Invoice §4","processing_fee = 999","CHANGED",C.redBg,C.red,"CONTRADICTS"],
  ["Recorded with consent","free insurance","insurance.benefit = FREE","Invoice + KFS","no policy reference","MISSING",C.redBg,C.red,"NO MATCH"],
  ["Seller chat","2-year warranty","warranty.months = 24","Warranty card","coverage = 24 months","KEPT",C.greenBg,C.green,"SUPPORTS"],
 ];
 rows.forEach((r,i)=>{const y=ys[i];node(s,72,y,220,68,r[0],r[1],i%2?C.white:C.ice2,C.blue);node(s,423,y,200,68,r[2],`source_rank: ${i===2?"seller+card":"seller"}`,C.purpleBg,C.purple);node(s,748,y,200,68,r[3],r[4],i%2?C.white:C.ice2,i===2?C.green:C.amber);box(s,1074,y+11,112,45,r[6],true);text(s,r[5],1083,y+24,94,18,13,r[7],true,"center");tag(s,r[8],628,y+18,115,i===2?C.greenBg:(i===1?C.amberBg:C.redBg),i===2?C.green:(i===1?C.amber:C.red));});
 box(s,72,612,1114,48,C.navy,true);
 text(s,"PLAIN-LANGUAGE RESULT",94,627,180,18,13,C.cyan,true);text(s,"The user sees what was kept, changed or omitted—plus the evidence needed to question it.",280,624,880,23,15,C.white,true);
}

// 3 — Branched human-in-the-loop workflow
{
 const s=pres.slides.add();s.background.fill=C.bg;header(s,"User workflow",3);
 titleBlock(s,"One guided phone workflow turns scattered proof into a simple verdict","The app captures, confirms, analyzes and explains; when evidence is weak, it asks instead of guessing.");
 const laneY=[292,360,428,496,564];
 const laneNames=["USER / UI","PIPELINE COORDINATOR","LOCAL AI","VERIFICATION CORE","DATA + OUTPUT"];
 laneY.forEach((y,i)=>{text(s,laneNames[i],72,y+19,170,20,13,i===2?C.purple:(i===3?C.green:C.muted),true);hline(s,230,y+54,956,C.line,1);});
 // Horizontal process arrows before nodes
 [390,565,740,915].forEach(x=>arrow(s,x,298,30));
 const steps=[
  [245,"CAPTURE","camera / share / file"],[420,"CONSENT","audio opt-in"],[595,"REVIEW","crop + source type"],[770,"PROCESS","start local job"],[945,"RESULT","ledger + action"]
 ];
 steps.forEach((v,i)=>{box(s,v[0],292,145,54,i===4?C.greenBg:(i%2?C.ice2:C.white),true,C.line,1);text(s,v[1],v[0]+10,303,125,18,14,i===4?C.green:C.navy,true,"center");text(s,v[2],v[0]+10,324,125,15,11,C.muted,false,"center");});
 // coordinator row
 [[245,"INGEST + HASH"],[420,"SCHEDULE"],[595,"RETRY POLICY"],[770,"STATE MACHINE"],[945,"PUBLISH EVENT"]].forEach((v,i)=>tag(s,v[1],v[0],378,145,i===3?C.purpleBg:C.ice,i===3?C.purple:C.navy));
 // local AI row
 [[245,"OCR / STT"],[420,"CLAIM JSON"],[595,"EMBEDDINGS"],[770,"TOP-k RETRIEVAL"]].forEach((v,i)=>tag(s,v[1],v[0],446,145,i%2?C.purpleBg:C.ice2,i%2?C.purple:C.navy));
 // verification row with branch
 tag(s,"NORMALIZE",245,514,135,C.ice,C.navy);arrow(s,382,513,28);tag(s,"SCORE S(p,c)",412,514,145,C.purpleBg,C.purple);arrow(s,558,513,28);
 box(s,595,500,92,58,C.amberBg,false,C.amber,1,"diamond");text(s,"S ≥ τ?",610,519,62,18,14,C.amber,true,"center");
 arrow(s,688,513,28);tag(s,"CONSTRAINTS",720,514,145,C.greenBg,C.green);arrow(s,868,513,28);tag(s,"CLASSIFY",900,514,145,C.ice,C.navy);
 text(s,"NO",608,564,40,18,11,C.red,true,"center");vline(s,640,555,30,C.red,2);arrow(s,624,578,32,C.red,"↓");tag(s,"ASK USER / UNVERIFIABLE",550,606,210,C.amberBg,C.amber);
 // data/output row
 tag(s,"EvidenceStore",245,582,140,C.white,C.navy);tag(s,"ClaimGraph",405,582,140,C.white,C.navy);tag(s,"AuditLog",780,582,120,C.white,C.navy);tag(s,"Promise Ledger",920,582,160,C.greenBg,C.green);
 text(s,"IN PLAIN ENGLISH",72,666,150,18,12,C.blue,true);text(s,"Capture the promise and final bill → confirm only if needed → receive kept, changed, and missing terms with evidence.",225,663,930,22,14,C.navy,true);
}

// 4 — Detailed component and deployment architecture
{
 const s=pres.slides.add();s.background.fill=C.bg;header(s,"System architecture",4);
 titleBlock(s,"Five layers keep the user experience simple while the complex work remains testable","Each layer has one job: capture, coordinate, understand, decide, and preserve proof—even without network access.");
 box(s,72,278,1116,338,"none",true,C.blue,2);text(s,"iQOO DEVICE TRUST BOUNDARY",90,287,270,18,12,C.blue,true);
 // vertical dependency arrows before nodes
 [334,401,468,535].forEach(y=>{arrow(s,621,y,32,C.blue,"↓");});
 const layers=[
  ["UI LAYER",315,["CaptureScreen","ReviewScreen","LedgerScreen"],C.ice2,C.blue],
  ["APPLICATION",382,["PipelineCoordinator","CoroutineWorker","UI state reducer"],C.white,C.cyan],
  ["INFERENCE",449,["Bundled OCR","Speech adapter","LLM parser","Embedding model"],C.purpleBg,C.purple],
  ["DOMAIN CORE",516,["Canonicalizer","MatchEngine","ConstraintEngine","CostEngine"],C.greenBg,C.green],
  ["DATA LAYER",583,["EvidenceStore","ClaimGraph","AuditLog","DomainPack"],C.white,C.amber]
 ];
 layers.forEach((l,i)=>{text(s,l[0],92,l[1]+11,135,20,13,l[4],true);const start=240;const gap=(920-(l[2].length-1)*14)/l[2].length;l[2].forEach((v,j)=>{box(s,start+j*(gap+14),l[1],gap,43,l[3],true,C.line,1);text(s,v,start+j*(gap+14)+8,l[1]+12,gap-16,18,13,C.navy,true,"center");});});
 // external runtime strip
 box(s,72,632,1116,42,C.navy,true);
 text(s,"DEVICE / RUNTIME",94,645,160,18,12,C.cyan,true);text(s,"CameraX  •  ML Kit OCR  •  QNN / NNAPI / CPU adapter  •  Android Keystore  •  Room",255,642,720,22,15,C.white,true);
 tag(s,"OFFICE KIT",1010,639,150,C.ice,C.navy);
 note(s,[
  "Android architecture guidance: https://developer.android.com/topic/architecture",
  "CameraX image capture: https://developer.android.com/media/camera/camerax/take-photo",
  "ML Kit on-device text recognition: https://developers.google.com/ml-kit/vision/text-recognition/v2/android",
  "Android Keystore: https://developer.android.com/privacy-and-security/keystore",
  "ONNX Runtime QNN execution provider: https://onnxruntime.ai/docs/execution-providers/QNN-ExecutionProvider.html"
 ]);
}

// 5 — Matching algorithm and verdict state machine
{
 const s=pres.slides.add();s.background.fill=C.bg;header(s,"Decision logic",5);
 titleBlock(s,"AI finds the right claims; deterministic rules decide the money","This prevents a fluent model from inventing a contractual or financial conclusion.");
 text(s,"CLAIM-PAIR STATE MACHINE",72,276,300,20,13,C.blue,true);
 // flow edges first
 vline(s,216,343,31,C.blue,2);arrow(s,200,365,32,C.blue,"↓");vline(s,216,431,31,C.blue,2);arrow(s,200,453,32,C.blue,"↓");
 hline(s,310,408,112,C.red,2);arrow(s,397,394,28,C.red);hline(s,310,496,112,C.amber,2);arrow(s,397,482,28,C.amber);
 hline(s,310,584,112,C.green,2);arrow(s,397,570,28,C.green);
 box(s,108,302,216,42,C.ice2,true,C.line,1);text(s,"promise claim p",128,314,176,18,15,C.navy,true,"center");
 box(s,108,374,216,68,C.purpleBg,false,C.purple,1,"diamond");text(s,"max S(p,c) ≥ τ ?",146,397,140,20,14,C.purple,true,"center");
 box(s,108,462,216,68,C.amberBg,false,C.amber,1,"diamond");text(s,"evidence confidence ≥ γ ?",140,485,152,20,13,C.amber,true,"center");
 box(s,108,550,216,68,C.greenBg,false,C.green,1,"diamond");text(s,"constraints equivalent ?",142,573,148,20,13,C.green,true,"center");
 tag(s,"MISSING",432,394,118,C.redBg,C.red);text(s,"no viable final claim",561,399,180,18,13,C.muted);
 tag(s,"UNVERIFIABLE",432,482,150,C.amberBg,C.amber);text(s,"request confirmation",594,487,165,18,13,C.muted);
 tag(s,"KEPT",432,570,100,C.greenBg,C.green);text(s,"same value + conditions",544,575,190,18,13,C.muted);
 text(s,"constraint mismatch",126,629,180,18,12,C.red,true,"center");arrow(s,326,624,34,C.red);tag(s,"CHANGED / CONTRADICTED",365,620,220,C.redBg,C.red);

 box(s,770,276,418,368,C.code,true);
 text(s,"CONFIGURABLE MATCH SCORE",796,298,350,20,13,C.cyan,true);
 text(s,"S(p,c) =",796,334,115,24,18,C.white,true);
 text(s,"0.35 semantic\n+ 0.20 entity/value\n+ 0.15 condition overlap\n+ 0.15 temporal compatibility\n+ 0.15 source authority",914,330,235,115,16,C.white);
 hline(s,796,462,350,"#31506E",1);
 text(s,"TRUE PAYABLE COST",796,482,200,20,13,C.cyan,true);
 text(s,"base price\n+ explicit fees\n+ financing cost\n+ lost discounts\n− confirmed benefits",796,514,190,112,16,C.white);
 text(s,"EXPLAIN(result)",1000,494,150,20,13,C.greenBg,true,"center");text(s,"status\nevidence_ids[]\nopposing_ids[]\ncalculation_steps[]",1000,530,150,92,14,C.white,false,"center");
 text(s,"IN PLAIN ENGLISH",72,667,150,18,12,C.blue,true);text(s,"Low confidence → ask the user. Conflicting proof → show both sides. Matching terms → mark as kept.",225,664,820,22,14,C.navy,true);
}

// 6 — Build/runtime plan with Gantt and controls
{
 const s=pres.slides.add();s.background.fill=C.bg;header(s,"Implementation plan",6);
 titleBlock(s,"A 25-hour plan prioritizes one complete mobile journey before model sophistication","Every risky dependency has a fallback, so the demo remains usable without cloud access.");
 text(s,"RUNTIME MATRIX",72,276,220,20,13,C.blue,true);text(s,"PRIMARY",322,276,120,20,12,C.muted,true);text(s,"FALLBACK",478,276,130,20,12,C.muted,true);text(s,"FAILURE CONTRACT",626,276,180,20,12,C.muted,true);
 const matrix=[
  ["OCR","Bundled ML Kit","manual crop + retry","never accept empty output"],
  ["Claim parser","quantized local model","regex/schema parser","invalid JSON rejected"],
  ["Embeddings","QNN / NNAPI","CPU execution","same vector interface"],
  ["Speech","offline adapter","typed confirmation","explicit consent only"],
  ["Storage","Room + AES-GCM","in-memory demo vault","hash every artifact"]
 ];
 matrix.forEach((r,i)=>{const y=304+i*50;hline(s,72,y+44,735,C.line,1);text(s,r[0],72,y+10,225,20,15,C.navy,true);text(s,r[1],322,y+10,145,20,14,C.ink);text(s,r[2],478,y+10,140,20,14,C.ink);text(s,r[3],626,y+10,180,20,13,C.muted);});

 text(s,"25-HOUR ACTIVE BUILD WINDOW",850,276,330,20,13,C.blue,true);
 const gx=850,gw=332;hline(s,gx,315,gw,C.line,2);["11:00","16:00","22:00","06:30","12:00"].forEach((v,i)=>text(s,v,gx+i*83,320,70,18,11,C.muted,true,i===4?"right":"left"));
 const tasks=[
  ["Vertical slice",0,88,C.red],["OCR + parser",55,115,C.red],["Model package",140,74,C.green],["Verifier + vault",185,98,C.red],["Profile + harden",250,82,C.green]
 ];
 tasks.forEach((t,i)=>{const y=350+i*44;text(s,t[0],850,y,112,18,13,C.ink,true);box(s,962+t[1]*0.64,y,Math.max(38,t[2]*0.64),24,t[3],true);});
 tag(s,"RED  PHONE-FIRST",850,580,160,C.redBg,C.red);tag(s,"GREEN  BOTH",1020,580,145,C.greenBg,C.green);
 box(s,72,592,735,66,C.navy,true);text(s,"SECURITY + RELIABILITY",94,608,220,18,13,C.cyan,true);text(s,"Keystore-managed key • no background recording • append-only audit • BigDecimal arithmetic • low-confidence fail-closed",308,606,470,34,14,C.white,true);
 box(s,850,622,332,36,C.ice2,true,C.line,1);text(s,"OFFICE KIT  mirror • logs • test assets • remote input",864,632,304,17,12,C.navy,true,"center");
 note(s,[
  "WorkManager supports persistent chained work: https://developer.android.com/reference/androidx/work/WorkManager",
  "Android Keystore protects non-exportable key material: https://developer.android.com/privacy-and-security/keystore",
  "ONNX Runtime mobile execution-provider guidance: https://onnxruntime.ai/docs/tutorials/mobile/"
 ]);
}

// 7 — Conclusion: quality engineering and domain-pack scalability
{
 const s=pres.slides.add();s.background.fill=C.bg;header(s,"Conclusion + scalability",7);
 titleBlock(s,"DealTwin can expand from EMI deals to insurance, lending, and telecom without rewriting the engine","Why it can win: a useful phone-first product, transparent AI, and a clear path to many users.");
 text(s,"PROTOTYPE QUALITY GATES",72,276,280,20,13,C.blue,true);
 const tests=[
  ["Ingestion","4 source types","hash + locator persisted"],
  ["Extraction","scripted EMI set","valid claim schema"],
  ["Matching","kept/changed/missing","expected status + evidence"],
  ["Cost engine","fee/discount cases","exact BigDecimal result"],
  ["Privacy","offline default","0 raw uploads"]
 ];
 text(s,"TEST",72,308,150,18,12,C.muted,true);text(s,"FIXTURE",235,308,170,18,12,C.muted,true);text(s,"PASS CONDITION",425,308,220,18,12,C.muted,true);
 tests.forEach((r,i)=>{const y=334+i*48;hline(s,72,y+39,590,C.line,1);text(s,r[0],72,y+8,150,20,15,C.navy,true);text(s,r[1],235,y+8,170,20,14,C.ink);text(s,r[2],425,y+8,220,20,14,i===4?C.green:C.muted,i===4);});

 text(s,"DOMAIN-PACK INTERFACE",710,276,300,20,13,C.blue,true);
 const packs=["ontology.yaml","claim.schema.json","rules.kts","few-shot examples"];
 packs.forEach((v,i)=>{box(s,710,318+i*54,210,38,i%2?C.white:C.ice2,true,C.line,1);text(s,v,724,328+i*54,182,18,14,C.navy,true,"center");arrow(s,928,324+i*54,26,C.blue);});
 box(s,970,318,218,200,C.navy,true);text(s,"SAME ENGINE",992,340,174,20,14,C.cyan,true,"center");text(s,"Claim parser\nEvidence graph\nMatch engine\nConstraint engine\nAudit + explanation",992,377,174,116,16,C.white,true,"center");
 text(s,"Electronics EMI",710,546,130,18,13,C.navy,true);arrow(s,838,541,24);text(s,"Insurance",868,546,90,18,13,C.navy,true);arrow(s,957,541,24);text(s,"Lending",987,546,80,18,13,C.navy,true);arrow(s,1063,541,24);text(s,"Telecom",1090,546,90,18,13,C.navy,true);
 box(s,72,592,1116,66,C.navy,true);
 text(s,"WHY IT CAN WIN",94,608,150,18,13,C.cyan,true);text(s,"High-frequency consumer problem  •  measurable savings  •  traceable AI  •  reusable domain packs",250,605,910,22,16,C.white,true,"center");
 text(s,"Rubric coverage: product quality • novelty • technical depth • phone use • Office Kit • demo",250,632,910,18,12,C.ice,false,"center");
}

// 8 — Dense closing proof
{
 const s=pres.slides.add();s.background.fill=C.navy;
 text(s,"TEAM ANKOR",66,43,220,22,13,C.ice,true);text(s,"SLIDE 08  •  CLOSING + LIVE DEMO",795,43,420,22,13,C.cyan,true,"right");
 hline(s,66,72,1118,"#274562",1);
 text(s,"Thank you.",66,116,520,70,56,C.white,true);
 text(s,"A promise becomes defensible only when it is structured, verified, and linked back to evidence.",66,202,545,90,26,C.ice,true);
 box(s,66,324,545,198,C.navy2,true,"#31506E",1);
 text(s,"WHAT THE LIVE DEMO PROVES",92,346,460,20,14,C.cyan,true);
 const proof=["Capture an ad and an invoice on the phone","Build canonical claims locally","Reconcile the promise with final terms","Show ₹2,148 in added cost with source locators","Generate a neutral clarification card"];
 proof.forEach((v,i)=>{text(s,String(i+1).padStart(2,"0"),92,384+i*26,32,18,12,i===3?C.red:C.blue,true);text(s,v,134,382+i*26,400,20,14,i===3?C.white:C.ice,i===3);});
 tag(s,"QUESTIONS  •  ARCHITECTURE  •  LIVE DEMO",66,562,360,C.blue,C.white);

 // right compact end-to-end trace
 text(s,"END-TO-END TRACE",684,94,500,22,14,C.cyan,true,"center");
 const trace=[
  ["EVIDENCE","sha256 + source locator",C.white,C.blue],
  ["CLAIM GRAPH","typed value + condition + authority",C.purpleBg,C.purple],
  ["VERIFIER","retrieval → constraints → cost",C.greenBg,C.green],
  ["LEDGER","status + explanation + action",C.white,C.blue]
 ];
 trace.forEach((v,i)=>{const y=138+i*100;box(s,720,y,430,66,v[2],true);text(s,v[0],740,y+13,128,18,14,v[3],true);text(s,v[1],872,y+13,250,36,15,C.navy,true,"right");if(i<3)arrow(s,916,y+68,34,C.cyan,"↓");});
 box(s,684,556,500,70,"#0B2745",true,"#31506E",1);text(s,"DEFAULT",706,573,90,18,12,C.cyan,true);text(s,"local evidence • deterministic cost • explicit uncertainty",805,570,355,24,15,C.white,true,"right");
 text(s,"DealTwin  •  Remember the promise. Verify the deal.",66,655,560,22,16,C.white,true);text(s,"8 / 8",1135,675,55,18,12,C.ice,true,"right");
}

await fs.mkdir(`${BUILD}/renders`,{recursive:true});
for(const [i,slide] of pres.slides.items.entries()){
 const png=await pres.export({slide,format:"png",scale:1});await fs.writeFile(`${BUILD}/renders/slide-${String(i+1).padStart(2,"0")}.png`,new Uint8Array(await png.arrayBuffer()));
 const layout=await slide.export({format:"layout"});await fs.writeFile(`${BUILD}/renders/slide-${String(i+1).padStart(2,"0")}.layout.json`,await layout.text());
}
const montage=await pres.export({format:"webp",montage:true,scale:1});await fs.writeFile(`${BUILD}/montage.webp`,new Uint8Array(await montage.arrayBuffer()));
const pptx=await PresentationFile.exportPptx(pres);await pptx.save(OUT);console.log(OUT);
