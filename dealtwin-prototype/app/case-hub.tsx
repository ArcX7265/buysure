'use client';

import { ChangeEvent, useEffect, useState } from 'react';

type Lang = 'en' | 'hi';
type Mode = 'demo' | 'live';
type EvidenceKey = 'offer' | 'invoice' | 'policy';
type CaseRecord = {
  id: string; product: string; seller: string; value: number; createdAt: string; mode: Mode;
  evidence: Record<EvidenceKey, { name: string; linked: boolean; excerpt: string }>;
};

const demoEvidence: CaseRecord['evidence'] = {
  offer: { name: 'Store offer screenshot', linked: true, excerpt: 'Free theft insurance · No-cost EMI · ₹10,000 cashback · 7-day return' },
  invoice: { name: 'Tax invoice INV-29041', linked: true, excerpt: 'Device ₹49,999 · Processing fee ₹999 · GST ₹180' },
  policy: { name: 'Insurance addendum', linked: true, excerpt: 'Accidental screen damage only · Theft excluded · Deductible ₹1,499' },
};

function openDatabase() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open('buysure-local-vault', 1);
    request.onupgradeneeded = () => { if (!request.result.objectStoreNames.contains('cases')) request.result.createObjectStore('cases', { keyPath: 'id' }); };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function listCases() {
  const db = await openDatabase();
  return new Promise<CaseRecord[]>((resolve, reject) => {
    const request = db.transaction('cases', 'readonly').objectStore('cases').getAll();
    request.onsuccess = () => { db.close(); resolve((request.result as CaseRecord[]).sort((a,b) => b.createdAt.localeCompare(a.createdAt))); };
    request.onerror = () => { db.close(); reject(request.error); };
  });
}

async function putCase(record: CaseRecord) {
  const db = await openDatabase();
  await new Promise<void>((resolve, reject) => { const request = db.transaction('cases', 'readwrite').objectStore('cases').put(record); request.onsuccess = () => resolve(); request.onerror = () => reject(request.error); });
  db.close();
}

async function removeCase(id: string) {
  const db = await openDatabase();
  await new Promise<void>((resolve, reject) => { const request = db.transaction('cases', 'readwrite').objectStore('cases').delete(id); request.onsuccess = () => resolve(); request.onerror = () => reject(request.error); });
  db.close();
}

function pdfEscape(value: string) { return value.replace(/[\\()]/g, '\\$&').replace(/[^\x20-\x7E]/g, '?'); }
function makePdf(lines: string[]) {
  const content = ['BT', '/F1 18 Tf', '48 790 Td', ...lines.flatMap((line,index) => index === 0 ? [`(${pdfEscape(line)}) Tj`] : ['0 -22 Td', index === 1 ? '/F1 10 Tf' : '/F1 9 Tf', `(${pdfEscape(line)}) Tj`]), 'ET'].join('\n');
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>',
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  ];
  let pdf = '%PDF-1.4\n'; const offsets = [0];
  objects.forEach((object,index) => { offsets.push(pdf.length); pdf += `${index + 1} 0 obj\n${object}\nendobj\n`; });
  const xref = pdf.length; pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets.slice(1).map((offset) => `${String(offset).padStart(10,'0')} 00000 n `).join('\n')}\ntrailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return new Blob([pdf], { type: 'application/pdf' });
}

export function CaseHub({ language }: { language: Lang }) {
  const l = (en: string, hi: string) => language === 'hi' ? hi : en;
  const [mode, setMode] = useState<Mode>('demo');
  const [record, setRecord] = useState<CaseRecord>({ id: 'case-demo-29041', product: 'iQOO Neo · 256 GB', seller: 'Nova Electronics', value: 50998, createdAt: new Date().toISOString(), mode: 'demo', evidence: demoEvidence });
  const [cases, setCases] = useState<CaseRecord[]>([]);
  const [sourceOpen, setSourceOpen] = useState<EvidenceKey | ''>('');
  const [message, setMessage] = useState('');
  const [installPrompt, setInstallPrompt] = useState<Event | null>(null);

  useEffect(() => { listCases().then(setCases).catch(() => setMessage(language === 'hi' ? 'इस ब्राउज़र में IndexedDB उपलब्ध नहीं है।' : 'IndexedDB is unavailable in this browser.')); }, [language]);
  useEffect(() => {
    const capture = (event: Event) => { event.preventDefault(); setInstallPrompt(event); };
    window.addEventListener('beforeinstallprompt', capture);
    return () => window.removeEventListener('beforeinstallprompt', capture);
  }, []);

  const linked = Object.values(record.evidence).filter((item) => item.linked).length;
  const findings = [
    { tone: 'danger', title: l('Theft protection disappeared', 'चोरी सुरक्षा गायब हुई'), detail: l('The offer promises theft insurance, but the policy explicitly excludes theft.', 'ऑफ़र चोरी बीमा का वादा करता है, लेकिन पॉलिसी चोरी को बाहर करती है।'), source: 'policy' as EvidenceKey },
    { tone: 'danger', title: l('₹1,179 added after the headline price', 'मुख्य कीमत के बाद ₹1,179 जुड़े'), detail: l('The invoice introduces a processing fee and GST.', 'इनवॉइस में प्रोसेसिंग शुल्क और जीएसटी जोड़ा गया।'), source: 'invoice' as EvidenceKey },
    { tone: 'warn', title: l('Cashback still needs fulfilment proof', 'कैशबैक के लिए अभी पूर्ति प्रमाण चाहिए'), detail: l('No bank confirmation or credit date is linked yet.', 'अभी बैंक पुष्टि या क्रेडिट तारीख जुड़ी नहीं है।'), source: 'offer' as EvidenceKey },
  ];

  function switchMode(next: Mode) {
    setMode(next);
    setRecord(next === 'demo' ? { id: 'case-demo-29041', product: 'iQOO Neo · 256 GB', seller: 'Nova Electronics', value: 50998, createdAt: new Date().toISOString(), mode: 'demo', evidence: demoEvidence } : { id: `case-${Date.now()}`, product: '', seller: '', value: 0, createdAt: new Date().toISOString(), mode: 'live', evidence: { offer: { name: '', linked: false, excerpt: '' }, invoice: { name: '', linked: false, excerpt: '' }, policy: { name: '', linked: false, excerpt: '' } } });
    setSourceOpen('');
  }

  function attach(key: EvidenceKey, event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]; if (!file) return;
    setRecord({ ...record, evidence: { ...record.evidence, [key]: { name: file.name, linked: true, excerpt: l('File selected by the user. Open the main Check workflow for local PDF extraction and clause analysis.', 'फ़ाइल उपयोगकर्ता ने चुनी। स्थानीय PDF निष्कर्षण और धारा विश्लेषण के लिए मुख्य जाँच प्रवाह खोलें।') } } });
    event.target.value = '';
  }

  async function save() {
    const saved = { ...record, id: record.id.startsWith('case-demo') ? `case-${Date.now()}` : record.id, createdAt: new Date().toISOString(), mode };
    await putCase(saved); setRecord(saved); setCases(await listCases()); setMessage(l('Case saved to IndexedDB on this device.', 'मामला इस डिवाइस के IndexedDB में सुरक्षित हुआ।'));
  }

  async function erase(id: string) { await removeCase(id); setCases(await listCases()); setMessage(l('Saved case deleted.', 'सुरक्षित मामला हटाया गया।')); }

  function downloadPdf() {
    const lines = ['BUYSURE PURCHASE EVIDENCE REPORT', `Product: ${record.product || 'Not supplied'}`, `Seller: ${record.seller || 'Not supplied'}`, `Effective value: INR ${record.value.toLocaleString('en-IN')}`, `Mode: ${mode === 'demo' ? 'GUIDED DEMO' : 'LIVE USER INPUT'}`, `Generated: ${new Date().toLocaleString('en-IN')}`, '', 'EVIDENCE INDEX', ...Object.values(record.evidence).map((item) => `- ${item.linked ? '[LINKED]' : '[MISSING]'} ${item.name || 'Unnamed evidence'}`), '', 'EXPLAINABLE FINDINGS', ...findings.flatMap((finding) => [`- ${finding.title}`, `  ${finding.detail}`, `  Source: ${record.evidence[finding.source].name || finding.source}`]), '', 'Deadlines: return 14 Sep 2026 | warranty 07 Sep 2028', '', 'Decision support only. User review is required before sharing or acting.'];
    const url = URL.createObjectURL(makePdf(lines)); const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'BuySure-purchase-evidence-report.pdf'; anchor.click(); window.setTimeout(() => URL.revokeObjectURL(url), 1000); setMessage(l('Real PDF evidence report downloaded.', 'वास्तविक PDF प्रमाण रिपोर्ट डाउनलोड हुई।'));
  }

  async function install() {
    if (!installPrompt) { setMessage(l('Use your browser menu and choose “Install app” or “Add to Home Screen”.', 'ब्राउज़र मेनू में “ऐप इंस्टॉल करें” या “होम स्क्रीन पर जोड़ें” चुनें।')); return; }
    const prompt = installPrompt as Event & { prompt: () => Promise<void> }; await prompt.prompt(); setInstallPrompt(null);
  }

  return <div className="suite-panel case-hub">
    <div className="case-hero"><div><span>{l('UNIFIED PURCHASE CASE', 'एकीकृत खरीद मामला')}</span><h3>{l('One record. Every promise, proof and action.', 'एक रिकॉर्ड। हर वादा, प्रमाण और कार्रवाई।')}</h3><p>{l('A continuous case from offer capture to claim-ready export.', 'ऑफ़र कैप्चर से दावा-तैयार निर्यात तक लगातार मामला।')}</p></div><b>{linked}/3<small>{l('sources linked', 'स्रोत जुड़े')}</small></b></div>
    <div className="mode-switch"><button className={mode === 'demo' ? 'active' : ''} onClick={() => switchMode('demo')}><b>◇</b><span><strong>{l('Guided Demo', 'निर्देशित डेमो')}</strong><small>{l('Labelled deterministic sample', 'चिह्नित निश्चित नमूना')}</small></span></button><button className={mode === 'live' ? 'active' : ''} onClick={() => switchMode('live')}><b>●</b><span><strong>{l('Live Check', 'लाइव जाँच')}</strong><small>{l('Your files and inputs', 'आपकी फ़ाइलें और जानकारी')}</small></span></button></div>
    <div className="case-body">
      <div className="case-identity"><label><span>{l('PRODUCT', 'उत्पाद')}</span><input value={record.product} onChange={(event) => setRecord({ ...record, product: event.target.value })} placeholder={l('Product name', 'उत्पाद नाम')} /></label><label><span>{l('SELLER', 'विक्रेता')}</span><input value={record.seller} onChange={(event) => setRecord({ ...record, seller: event.target.value })} placeholder={l('Seller name', 'विक्रेता नाम')} /></label><label><span>{l('EFFECTIVE VALUE', 'वास्तविक मूल्य')}</span><div>₹ <input type="number" min="0" value={record.value} onChange={(event) => setRecord({ ...record, value: Number(event.target.value) })} /></div></label></div>
      <div className="case-spine"><span>{l('CONNECTED CASE SPINE', 'जुड़ी मामला रीढ़')}</span>{[['01','Offer','ऑफ़र',record.evidence.offer.linked],['02','Promise ledger','वादा खाता',true],['03','Risk decision','जोखिम निर्णय',true],['04','Final proof','अंतिम प्रमाण',record.evidence.invoice.linked && record.evidence.policy.linked],['05','Claim-ready report','दावा-तैयार रिपोर्ट',linked === 3]].map(([number,en,hi,done]) => <div key={String(number)} className={done ? 'done' : ''}><b>{done ? '✓' : number}</b><strong>{l(String(en),String(hi))}</strong><i>→</i></div>)}</div>
      <div className="evidence-index"><div><span>{l('EVIDENCE INDEX', 'प्रमाण सूची')}</span><b>{linked}/3</b></div>{(Object.keys(record.evidence) as EvidenceKey[]).map((key) => <label key={key} className={record.evidence[key].linked ? 'linked' : ''}><i>{record.evidence[key].linked ? '✓' : '+'}</i><span><strong>{l(key === 'offer' ? 'Original offer' : key === 'invoice' ? 'Final invoice' : 'Protection policy', key === 'offer' ? 'मूल ऑफ़र' : key === 'invoice' ? 'अंतिम इनवॉइस' : 'सुरक्षा पॉलिसी')}</strong><small>{record.evidence[key].name || l('Tap to attach evidence', 'प्रमाण जोड़ने के लिए टैप करें')}</small></span><input type="file" accept={key === 'offer' ? 'image/*,.pdf' : '.pdf,image/*'} onChange={(event) => attach(key,event)} /></label>)}</div>
      <div className="linked-findings"><div><span>{l('EVIDENCE-LINKED CONCLUSIONS', 'प्रमाण-जुड़े निष्कर्ष')}</span><b>{findings.length}</b></div>{findings.map((finding) => <article key={finding.title} className={finding.tone}><i>!</i><span><strong>{finding.title}</strong><small>{finding.detail}</small></span><button onClick={() => setSourceOpen(finding.source)}>{l('View evidence', 'प्रमाण देखें')} →</button></article>)}</div>
      <div className="case-actions"><button onClick={save}>⌁ {l('Save unified case', 'एकीकृत मामला सुरक्षित करें')}</button><button onClick={downloadPdf}>↓ {l('Download PDF report', 'PDF रिपोर्ट डाउनलोड करें')}</button><button onClick={install}>▣ {l('Install offline app', 'ऑफ़लाइन ऐप इंस्टॉल करें')}</button></div>
      <div className="case-vault"><div><span>{l('INDEXEDDB PURCHASE PASSPORTS', 'INDEXEDDB खरीद पासपोर्ट')}</span><b>{cases.length}</b></div>{cases.length === 0 ? <p>{l('No saved cases yet. Save this case to prove persistence after refresh.', 'अभी कोई मामला सुरक्षित नहीं। रीफ्रेश के बाद स्थायित्व दिखाने के लिए मामला सुरक्षित करें।')}</p> : cases.slice(0,4).map((item) => <article key={item.id}><button onClick={() => { setRecord(item); setMode(item.mode); }}><b>{item.mode === 'demo' ? '◇' : '●'}</b><span><strong>{item.product || l('Unnamed purchase', 'बेनाम खरीद')}</strong><small>{item.seller || l('Seller missing', 'विक्रेता गायब')} · ₹{item.value.toLocaleString('en-IN')}</small></span></button><button aria-label={l('Delete case', 'मामला हटाएँ')} onClick={() => erase(item.id)}>×</button></article>)}</div>
      <div className="offline-card"><b>●</b><span><strong>{l('Offline-ready application shell', 'ऑफ़लाइन-तैयार ऐप शेल')}</strong><small>{l('Service worker caches the latest visited interface. Case summaries remain in IndexedDB; selected file contents are not retained.', 'सर्विस वर्कर नवीनतम देखे गए इंटरफ़ेस को कैश करता है। मामला सारांश IndexedDB में रहते हैं; चुनी फ़ाइलों की सामग्री सुरक्षित नहीं होती।')}</small></span></div>
      {message && <div className="case-message">✓ {message}</div>}
    </div>
    {sourceOpen && <div className="case-modal" role="dialog" aria-modal="true"><div><button onClick={() => setSourceOpen('')}>×</button><span>{l('SOURCE-BOUND EVIDENCE', 'स्रोत-बद्ध प्रमाण')}</span><h4>{record.evidence[sourceOpen].name || l('Evidence not attached', 'प्रमाण संलग्न नहीं')}</h4><blockquote>“{record.evidence[sourceOpen].excerpt || l('Attach this evidence in Live Check mode.', 'यह प्रमाण लाइव जाँच मोड में संलग्न करें।')}”</blockquote><small>{l('User-selected source · conclusion remains reviewable', 'उपयोगकर्ता-चयनित स्रोत · निष्कर्ष समीक्षा योग्य')}</small></div></div>}
  </div>;
}
