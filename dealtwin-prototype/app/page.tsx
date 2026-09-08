'use client';

import { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';
import { Translate } from './i18n';
import { AdvancedTrustSuite } from './advanced-suite';

type View = 'home' | 'capture' | 'ledger' | 'risk' | 'proof' | 'results' | 'claim' | 'vault' | 'suite';
type PromiseCategory = 'Insurance' | 'Warranty' | 'Finance' | 'Cashback' | 'Return' | 'Delivery' | 'Other';
type Verdict = 'VERIFIED' | 'MISSING' | 'CONTRADICTED' | 'UNVERIFIED';
type PromiseItem = { id: string; label: string; category: PromiseCategory; source: string; confirmed: boolean };
type Finding = { promise: PromiseItem; verdict: Verdict; detail: string; excerpt: string; confidence: number };
type SourceItem = { id: string; kind: 'image' | 'voice' | 'pdf' | 'text'; name: string; status: string };
type SavedCase = { id: string; title: string; createdAt: string; score: number; issues: number; promises: number };

const demoOffer = 'Seller promises free theft insurance, no-cost EMI for 12 months, two-year manufacturer warranty, ₹10,000 cashback, and a 7-day return window.';
const demoProof = 'Insurance Addendum. Optional theft protection is not included in this transaction. No policy was issued. Invoice: ₹999 processing fee plus ₹749 GST. Manufacturer warranty: 24 months. Cashback subject to an eligible bank card. Return allowed within 7 days for manufacturing defects only.';
const categories: PromiseCategory[] = ['Insurance', 'Warranty', 'Finance', 'Cashback', 'Return', 'Delivery', 'Other'];
const copy = {
  en: { home: 'Buy with evidence, not assumptions.', start: 'Start a purchase check', result: 'Your purchase needs attention.', protect: 'Prepare a claim-ready evidence pack' },
  hi: { home: 'अनुमान पर नहीं, सबूत के साथ खरीदें।', start: 'खरीद की जाँच शुरू करें', result: 'आपकी खरीद पर ध्यान देने की ज़रूरत है।', protect: 'दावे के लिए प्रमाण पैक तैयार करें' },
};

function id() { return Math.random().toString(36).slice(2, 9); }
function normalize(value: string) { return value.replace(/\s+/g, ' ').trim(); }
function excerptAround(text: string, terms: string[]) {
  const cleaned = normalize(text); const lower = cleaned.toLowerCase();
  const position = terms.map((term) => lower.indexOf(term)).find((index) => index >= 0) ?? 0;
  return cleaned.slice(Math.max(0, position - 55), Math.min(cleaned.length, position + 210)) || 'No readable source excerpt available.';
}
function parsePromises(text: string, source = 'User-confirmed offer'): PromiseItem[] {
  const value = normalize(text); const found: PromiseItem[] = [];
  const add = (category: PromiseCategory, label: string) => found.push({ id: id(), category, label, source, confirmed: true });
  const insurance = value.match(/(?:free|complimentary|included)?\s*(?:theft|device|accidental)?\s*(?:insurance|protection)/i);
  const warranty = value.match(/(?:one|two|three|\d+)[-\s]?(?:year|month)s?[^,.]{0,35}warranty|warranty[^,.]{0,35}(?:one|two|three|\d+)[-\s]?(?:year|month)s?/i);
  const emi = value.match(/(?:no[-\s]?cost|zero[-\s]?cost|interest[-\s]?free)?\s*emi[^,.]{0,55}/i);
  const cashback = value.match(/(?:₹|rs\.?\s*)?[\d,]+\s*cashback|cashback[^,.]{0,40}/i);
  const returns = value.match(/(?:\d+|seven|fourteen|thirty)[-\s]?day[^,.]{0,35}(?:return|replacement)|return[^,.]{0,40}/i);
  const delivery = value.match(/(?:same[-\s]?day|next[-\s]?day|\d+[-\s]?day)[^,.]{0,25}delivery|delivery[^,.]{0,35}/i);
  if (insurance) add('Insurance', normalize(insurance[0]));
  if (warranty) add('Warranty', normalize(warranty[0]));
  if (emi) add('Finance', normalize(emi[0]));
  if (cashback) add('Cashback', normalize(cashback[0]));
  if (returns) add('Return', normalize(returns[0]));
  if (delivery) add('Delivery', normalize(delivery[0]));
  if (!found.length && value) add('Other', value.slice(0, 110));
  return found;
}
function riskFor(items: PromiseItem[], text: string) {
  const issues: { title: string; detail: string; question: string }[] = [];
  for (const item of items) {
    if (item.category === 'Insurance') {
      if (!/(insurer|underwritten by)/i.test(text)) issues.push({ title: 'Insurer is not identified', detail: 'A benefit name alone does not establish who provides cover.', question: 'Who is the regulated insurer underwriting this benefit?' });
      if (!/policy\s*(?:number|no\.?|id)|certificate\s*(?:number|no\.?|id)/i.test(text)) issues.push({ title: 'No policy or certificate number', detail: 'The promised cover is not yet traceable or claimable.', question: 'Please provide the policy or certificate number before I pay.' });
      if (!/(coverage|policy)\s*(?:dates?|period|from)/i.test(text)) issues.push({ title: 'Coverage dates are missing', detail: 'The start and end of protection are unknown.', question: 'What are the exact coverage start and end dates?' });
    }
    if (item.category === 'Finance' && !/(processing fee|apr|annual percentage|gst|total cost)/i.test(text)) issues.push({ title: 'True EMI cost is undisclosed', detail: 'Processing fees and tax can make “no-cost” financing more expensive.', question: 'What are the processing fee, GST, APR and total payable amount?' });
    if (item.category === 'Cashback' && !/(eligible|card|bank|credited|within)/i.test(text)) issues.push({ title: 'Cashback conditions are unclear', detail: 'Eligibility and credit timing are not stated.', question: 'Which cards qualify, and when will the cashback be credited?' });
    if (item.category === 'Return' && !/(defect|unused|sealed|condition|eligible)/i.test(text)) issues.push({ title: 'Return eligibility is ambiguous', detail: 'A return period can still contain restrictive conditions.', question: 'Is the return unconditional, and what conditions or deductions apply?' });
  }
  return { score: Math.min(96, Math.max(12, 18 + issues.length * 11 + (text.toLowerCase().includes('free') ? 5 : 0))), issues };
}
function reconcile(items: PromiseItem[], proofText: string): Finding[] {
  return items.map((promise) => {
    if (promise.category === 'Insurance') {
      if (/(not included|no policy (?:was )?issued|optional.{0,45}not included)/i.test(proofText)) return { promise, verdict: 'CONTRADICTED', detail: 'The final document says protection was not included and no policy was issued.', excerpt: excerptAround(proofText, ['not included', 'no policy']), confidence: 97 };
      if (/(policy\s*(?:number|no\.?|id)|certificate\s*(?:number|no\.?|id))/i.test(proofText)) return { promise, verdict: 'VERIFIED', detail: 'A traceable insurance identifier was found.', excerpt: excerptAround(proofText, ['policy', 'certificate']), confidence: 91 };
      return { promise, verdict: 'MISSING', detail: 'No claimable policy evidence was found.', excerpt: excerptAround(proofText, ['insurance', 'protection']), confidence: 72 };
    }
    if (promise.category === 'Finance') {
      if (/(processing fee|convenience fee|gst)/i.test(proofText)) return { promise, verdict: 'CONTRADICTED', detail: 'Additional financing charges were found despite the no-cost promise.', excerpt: excerptAround(proofText, ['processing fee', 'gst']), confidence: 96 };
      return { promise, verdict: 'UNVERIFIED', detail: 'Upload the invoice and Key Fact Statement to verify total financing cost.', excerpt: 'No financing evidence linked.', confidence: 0 };
    }
    if (promise.category === 'Warranty') {
      return /(24\s*months?|two[-\s]?year)/i.test(proofText)
        ? { promise, verdict: 'VERIFIED', detail: 'Twenty-four months of manufacturer coverage is documented.', excerpt: excerptAround(proofText, ['24 month', 'manufacturer warranty']), confidence: 95 }
        : { promise, verdict: 'UNVERIFIED', detail: 'No matching warranty duration was found.', excerpt: excerptAround(proofText, ['warranty']), confidence: 45 };
    }
    if (promise.category === 'Cashback') {
      if (/subject to|eligible bank|eligible card/i.test(proofText)) return { promise, verdict: 'CONTRADICTED', detail: 'The benefit has eligibility conditions absent from the original promise.', excerpt: excerptAround(proofText, ['subject to', 'eligible']), confidence: 88 };
      return { promise, verdict: 'UNVERIFIED', detail: 'No bank or credit evidence has been linked.', excerpt: 'No cashback evidence linked.', confidence: 0 };
    }
    if (promise.category === 'Return') {
      if (/manufacturing defects? only|replacement only|non[-\s]?returnable/i.test(proofText)) return { promise, verdict: 'CONTRADICTED', detail: 'The final terms restrict the advertised return window.', excerpt: excerptAround(proofText, ['manufacturing defect', 'return']), confidence: 93 };
      if (/\d+[-\s]?day.{0,35}return/i.test(proofText)) return { promise, verdict: 'VERIFIED', detail: 'A matching return window was found.', excerpt: excerptAround(proofText, ['return']), confidence: 86 };
    }
    return { promise, verdict: 'UNVERIFIED', detail: 'No matching final evidence has been linked yet.', excerpt: 'No linked evidence.', confidence: 0 };
  });
}
async function extractPdf(file: File) {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
  const document = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()), isEvalSupported: false }).promise;
  const pages: string[] = [];
  for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
    const page = await document.getPage(pageNumber); const content = await page.getTextContent();
    pages.push(content.items.map((item) => ('str' in item ? item.str : '')).join(' '));
  }
  return { text: pages.join('\n'), pages: document.numPages };
}

export default function Home() {
  const [view, setView] = useState<View>('home');
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [offerText, setOfferText] = useState('');
  const [proofText, setProofText] = useState('');
  const [promises, setPromises] = useState<PromiseItem[]>([]);
  const [sources, setSources] = useState<SourceItem[]>([]);
  const [proofName, setProofName] = useState('');
  const [processing, setProcessing] = useState('');
  const [toast, setToast] = useState('');
  const [sourceOpen, setSourceOpen] = useState('');
  const [speechActive, setSpeechActive] = useState(false);
  const [returnDate, setReturnDate] = useState('2026-09-14');
  const [warrantyDate, setWarrantyDate] = useState('2028-09-07');
  const [savedCases, setSavedCases] = useState<SavedCase[]>([]);
  const imageInput = useRef<HTMLInputElement>(null); const offerPdfInput = useRef<HTMLInputElement>(null); const proofPdfInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try { setSavedCases(JSON.parse(localStorage.getItem('buysure-cases') || '[]')); }
      catch { setSavedCases([]); }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  const risk = useMemo(() => riskFor(promises, offerText), [promises, offerText]);
  const findings = useMemo(() => reconcile(promises, proofText), [promises, proofText]);
  const issueCount = findings.filter((item) => item.verdict === 'CONTRADICTED' || item.verdict === 'MISSING').length;
  const verifiedCount = findings.filter((item) => item.verdict === 'VERIFIED').length;
  const confidence = promises.length ? Math.max(18, Math.round((verifiedCount / promises.length) * 100 - issueCount * 4)) : 0;
  const activeStep = ({ capture: 1, ledger: 2, risk: 3, proof: 4, results: 5, claim: 6 } as Partial<Record<View, number>>)[view] || 0;

  function flash(message: string) { setToast(message); window.setTimeout(() => setToast(''), 2400); }
  function restart() { setView('home'); setOfferText(''); setProofText(''); setPromises([]); setSources([]); setProofName(''); setSourceOpen(''); }
  function addSource(kind: SourceItem['kind'], name: string, status: string) { setSources((current) => [...current.filter((item) => item.kind !== kind), { id: id(), kind, name, status }]); }
  function extractLedger() { const parsed = parsePromises(offerText, sources.at(-1)?.name || 'Typed promise'); setPromises(parsed); setView('ledger'); flash(`${parsed.length} promise${parsed.length === 1 ? '' : 's'} structured for confirmation`); }
  function loadDemo() { setOfferText(demoOffer); setSources([{ id: id(), kind: 'image', name: 'Store offer screenshot', status: 'Captured' }, { id: id(), kind: 'voice', name: 'Seller promise transcript', status: 'User confirmed' }]); setPromises(parsePromises(demoOffer, 'Store offer + seller statement')); setView('ledger'); }
  async function handleOfferPdf(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]; if (!file) return; setProcessing('Extracting seller promises from the PDF locally…');
    try { const result = await extractPdf(file); setOfferText(result.text); addSource('pdf', file.name, `${result.pages} page${result.pages === 1 ? '' : 's'} parsed locally`); flash('Offer PDF parsed locally'); }
    catch { flash('This PDF could not be read. Try a text-based PDF.'); } finally { setProcessing(''); event.target.value = ''; }
  }
  function handleImage(event: ChangeEvent<HTMLInputElement>) { const file = event.target.files?.[0]; if (!file) return; addSource('image', file.name, 'Visual evidence secured'); flash('Image captured—describe or paste the visible promise to confirm it'); event.target.value = ''; }
  function startVoice() {
    type SpeechEngine = { lang: string; interimResults: boolean; onresult: (event: { results: { 0: { 0: { transcript: string } } }[] }) => void; onend: () => void; onerror: () => void; start: () => void };
    const browserWindow = window as typeof window & { SpeechRecognition?: new () => SpeechEngine; webkitSpeechRecognition?: new () => SpeechEngine };
    const SpeechRecognition = browserWindow.SpeechRecognition || browserWindow.webkitSpeechRecognition;
    if (!SpeechRecognition) { flash('Voice recognition is unavailable here—type the promise instead'); return; }
    const recognition = new SpeechRecognition(); recognition.lang = language === 'hi' ? 'hi-IN' : 'en-IN'; recognition.interimResults = false; setSpeechActive(true);
    recognition.onresult = (event) => { const transcript = event.results[0][0].transcript; setOfferText((current) => normalize(`${current} ${transcript}`)); addSource('voice', 'Consented seller statement', 'Transcribed and awaiting confirmation'); };
    recognition.onend = () => setSpeechActive(false); recognition.onerror = () => { setSpeechActive(false); flash('Voice capture stopped—type the promise instead'); }; recognition.start();
  }
  async function handleProofPdf(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]; if (!file) return; setProcessing('Parsing final documents and reconciling every promise…');
    try { const result = await extractPdf(file); setProofText(result.text); setProofName(file.name); flash(`${result.pages} page${result.pages === 1 ? '' : 's'} linked as final evidence`); }
    catch { flash('Could not read this PDF. Try a text-based document.'); } finally { setProcessing(''); event.target.value = ''; }
  }
  function loadDemoProof() { setProofText(demoProof); setProofName('buysure_demo_final_documents.pdf'); flash('Demo invoice, policy and warranty evidence linked'); }
  function saveCase() {
    const item: SavedCase = { id: id(), title: 'Electronics purchase check', createdAt: new Date().toLocaleDateString('en-IN'), score: confidence, issues: issueCount, promises: promises.length };
    const next = [item, ...savedCases].slice(0, 8); setSavedCases(next); localStorage.setItem('buysure-cases', JSON.stringify(next)); flash('Case saved to this device');
  }
  function downloadPack() {
    const lines = ['BUYSURE CLAIM-READY EVIDENCE PACK', `Generated: ${new Date().toLocaleString('en-IN')}`, '', 'PURCHASE PROMISES', ...promises.map((item) => `- ${item.category}: ${item.label} | Source: ${item.source}`), '', 'DOCUMENT FINDINGS', ...findings.map((item) => `- ${item.verdict}: ${item.promise.label}\n  ${item.detail}\n  Evidence: ${item.excerpt}`), '', `Return / cancellation deadline: ${returnDate}`, `Warranty end date: ${warrantyDate}`, '', 'This report is decision support and not legal or financial advice.'];
    const url = URL.createObjectURL(new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' })); const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'BuySure-evidence-pack.txt'; anchor.click(); URL.revokeObjectURL(url); flash('Evidence pack downloaded');
  }

  return <Translate language={language}><main className="buy-app">
    <header className="topbar"><button className="brand" onClick={restart}><span className="brand-mark">B</span><span><strong>BuySure</strong><small>Know what you buy. Prove what was promised.</small></span></button><div className="header-actions"><button onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}>{language === 'en' ? 'हिंदी' : 'EN'}</button><span className="privacy-pill">● Private by default</span></div></header>
    <div className="workspace"><section className="phone-shell" aria-live="polite"><div className="statusbar"><span>09:41</span><span>5G ▮▮▮ 88%</span></div>{activeStep > 0 && <div className="progress">{[1,2,3,4,5,6].map((step) => <span key={step} className={step <= activeStep ? 'on' : ''} />)}</div>}
      {view === 'home' && <section className="screen home-view"><div className="hero-row"><div><p className="eyebrow">PURCHASE TRUST LAYER</p><h1>{copy[language].home}</h1><p>Capture what a seller promised, verify what the documents prove, and stay ready to claim.</p></div><div className="trust-orb"><span>✓</span><small>LOCAL<br />FIRST</small></div></div><button className="start-card" onClick={() => setView('capture')}><span className="start-icon">＋</span><span><b>NEW CHECK</b><strong>{copy[language].start}</strong><small>Before purchase or after purchase</small></span><i>→</i></button><div className="journey"><span><b>01</b>Capture</span><i>→</i><span><b>02</b>Assess</span><i>→</i><span><b>03</b>Verify</span><i>→</i><span><b>04</b>Act</span></div><div className="section-title"><strong>Try the complete flow</strong><small>DETERMINISTIC DEMO</small></div><button className="demo-case" onClick={loadDemo}><div className="demo-case-top"><span className="bag">▣</span><span><strong>Electronics purchase</strong><small>Insurance · EMI · warranty · cashback · returns</small></span><b>5 promises</b></div><div className="demo-case-score"><span style={{ width: '78%' }} /><small>Seller promise captured — final proof pending</small></div></button><div className="privacy-grid"><span>◈ User-selected files</span><span>◎ Source-linked findings</span><span>⌁ Stored on this device</span></div></section>}
      {view === 'capture' && <section className="screen"><button className="back" onClick={() => setView('home')}>← Home</button><p className="eyebrow">STEP 1 · CAPTURE THE PROMISE</p><h2>What did the seller offer?</h2><p className="intro">Add evidence, then confirm the promise in your own words. BuySure never treats an unconfirmed recording as fact.</p><div className="capture-grid"><button onClick={() => imageInput.current?.click()}><span>▣</span><strong>Camera / screenshot</strong><small>Capture visual evidence</small></button><button onClick={startVoice} className={speechActive ? 'listening' : ''}><span>◉</span><strong>{speechActive ? 'Listening…' : 'Voice promise'}</strong><small>With consent</small></button><button onClick={() => offerPdfInput.current?.click()}><span>⇧</span><strong>Offer PDF</strong><small>Real local extraction</small></button></div><input ref={imageInput} hidden type="file" accept="image/*" capture="environment" onChange={handleImage} /><input ref={offerPdfInput} hidden type="file" accept=".pdf,application/pdf" onChange={handleOfferPdf} />{sources.length > 0 && <div className="sources">{sources.map((source) => <div key={source.id}><span>✓</span><p><strong>{source.name}</strong><small>{source.status}</small></p></div>)}</div>}<label className="promise-input"><span>CONFIRMED SELLER PROMISE</span><textarea value={offerText} onChange={(event) => setOfferText(event.target.value)} placeholder="Example: Free theft insurance, no-cost EMI for 12 months and a two-year warranty…" /></label><div className="row-actions"><button onClick={() => { setOfferText(demoOffer); addSource('text', 'Demo seller offer', 'User-editable sample'); }}>Use sample offer</button><small>Nothing is uploaded to the web.</small></div><button className="primary" disabled={!offerText.trim()} onClick={extractLedger}>Create Promise Ledger <span>→</span></button></section>}
      {view === 'ledger' && <section className="screen"><button className="back" onClick={() => setView('capture')}>← Capture</button><p className="eyebrow">STEP 2 · PROMISE LEDGER</p><h2>Confirm what must be delivered.</h2><p className="intro">Every promise stays connected to its source. Edit anything the extraction misunderstood.</p><div className="ledger-list">{promises.map((item, index) => <article key={item.id}><span className="ledger-number">0{index + 1}</span><div><select value={item.category} onChange={(event) => setPromises((current) => current.map((entry) => entry.id === item.id ? { ...entry, category: event.target.value as PromiseCategory } : entry))}>{categories.map((category) => <option key={category}>{category}</option>)}</select><input value={item.label} onChange={(event) => setPromises((current) => current.map((entry) => entry.id === item.id ? { ...entry, label: event.target.value } : entry))} /><small>◎ {item.source}</small></div><button aria-label="Remove promise" onClick={() => setPromises((current) => current.filter((entry) => entry.id !== item.id))}>×</button></article>)}</div><button className="add-line" onClick={() => setPromises((current) => [...current, { id: id(), category: 'Other', label: 'New seller promise', source: 'Manual entry', confirmed: true }])}>＋ Add another promise</button><div className="info-card"><span>✓</span><p><strong>User confirmation is mandatory</strong><small>BuySure shows what it extracted; you decide what enters the ledger.</small></p></div><button className="primary" disabled={!promises.length} onClick={() => setView('risk')}>Assess purchase risk <span>→</span></button></section>}
      {view === 'risk' && <section className="screen"><button className="back" onClick={() => setView('ledger')}>← Ledger</button><p className="eyebrow">STEP 3 · BEFORE YOU PAY</p><h2>The offer sounds good. Is it complete?</h2><div className="risk-card"><div className="score-ring"><strong>{risk.score}</strong><small>/100</small></div><div><span>OFFER RISK</span><strong>{risk.score >= 70 ? 'HIGH — ASK FIRST' : risk.score >= 40 ? 'REVIEW REQUIRED' : 'LOW'}</strong><small>{risk.issues.length} disclosure gap{risk.issues.length === 1 ? '' : 's'} found</small></div></div><div className="issue-list">{risk.issues.slice(0,5).map((item, index) => <details key={item.title} open={index < 2}><summary><span>!</span><div><strong>{item.title}</strong><small>{item.detail}</small></div></summary><p><b>ASK:</b> {item.question}</p></details>)}</div><div className="decision-note"><b>BUYER DECISION</b><p>Do not rely on a verbal benefit until its provider, dates, conditions and claim path are written down.</p></div><button className="secondary" onClick={() => navigator.clipboard?.writeText(risk.issues.map((item) => item.question).join('\n')).then(() => flash('Seller questions copied'))}>Copy questions for seller</button><button className="primary" onClick={() => setView('proof')}>I purchased it — verify proof <span>→</span></button></section>}
      {view === 'proof' && <section className="screen"><button className="back" onClick={() => setView('risk')}>← Risk report</button><p className="eyebrow">STEP 4 · FINAL DOCUMENTS</p><h2>What did you actually receive?</h2><p className="intro">Upload a text-based policy, invoice, KFS or warranty PDF. Extraction runs locally in this browser.</p><button className={`dropzone ${proofText ? 'ready' : ''}`} onClick={() => proofPdfInput.current?.click()}><span>{proofText ? '✓' : '⇧'}</span><strong>{proofName || 'Import final documents'}</strong><small>{proofText ? 'Evidence extracted and ready to compare' : 'PDF · policy · invoice · warranty'}</small></button><input ref={proofPdfInput} hidden type="file" accept=".pdf,application/pdf" onChange={handleProofPdf} /><button className="sample-proof" onClick={loadDemoProof}>Use complete demo evidence</button><div className="deadline-card"><span>DEADLINE WATCH</span><label>Return / cancellation<input type="date" value={returnDate} onChange={(event) => setReturnDate(event.target.value)} /></label><label>Warranty ends<input type="date" value={warrantyDate} onChange={(event) => setWarrantyDate(event.target.value)} /></label></div><button className="primary" disabled={!proofText} onClick={() => { setProcessing('Reconciling promise nodes with clause-level evidence…'); window.setTimeout(() => { setProcessing(''); setView('results'); saveCase(); }, 800); }}>Compare promise vs proof <span>→</span></button></section>}
      {view === 'results' && <section className="screen"><button className="back" onClick={() => setView('proof')}>← Documents</button><div className="result-kicker"><p className="eyebrow">STEP 5 · EVIDENCE VERDICT</p><span>COMPLETE</span></div><h2>{copy[language].result}</h2><p className="intro">Each verdict is tied to a final-document clause. Unverified means more evidence is needed—not that the promise is false.</p><div className="confidence-card"><div className="score-ring"><strong>{confidence}</strong><small>/100</small></div><div><span>DEAL CONFIDENCE</span><strong>{issueCount ? `${issueCount} issue${issueCount === 1 ? '' : 's'} require action` : 'Evidence looks consistent'}</strong><small>{verifiedCount} verified · {promises.length - verifiedCount - issueCount} unverified</small></div></div><div className="finding-list">{findings.map((finding) => <details key={finding.promise.id} className={finding.verdict.toLowerCase()} open={finding.verdict === 'CONTRADICTED' || finding.verdict === 'MISSING'}><summary><span>{finding.verdict === 'VERIFIED' ? '✓' : finding.verdict === 'UNVERIFIED' ? '?' : '!'}</span><div><strong>{finding.promise.label}</strong><small>{finding.detail}</small></div><b>{finding.verdict}</b></summary><button onClick={() => setSourceOpen(finding.excerpt)}>View exact source clause →</button></details>)}</div><button className="primary" onClick={() => setView('claim')}>{copy[language].protect} <span>→</span></button></section>}
      {view === 'claim' && <section className="screen"><button className="back" onClick={() => setView('results')}>← Verdicts</button><p className="eyebrow">STEP 6 · CLAIMREADY</p><h2>Turn findings into action.</h2><p className="intro">BuySure packages the promise, supporting evidence, contradiction and key deadlines into one portable record.</p><div className="claim-summary"><span>CLAIM READINESS</span><strong>{issueCount ? 'Evidence pack ready' : 'No dispute detected'}</strong><div><b>{promises.length}</b><small>promises</small><b>{sources.length + 1}</b><small>sources</small><b>{issueCount}</b><small>issues</small></div></div><div className="pack-list"><div><span>01</span><p><strong>Original promise ledger</strong><small>What was offered and where it came from</small></p><b>READY</b></div><div><span>02</span><p><strong>Clause-level findings</strong><small>Contradictions and supporting excerpts</small></p><b>READY</b></div><div><span>03</span><p><strong>Deadline record</strong><small>Return {returnDate} · warranty {warrantyDate}</small></p><b>READY</b></div></div><div className="message-preview"><span>SELLER MESSAGE</span><p>“The final documents do not match the benefits represented before purchase. Please review the attached evidence summary and resolve the highlighted discrepancies before the applicable deadline.”</p></div><button className="secondary" onClick={() => navigator.clipboard?.writeText('The final documents do not match the benefits represented before purchase. Please review the attached evidence summary and resolve the highlighted discrepancies before the applicable deadline.').then(() => flash('Seller message copied'))}>Copy seller message</button><button className="primary" onClick={downloadPack}>Download evidence pack <span>↓</span></button></section>}
      {view === 'vault' && <section className="screen"><button className="back" onClick={() => setView('home')}>← Home</button><p className="eyebrow">LOCAL EVIDENCE VAULT</p><h2>Your purchase checks stay on this device.</h2><p className="intro">This prototype stores only case summaries in browser storage. Uploaded document files are not retained.</p>{savedCases.length ? <div className="vault-list">{savedCases.map((item) => <article key={item.id}><span>{item.score}</span><div><strong>{item.title}</strong><small>{item.createdAt} · {item.promises} promises</small></div><b>{item.issues} issues</b></article>)}</div> : <div className="empty-vault"><span>◇</span><strong>No saved checks yet</strong><small>Complete a promise-to-proof comparison to create one.</small></div>}<button className="primary" onClick={() => setView('capture')}>Start a new check <span>→</span></button></section>}
      {view === 'suite' && <AdvancedTrustSuite language={language} onBack={() => setView('home')} onImportClaims={(text) => { setOfferText(text); addSource('image', 'Evidence Lens screenshot', 'User-confirmed visual claims'); setPromises(parsePromises(text, 'Evidence Lens screenshot')); setView('ledger'); flash('Screenshot claims added to the Promise Ledger'); }} />}
      {processing && <div className="processing"><span /><strong>{processing}</strong><small>Local-first processing · user-selected evidence only</small></div>}{sourceOpen && <div className="modal" role="dialog" aria-modal="true"><div><button onClick={() => setSourceOpen('')}>×</button><p className="eyebrow">SOURCE-BOUND EVIDENCE</p><h3>Exact extracted clause</h3><blockquote data-no-translate>“{sourceOpen}”</blockquote><small>Linked to {proofName || 'the demo final document'} · extracted in this browser</small></div></div>}{toast && <div className="toast">✓ {toast}</div>}
      <nav className="bottom-nav"><button className={view === 'home' ? 'active' : ''} onClick={() => setView('home')}><span>⌂</span>Home</button><button className={['capture','ledger','risk','proof','results','claim'].includes(view) ? 'active' : ''} onClick={() => setView('capture')}><span>＋</span>Check</button><button className={view === 'suite' ? 'active' : ''} onClick={() => setView('suite')}><span>◆</span>Suite</button><button className={view === 'vault' ? 'active' : ''} onClick={() => setView('vault')}><span>▤</span>Vault</button></nav>
    </section><aside className="inspector"><p className="eyebrow">BUYSURE 2.0 · TEAM ANKOR</p><h2>From persuasive promise to portable proof.</h2><p className="side-copy">A consumer trust workflow designed for the moments before payment, after delivery, and before a claim deadline.</p><div className="workflow-map"><div className={activeStep <= 2 ? 'active' : ''}><span>01</span><p><strong>Promise Ledger</strong><small>Camera, voice, text and PDFs become user-confirmed obligations.</small></p></div><i>↓</i><div className={activeStep === 3 ? 'active' : ''}><span>02</span><p><strong>Explainable Risk</strong><small>Disclosure gaps become precise questions before payment.</small></p></div><i>↓</i><div className={activeStep === 4 || activeStep === 5 ? 'active' : ''}><span>03</span><p><strong>Evidence Reconciliation</strong><small>Final clauses are matched to each promise with confidence.</small></p></div><i>↓</i><div className={activeStep === 6 ? 'active' : ''}><span>04</span><p><strong>ClaimReady Action</strong><small>Deadlines, sources and contradictions become a portable pack.</small></p></div></div><div className="architecture"><span>PRIVACY-FIRST PIPELINE</span><div><b>Capture</b><i>→</i><b>Extract</b><i>→</i><b>Structure</b><i>→</i><b>Reconcile</b></div><small>PDF.js local text layer · deterministic claim rules · source-linked explanations · device-local case summaries</small></div><div className="capability-tags"><span>LIVE PDF PARSING</span><span>VOICE WHEN SUPPORTED</span><span>LOCAL VAULT</span><span>EXPORTABLE PACK</span></div><p className="honesty-note">Camera files are preserved as visual evidence and require user confirmation. Automated image OCR and official-source connectors are the next production integrations.</p><button className="restart" onClick={restart}>↻ Restart experience</button></aside></div>
  </main></Translate>;
}
