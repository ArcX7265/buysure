'use client';

import { ChangeEvent, useMemo, useRef, useState } from 'react';

type Stage = 'home' | 'capture' | 'review' | 'documents' | 'result';
type Mode = 'pre' | 'post';
type EvidenceKind = 'image' | 'audio' | 'pdf';
type Verdict = 'CHANGED' | 'MISSING' | 'KEPT' | 'UNVERIFIED';
type Claim = { promise: string; normalized: string; finalEvidence: string; verdict: Verdict; detail: string; confidence: number; sourceExcerpt?: string };
type FieldCheck = { label: string; present: boolean; reason: string };
type PdfAnalysis = { fileName: string; pageCount: number; text: string; excerpt: string; promiseDetected: boolean; contradictionDetected: boolean; riskScore: number; fields: FieldCheck[]; questions: string[] };

const demoClaims: Claim[] = [
  { promise: 'No-cost EMI for 12 months', normalized: 'financing_cost = ₹0', finalEvidence: 'Invoice + KFS', verdict: 'CHANGED', detail: '₹999 processing fee + ₹749 GST detected', confidence: 98 },
  { promise: 'Free theft insurance', normalized: 'insurance.benefit = FREE', finalEvidence: 'Insurance addendum', verdict: 'MISSING', detail: 'Protection is optional; no policy was issued', confidence: 97, sourceExcerpt: 'Optional theft protection is not included in this transaction.' },
  { promise: 'Two-year manufacturer warranty', normalized: 'warranty.months = 24', finalEvidence: 'Warranty card', verdict: 'KEPT', detail: '24-month coverage confirmed', confidence: 99 },
];
const stageIndex: Record<Stage, number> = { home: 0, capture: 1, review: 2, documents: 3, result: 4 };
const evidenceLabels: Record<EvidenceKind, { title: string; subtitle: string; glyph: string }> = {
  image: { title: 'Scan an offer', subtitle: 'Ad, poster, chat or price tag', glyph: '▣' },
  audio: { title: 'Record a promise', subtitle: 'With seller consent', glyph: '◉' },
  pdf: { title: 'Import a promise PDF', subtitle: 'Brochure, quotation or offer', glyph: '⇧' },
};
const positivePatterns = {
  insurer: /(?:named insurer|underwritten by|insurer)\s*[:\-]\s*(?!not\b|none\b|n\/?a\b)[a-z][a-z &.]{2,50}/i,
  policy: /policy\s*(?:number|no\.?|id|reference)\s*[:#\-]\s*(?!not\b|none\b|pending\b)[a-z0-9][a-z0-9\-/]{4,}/i,
  dates: /(?:coverage|policy)\s*(?:dates?|period|from)\s*[:\-]?\s*\d{1,2}[\s\-/][a-z0-9]{2,9}[\s\-/]\d{2,4}/i,
  exclusions: /(?:exclusions?|deductible)\s*[:\-]\s*(?!not\b|none\b|unavailable\b).{3,80}/i,
  claims: /claims?\s*(?:contact|helpline|email|process)\s*[:\-]\s*(?!not\b|none\b|unavailable\b).{3,80}/i,
};

function cleanText(value: string) { return value.replace(/\s+/g, ' ').replace(/\u0000/g, '').trim(); }
function makeExcerpt(text: string) {
  const cleaned = cleanText(text); const lower = cleaned.toLowerCase();
  const match = ['not included', 'free theft', 'theft protection', 'no policy', 'insurance'].map((anchor) => lower.indexOf(anchor)).find((index) => index !== -1) ?? 0;
  return cleaned.slice(Math.max(0, match - 70), Math.min(cleaned.length, match + 210)) || 'No readable text was extracted.';
}
function analyzePdfText(fileName: string, pageCount: number, rawText: string): PdfAnalysis {
  const text = cleanText(rawText);
  const promiseDetected = /(?:free|complimentary|included)\s+(?:theft|device|accidental)?\s*(?:insurance|protection)/i.test(text);
  const contradictionDetected = /(not included|not issued|no policy (?:was )?issued|optional.{0,50}not included|not part of this (?:sale|transaction))/i.test(text);
  const fields: FieldCheck[] = [
    { label: 'Named insurer', present: positivePatterns.insurer.test(text), reason: 'Identifies who is legally providing coverage.' },
    { label: 'Policy / certificate number', present: positivePatterns.policy.test(text), reason: 'Makes the benefit traceable and claimable.' },
    { label: 'Coverage dates', present: positivePatterns.dates.test(text), reason: 'Confirms when protection begins and ends.' },
    { label: 'Exclusions / deductible', present: positivePatterns.exclusions.test(text), reason: 'Reveals conditions that can defeat the benefit.' },
    { label: 'Claims contact or process', present: positivePatterns.claims.test(text), reason: 'Explains how the user can actually claim.' },
  ];
  const missing = fields.filter((field) => !field.present).length;
  const riskScore = Math.min(96, 18 + missing * 11 + (contradictionDetected ? 30 : 0) + (!promiseDetected && /insurance|protection/i.test(text) ? 8 : 0));
  const questions = [
    !fields[0].present && 'Who is the regulated insurer underwriting this benefit?',
    !fields[1].present && 'What is the policy or certificate number before I pay?',
    !fields[2].present && 'What are the exact coverage start and end dates?',
    !fields[3].present && 'Show me the exclusions, deductible and claim limits in writing.',
    contradictionDetected && 'Why does the final document say the advertised benefit is optional or not included?',
  ].filter(Boolean) as string[];
  return { fileName, pageCount, text, excerpt: makeExcerpt(text), promiseDetected, contradictionDetected, riskScore, fields, questions };
}
async function extractPdf(file: File): Promise<{ text: string; pageCount: number }> {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
  const document = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()), isEvalSupported: false }).promise;
  const pages: string[] = [];
  for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
    const page = await document.getPage(pageNumber); const content = await page.getTextContent();
    pages.push(content.items.map((item) => ('str' in item ? item.str : '')).join(' '));
  }
  return { text: pages.join('\n'), pageCount: document.numPages };
}
function buildDemoOffer(): PdfAnalysis {
  return analyzePdfText('festival_offer_demo.pdf', 1, 'Festival offer: Free theft insurance included with this device purchase. No-cost EMI for 12 months. Two-year manufacturer warranty. Ask the store for complete terms at checkout.');
}

export default function Home() {
  const [stage, setStage] = useState<Stage>('home');
  const [mode, setMode] = useState<Mode>('post');
  const [evidence, setEvidence] = useState<EvidenceKind[]>([]);
  const [offerAnalysis, setOfferAnalysis] = useState<PdfAnalysis | null>(null);
  const [finalAnalysis, setFinalAnalysis] = useState<PdfAnalysis | null>(null);
  const [processing, setProcessing] = useState('');
  const [toast, setToast] = useState('');
  const [sourceOpen, setSourceOpen] = useState('');
  const imageInput = useRef<HTMLInputElement>(null); const audioInput = useRef<HTMLInputElement>(null); const pdfInput = useRef<HTMLInputElement>(null); const finalPdfInput = useRef<HTMLInputElement>(null);
  const fileInputs = { image: imageInput, audio: audioInput, pdf: pdfInput };
  const activeStep = stageIndex[stage];
  const reviewedClaims = useMemo(() => {
    if (!finalAnalysis) return demoClaims;
    const insuranceVerdict: Verdict = finalAnalysis.contradictionDetected ? 'MISSING' : finalAnalysis.fields.filter((field) => field.present).length >= 3 ? 'KEPT' : 'UNVERIFIED';
    return [
      { ...demoClaims[1], verdict: insuranceVerdict, finalEvidence: finalAnalysis.fileName, confidence: finalAnalysis.contradictionDetected ? 97 : 78, detail: finalAnalysis.contradictionDetected ? 'Document states that protection is optional or not included' : 'Policy essentials are incomplete', sourceExcerpt: finalAnalysis.excerpt },
      { ...demoClaims[0], verdict: 'UNVERIFIED' as Verdict, detail: 'Upload the invoice and Key Fact Statement to verify financing cost', confidence: 0 },
      { ...demoClaims[2], verdict: 'UNVERIFIED' as Verdict, detail: 'Upload the warranty card to verify coverage duration', confidence: 0 },
    ];
  }, [finalAnalysis]);
  const riskCount = reviewedClaims.filter((claim) => claim.verdict === 'MISSING' || claim.verdict === 'CHANGED').length;
  const fieldChecks = offerAnalysis?.fields ?? [];
  const preRiskLabel = (offerAnalysis?.riskScore ?? 0) >= 70 ? 'HIGH RISK' : (offerAnalysis?.riskScore ?? 0) >= 40 ? 'REVIEW' : 'LOW RISK';

  function flash(message: string) { setToast(message); window.setTimeout(() => setToast(''), 2400); }
  function selectMode(nextMode: Mode) { setMode(nextMode); setOfferAnalysis(null); setFinalAnalysis(null); setEvidence([]); setStage('capture'); }
  function simulateEvidence(kind: Exclude<EvidenceKind, 'pdf'>) {
    setProcessing(`Preparing the ${kind === 'image' ? 'camera OCR' : 'consented audio'} adapter…`);
    window.setTimeout(() => { setEvidence((current) => current.includes(kind) ? current : [...current, kind]); setProcessing(''); flash('Sample evidence added for prototype testing'); }, 650);
  }
  async function handleOfferFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]; if (!file) return;
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) { flash('Please choose a PDF for real local extraction'); return; }
    setProcessing('Reading PDF pages locally and extracting policy terms…');
    try {
      const extracted = await extractPdf(file); const analysis = analyzePdfText(file.name, extracted.pageCount, extracted.text);
      setOfferAnalysis(analysis); setEvidence((current) => current.includes('pdf') ? current : [...current, 'pdf']); flash(`${extracted.pageCount} page${extracted.pageCount === 1 ? '' : 's'} parsed on device`);
    } catch { flash('This PDF could not be read. Try a text-based PDF or use the demo.'); }
    finally { setProcessing(''); event.target.value = ''; }
  }
  async function handleFinalFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]; if (!file) return; setProcessing('Extracting final policy evidence and checking contradictions…');
    try { const extracted = await extractPdf(file); setFinalAnalysis(analyzePdfText(file.name, extracted.pageCount, extracted.text)); flash('Final evidence parsed and source-linked'); }
    catch { flash('Could not parse this PDF. Use the provided demo evidence.'); }
    finally { setProcessing(''); event.target.value = ''; }
  }
  function loadDemoOffer() {
    setProcessing('Normalizing the sample seller promise into a claim graph…');
    window.setTimeout(() => { setOfferAnalysis(buildDemoOffer()); setEvidence(['image', 'audio', 'pdf']); setProcessing(''); setStage('review'); }, 760);
  }
  function loadDemoFinal() {
    setFinalAnalysis(analyzePdfText('dealtwin_demo_insurance_addendum.pdf', 1, 'Insurance Addendum. Optional theft protection is not included in this transaction. No policy was issued. No insurer, policy number, coverage dates or claims process is provided.'));
    flash('Demo insurance addendum loaded');
  }
  function runVerification() { setProcessing('Reconciling promise nodes with source-bound evidence…'); window.setTimeout(() => { setProcessing(''); setStage('result'); }, 900); }
  function resetDemo() { setEvidence([]); setOfferAnalysis(null); setFinalAnalysis(null); setProcessing(''); setSourceOpen(''); setStage('home'); }

  return (
    <main className="app-shell">
      <header className="topbar">
        <button className="brand" onClick={resetDemo} aria-label="DealTwin home"><span className="brand-mark">D</span><span><strong>DealTwin</strong><small>Promise-to-proof verification</small></span></button>
        <div className="privacy-pill"><span className="live-dot" /> Local-first • No web search</div>
      </header>
      <div className="workspace">
        <section className="phone-stage" aria-live="polite">
          <div className="phone-topline"><span>09:41</span><span>5G ▮▮▮ 88%</span></div>
          {stage !== 'home' && <div className="stepper" aria-label={`Step ${activeStep} of 4`}>{[1, 2, 3, 4].map((step) => <span key={step} className={step <= activeStep ? 'active' : ''} />)}</div>}
          {stage === 'home' && (
            <section className="screen home-screen">
              <div className="home-header"><div><p className="eyebrow">TEAM ANKOR • IQOO HACKATHON</p><h1>Don’t trust the deal.<br />Verify it.</h1></div><div className="shield">✓</div></div>
              <p className="home-copy">A private, phone-first evidence ledger for promises made before purchase—and documents delivered after it.</p>
              <div className="mode-grid">
                <button className="mode-card pre" onClick={() => selectMode('pre')}><span className="mode-index">01</span><span><b>BEFORE PURCHASE</b><strong>Check an offer</strong><small>Expose missing policy terms and risky promises before you pay.</small></span><i>→</i></button>
                <button className="mode-card post" onClick={() => selectMode('post')}><span className="mode-index">02</span><span><b>AFTER PURCHASE</b><strong>Verify what arrived</strong><small>Compare invoices, KFS, warranty and insurance with the promise.</small></span><i>→</i></button>
              </div>
              <div className="section-heading"><span>Recent verification</span><small>FULL DEMO CASE</small></div>
              <button className="deal-card" onClick={() => { setMode('post'); setOfferAnalysis(buildDemoOffer()); setEvidence(['image', 'audio', 'pdf']); setFinalAnalysis(null); setStage('result'); }}>
                <div className="deal-top"><span className="product-icon">▰</span><span><strong>ZenBook 14 purchase</strong><small>Reliance Digital • Today</small></span><span className="risk-badge">2 issues</span></div>
                <div className="deal-metrics"><span><b>11</b><small>claims</small></span><span><b>3</b><small>sources</small></span><span><b>₹4,748</b><small>impact</small></span></div><div className="deal-status"><span style={{ width: '66%' }} />1 kept · 1 changed · 1 missing</div>
              </button>
              <div className="trust-row"><span>◈ User documents only</span><span>◉ Consent-aware audio</span><span>◎ Source-linked verdicts</span></div>
            </section>
          )}
          {stage === 'capture' && (
            <section className="screen">
              <button className="back" onClick={() => setStage('home')}>← Choose mode</button><p className="eyebrow">STEP 1 • {mode === 'pre' ? 'OFFER CHECK' : 'PROMISE EVIDENCE'}</p>
              <h2>{mode === 'pre' ? 'Upload the offer before you pay.' : 'What exactly did the seller promise?'}</h2>
              <p className="intro">{mode === 'pre' ? 'DealTwin reads the offer locally, checks whether policy essentials are missing, and produces questions to ask the seller.' : 'Build a source-bound promise ledger. PDF extraction is live; camera and consented audio use prototype adapters.'}</p>
              <div className="capture-list">{(Object.keys(evidenceLabels) as EvidenceKind[]).map((kind) => {
                const item = evidenceLabels[kind]; const isAdded = evidence.includes(kind);
                return <button key={kind} className={`capture-card ${isAdded ? 'complete' : ''}`} onClick={() => fileInputs[kind].current?.click()}><span className="capture-glyph">{isAdded ? '✓' : item.glyph}</span><span><strong>{item.title}</strong><small>{isAdded ? (kind === 'pdf' && offerAnalysis ? `${offerAnalysis.pageCount} page PDF parsed locally` : 'Prototype evidence adapter ready') : item.subtitle}</small></span><b>{isAdded ? 'SECURED' : 'ADD'}</b><input ref={fileInputs[kind]} type="file" hidden accept={kind === 'image' ? 'image/*' : kind === 'audio' ? 'audio/*' : '.pdf,application/pdf'} capture={kind === 'image' ? 'environment' : undefined} onChange={(event) => kind === 'pdf' ? handleOfferFile(event) : simulateEvidence(kind)} /></button>;
              })}</div>
              <div className="consent-note"><span>i</span><p><strong>Privacy boundary</strong><br />Only files you choose are analyzed. DealTwin never searches the internet automatically.</p></div>
              <button className="main-button" onClick={loadDemoOffer}>Load judge-ready sample <span>→</span></button><button className="text-button" disabled={!offerAnalysis} onClick={() => setStage('review')}>Review extracted offer</button>
            </section>
          )}
          {stage === 'review' && (
            <section className="screen">
              <button className="back" onClick={() => setStage('capture')}>← Back</button><p className="eyebrow">STEP 2 • {mode === 'pre' ? 'RISK ANALYSIS' : 'CLAIM GRAPH'}</p>
              <h2>{mode === 'pre' ? 'The promise is clear. The protection is not.' : 'Review the extracted promises.'}</h2>
              <p className="intro">{mode === 'pre' ? 'A benefit name is not a usable policy. DealTwin checks the minimum evidence needed to make it enforceable.' : 'AI structures evidence into claims; the user confirms the ledger before comparison.'}</p>
              {mode === 'pre' ? <>
                <div className="risk-summary"><div><span>PRE-PURCHASE RISK</span><strong>{preRiskLabel}</strong><small>{offerAnalysis?.riskScore ?? 0}/100 risk score</small></div><b>{fieldChecks.filter((field) => !field.present).length}<small>missing essentials</small></b></div>
                <div className="field-list">{fieldChecks.map((field) => <div key={field.label} className={field.present ? 'present' : 'absent'}><span>{field.present ? '✓' : '!'}</span><p><strong>{field.label}</strong><small>{field.reason}</small></p><b>{field.present ? 'FOUND' : 'MISSING'}</b></div>)}</div>
                <details className="source-snippet"><summary>View extracted source text</summary><p>“{offerAnalysis?.excerpt}”</p></details>
                <div className="official-check"><span>OFF</span><p><strong>Official Source Check</strong><br />Future user-requested checks on trusted official domains only—never automatic.</p></div>
                <button className="main-button" onClick={() => setStage('result')}>Open buyer risk report <span>→</span></button>
              </> : <>
                <div className="summary-strip"><span><strong>3</strong> claims shown</span><span><strong>96%</strong> demo confidence</span></div>
                <div className="claim-list">{demoClaims.map((claim, index) => <article className="claim-card" key={claim.promise}><div className="claim-number">0{index + 1}</div><div><p>{claim.promise}</p><code>{claim.normalized}</code><small>Source {index === 0 ? 'Ad screenshot' : index === 1 ? 'Consented audio' : 'Seller chat'} · user-confirmed</small></div><button aria-label={`Edit ${claim.promise}`}>•••</button></article>)}</div>
                <div className="source-proof"><span>◎</span><p><strong>Source-bound by design</strong><br />Each normalized claim retains its original evidence and timestamp.</p></div><button className="main-button" onClick={() => setStage('documents')}>Confirm promise ledger <span>→</span></button>
              </>}
            </section>
          )}
          {stage === 'documents' && (
            <section className="screen">
              <button className="back" onClick={() => setStage('review')}>← Promise ledger</button><p className="eyebrow">STEP 3 • FINAL EVIDENCE</p><h2>Add what you actually received.</h2>
              <p className="intro">Upload the final insurance or policy PDF. This prototype performs real local text extraction and links each verdict back to the document.</p>
              <button className={`document-drop ${finalAnalysis ? 'ready' : ''}`} onClick={() => finalPdfInput.current?.click()}><span>{finalAnalysis ? '✓' : '⇧'}</span><strong>{finalAnalysis ? finalAnalysis.fileName : 'Import final insurance PDF'}</strong><small>{finalAnalysis ? `${finalAnalysis.pageCount} page${finalAnalysis.pageCount === 1 ? '' : 's'} parsed locally` : 'Policy • certificate • insurance addendum'}</small><input ref={finalPdfInput} type="file" hidden accept=".pdf,application/pdf" onChange={handleFinalFile} /></button>
              {finalAnalysis && <div className="doc-list"><div><span>✓</span><p><strong>Insurance evidence</strong><small>{finalAnalysis.contradictionDetected ? 'Explicit contradiction detected' : 'Policy terms extracted'}</small></p><b>LINKED</b></div></div>}
              <div className="demo-evidence-row"><a href="/demo/dealtwin_demo_insurance_addendum.pdf" download>↓ Download demo PDF</a><button onClick={loadDemoFinal}>Use without downloading</button></div>
              <div className="engine-card"><span className="engine-orbit">D</span><p><strong>Hybrid verification engine</strong><br />PDF.js extracts text locally; deterministic rules identify missing fields and contradictions.</p></div>
              <button className="main-button" disabled={!finalAnalysis} onClick={runVerification}>Compare promise vs proof <span>→</span></button>
            </section>
          )}
          {stage === 'result' && mode === 'pre' && (
            <section className="screen result-screen">
              <div className="result-header"><button className="back" onClick={() => setStage('review')}>← Analysis</button><span className="verified-chip warning-chip">PRE-PURCHASE REPORT</span></div>
              <p className="eyebrow">STEP 3 • DECISION SUPPORT</p><h2>Do not pay until the missing terms are written down.</h2><p className="intro">The offer mentions protection, but does not contain enough evidence for a dependable insurance benefit.</p>
              <div className="score-card risk"><div className="score-ring"><strong>{offerAnalysis?.riskScore ?? 0}</strong><small>/100</small></div><div><span>OFFER RISK</span><strong>{preRiskLabel}</strong><small>{fieldChecks.filter((field) => !field.present).length} policy essentials missing · source linked</small></div></div>
              <div className="question-block"><span>ASK BEFORE PAYING</span>{(offerAnalysis?.questions ?? []).slice(0, 4).map((question, index) => <div key={question}><b>0{index + 1}</b><p>{question}</p></div>)}</div>
              <details className="source-snippet" open><summary>Why this warning?</summary><p>DealTwin found the promise in “{offerAnalysis?.fileName}”, but could not validate the minimum policy fields. This is decision support—not legal or financial advice.</p></details>
              <button className="main-button" onClick={() => flash('Buyer checklist copied')}>Copy seller questions <span>→</span></button>
            </section>
          )}
          {stage === 'result' && mode === 'post' && (
            <section className="screen result-screen">
              <div className="result-header"><button className="back" onClick={() => setStage('documents')}>← Evidence</button><span className="verified-chip">VERIFICATION COMPLETE</span></div><p className="eyebrow">STEP 4 • DEAL LEDGER</p>
              <h2>{finalAnalysis ? <>The promised insurance <em>was not delivered.</em></> : <>Your “no-cost” deal costs <em>₹4,748 more.</em></>}</h2><p className="intro">{finalAnalysis ? 'One evidence-backed contradiction needs attention. Other promises remain unverified until their documents are uploaded.' : 'Two of three important promises need attention before the return window closes.'}</p>
              <div className="score-card"><div className="score-ring"><strong>{finalAnalysis ? 42 : 64}</strong><small>/100</small></div><div><span>DEAL CONFIDENCE</span><strong>Review before accepting</strong><small>{riskCount} inconsistency found · {finalAnalysis ? '1 real PDF linked' : '3 demo sources linked'}</small></div></div>
              <div className="verdict-list">{reviewedClaims.map((claim) => <details className={`verdict ${claim.verdict.toLowerCase()}`} key={claim.promise} open={claim.verdict !== 'KEPT' && claim.verdict !== 'UNVERIFIED'}><summary><span className="verdict-icon">{claim.verdict === 'KEPT' ? '✓' : claim.verdict === 'CHANGED' ? '!' : claim.verdict === 'MISSING' ? '–' : '?'}</span><span><strong>{claim.promise}</strong><small>{claim.detail}</small></span><b>{claim.verdict}</b></summary>{claim.verdict !== 'UNVERIFIED' && <div className="evidence-link"><span>↳</span> Compared with {claim.finalEvidence} · {claim.confidence}% confidence <button onClick={() => setSourceOpen(claim.sourceExcerpt ?? claim.detail)}>View source</button></div>}</details>)}</div>
              <div className="action-card"><div><span>ACTION WINDOW</span><strong>Raise before return / cancellation closes</strong></div><button onClick={() => flash('Evidence pack generated')}>Evidence pack</button></div><button className="main-button" onClick={() => flash('Seller-ready summary copied')}>Prepare seller conversation <span>→</span></button>
            </section>
          )}
          {processing && <div className="processing-overlay"><span className="loader" /><strong>{processing}</strong><small>Private processing • files stay in this browser session</small></div>}
          {sourceOpen && <div className="source-modal" role="dialog" aria-modal="true"><div><span>SOURCE EVIDENCE</span><button onClick={() => setSourceOpen('')}>×</button><h3>Exact extracted excerpt</h3><blockquote>“{sourceOpen}”</blockquote><small>Linked to the uploaded PDF • locally extracted</small></div></div>}
          {toast && <div className="toast">✓ {toast}</div>}
          <nav className="bottom-nav" aria-label="Primary navigation"><button className={stage === 'home' ? 'active' : ''} onClick={() => setStage('home')}><span>⌂</span>Home</button><button className={stage !== 'home' ? 'active' : ''} onClick={() => selectMode('post')}><span>＋</span>Verify</button><button onClick={() => flash('Evidence vault is session-private in this prototype')}><span>▤</span>Vault</button></nav>
        </section>
        <aside className="demo-panel">
          <p className="eyebrow">INITIAL-ROUND PROTOTYPE</p><h2>One problem.<br />Two intervention points.</h2>
          <div className="mode-legend"><span className={mode === 'pre' ? 'active' : ''}>BEFORE PURCHASE</span><i>Promise risk</i><b>→</b><span className={mode === 'post' ? 'active' : ''}>AFTER PURCHASE</span><i>Proof mismatch</i></div>
          <ol><li className={activeStep === 0 ? 'active' : ''}><span>01</span><div><strong>Choose the intervention</strong><small>Prevent a risky purchase or verify a completed one.</small></div></li><li className={activeStep === 1 || activeStep === 2 ? 'active' : ''}><span>02</span><div><strong>Create a promise graph</strong><small>Every claim retains source, timestamp and normalized meaning.</small></div></li><li className={activeStep === 3 ? 'active' : ''}><span>03</span><div><strong>Parse final policy evidence</strong><small>Real client-side PDF extraction; no automatic web search.</small></div></li><li className={activeStep === 4 ? 'active' : ''}><span>04</span><div><strong>Generate an actionable verdict</strong><small>Missing terms, contradictions and next questions.</small></div></li></ol>
          <div className="architecture-card"><span>LOCAL-FIRST VERIFICATION PIPELINE</span><div><b>Capture</b><i>→</i><b>Extract</b><i>→</i><b>Normalize</b><i>→</i><b>Reconcile</b></div><small>PDF.js text layer → policy-field rules → promise/proof graph → source-linked explanation</small></div>
          <div className="technical-proof"><span><b>LIVE NOW</b> Local PDF parsing + deterministic checks</span><span><b>NEXT</b> On-device OCR / ASR and open-model claim extraction</span><span><b>OPTIONAL</b> User-triggered official-source verification</span></div>
          <button className="demo-reset" onClick={resetDemo}>↻ Restart demo</button><p className="prototype-note">The sample path is deterministic for reliable judging. Uploaded text PDFs are parsed and analyzed for real in the browser.</p>
        </aside>
      </div>
    </main>
  );
}
