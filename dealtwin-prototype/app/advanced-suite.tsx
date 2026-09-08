'use client';

import { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';
import { StoryMode } from './story-mode';

type Lang = 'en' | 'hi';
type Panel = 'story' | 'lens' | 'passport' | 'drift' | 'simulate' | 'timeline' | 'family' | 'merchant' | 'insights';
type Marker = { text: string; x: number; y: number; width: number; height: number };
type NativeTextDetector = { detect: (image: ImageBitmap) => Promise<{ rawValue: string; boundingBox: { x: number; y: number; width: number; height: number } }[]> };

const scenarioResults = {
  theft: {
    en: ['Likely not covered', 'No policy number was issued', 'Request insurer certificate before payment'],
    hi: ['कवर होने की संभावना नहीं', 'कोई पॉलिसी संख्या जारी नहीं हुई', 'भुगतान से पहले बीमाकर्ता प्रमाणपत्र माँगें'],
  },
  screen: {
    en: ['Conditional coverage', 'Accidental damage may be covered', 'Confirm deductible and authorised repair centre'],
    hi: ['शर्तों के अधीन कवरेज', 'दुर्घटनावश क्षति कवर हो सकती है', 'कटौती और अधिकृत मरम्मत केंद्र की पुष्टि करें'],
  },
  cashback: {
    en: ['Eligibility uncertain', 'Eligible bank card is required', 'Keep payment proof until credit deadline'],
    hi: ['पात्रता अनिश्चित', 'पात्र बैंक कार्ड आवश्यक है', 'क्रेडिट समय-सीमा तक भुगतान प्रमाण रखें'],
  },
};

export function AdvancedTrustSuite({ language, onBack, onImportClaims }: { language: Lang; onBack: () => void; onImportClaims: (text: string) => void }) {
  const l = (en: string, hi: string) => language === 'hi' ? hi : en;
  const [panel, setPanel] = useState<Panel>('story');
  const [scenario, setScenario] = useState<keyof typeof scenarioResults>('theft');
  const [certificate, setCertificate] = useState('');
  const [member, setMember] = useState(l('Me', 'मैं'));
  const [members, setMembers] = useState(['Me', 'Mother', 'Father']);
  const [newMember, setNewMember] = useState('');
  const [seller, setSeller] = useState('Nova Electronics');
  const [receiptReady, setReceiptReady] = useState(false);
  const [consent, setConsent] = useState(false);
  const [adCopy, setAdCopy] = useState('Free comprehensive device protection');
  const [checkoutCopy, setCheckoutCopy] = useState('Protection benefit included');
  const [policyCopy, setPolicyCopy] = useState('Accidental damage only. Theft excluded.');
  const [dates, setDates] = useState({ returns: '2026-09-14', cashback: '2026-10-07', warranty: '2028-09-07' });
  const [screenshotUrl, setScreenshotUrl] = useState('');
  const [screenshotName, setScreenshotName] = useState('');
  const [screenshotText, setScreenshotText] = useState('');
  const [checkoutText, setCheckoutText] = useState('Protection included. 7-day replacement for manufacturing defects only. ₹999 processing fee applies.');
  const [scanStatus, setScanStatus] = useState('');
  const [imageHash, setImageHash] = useState('');
  const [markers, setMarkers] = useState<Marker[]>([]);
  const [demoLens, setDemoLens] = useState(false);
  const lensInput = useRef<HTMLInputElement>(null);

  useEffect(() => () => { if (screenshotUrl) URL.revokeObjectURL(screenshotUrl); }, [screenshotUrl]);

  const lensFindings = useMemo(() => {
    const text = screenshotText.toLowerCase();
    return [
      { match: 'free theft insurance', en: 'Insurer and policy ID missing', hi: 'बीमाकर्ता और पॉलिसी आईडी गायब', tone: 'high' },
      { match: 'no-cost emi', en: 'Total financing cost not shown', hi: 'कुल वित्त लागत नहीं दिखाई गई', tone: 'high' },
      { match: 'cashback', en: 'Eligible card and credit date missing', hi: 'पात्र कार्ड और क्रेडिट तारीख गायब', tone: 'medium' },
      { match: '7-day return', en: 'Return conditions not disclosed', hi: 'रिटर्न की शर्तें नहीं बताई गईं', tone: 'medium' },
    ].filter((item) => text.includes(item.match));
  }, [screenshotText]);

  const disappeared = useMemo(() => {
    const final = checkoutText.toLowerCase();
    return ['theft insurance', 'no-cost emi', 'cashback', '7-day return'].filter((term) => screenshotText.toLowerCase().includes(term) && !final.includes(term));
  }, [checkoutText, screenshotText]);

  const drift = useMemo(() => {
    const combined = `${adCopy} ${checkoutCopy}`.toLowerCase();
    const final = policyCopy.toLowerCase();
    const contradicted = (combined.includes('comprehensive') || combined.includes('theft')) && (final.includes('only') || final.includes('excluded'));
    return contradicted ? 82 : final.length < 18 ? 48 : 24;
  }, [adCopy, checkoutCopy, policyCopy]);

  async function makeCertificate() {
    const payload = JSON.stringify({ seller, adCopy, checkoutCopy, policyCopy, dates, generatedAt: new Date().toISOString() });
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(payload));
    setCertificate(Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, '0')).join('').slice(0, 24).toUpperCase());
  }

  function addMember() {
    const clean = newMember.trim();
    if (!clean) return;
    setMembers((current) => [...current, clean]);
    setMember(clean);
    setNewMember('');
  }

  async function inspectScreenshot(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setDemoLens(false);
    setScreenshotName(file.name);
    setScreenshotUrl(URL.createObjectURL(file));
    setScanStatus(l('Creating evidence fingerprint…', 'प्रमाण फिंगरप्रिंट बनाया जा रहा है…'));
    const digest = await crypto.subtle.digest('SHA-256', await file.arrayBuffer());
    setImageHash(Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, '0')).join('').slice(0, 20).toUpperCase());
    const Detector = (window as typeof window & { TextDetector?: new () => NativeTextDetector }).TextDetector;
    if (!Detector) {
      setMarkers([]);
      setScanStatus(l('Native OCR is unavailable in this browser—review and confirm the visible text manually.', 'इस ब्राउज़र में नेटिव OCR उपलब्ध नहीं है—दिखाई दे रहे टेक्स्ट की स्वयं समीक्षा और पुष्टि करें।'));
      event.target.value = '';
      return;
    }
    try {
      setScanStatus(l('Reading visible claims on this device…', 'इस डिवाइस पर दिखाई दे रहे दावे पढ़े जा रहे हैं…'));
      const bitmap = await createImageBitmap(file);
      const blocks = await new Detector().detect(bitmap);
      setScreenshotText(blocks.map((block) => block.rawValue).join(' '));
      setMarkers(blocks.filter((block) => /(insurance|emi|cashback|return|warranty)/i.test(block.rawValue)).map((block) => ({ text: block.rawValue, x: block.boundingBox.x / bitmap.width * 100, y: block.boundingBox.y / bitmap.height * 100, width: block.boundingBox.width / bitmap.width * 100, height: block.boundingBox.height / bitmap.height * 100 })));
      bitmap.close();
      setScanStatus(l(`${blocks.length} text regions read locally—confirm before importing.`, `${blocks.length} टेक्स्ट क्षेत्र स्थानीय रूप से पढ़े गए—आयात से पहले पुष्टि करें।`));
    } catch {
      setScanStatus(l('OCR could not read this image—enter the visible offer text manually.', 'OCR इस चित्र को नहीं पढ़ सका—दिखाई दे रहा ऑफ़र टेक्स्ट स्वयं लिखें।'));
    }
    event.target.value = '';
  }

  function loadLensDemo() {
    if (screenshotUrl) URL.revokeObjectURL(screenshotUrl);
    setScreenshotUrl('');
    setScreenshotName(l('Guided electronics offer', 'निर्देशित इलेक्ट्रॉनिक्स ऑफ़र'));
    setScreenshotText('Free theft insurance. No-cost EMI for 12 months. ₹10,000 cashback. 7-day return. Two-year manufacturer warranty.');
    setCheckoutText('Protection included. 7-day replacement for manufacturing defects only. ₹999 processing fee applies.');
    setImageHash('7A21F4D9C8E0B61A449D');
    setMarkers([]);
    setDemoLens(true);
    setScanStatus(l('Guided demonstration loaded—results are deterministic demo data.', 'निर्देशित प्रदर्शन लोड हुआ—परिणाम नियम-आधारित डेमो डेटा हैं।'));
  }

  const tabs: { id: Panel; en: string; hi: string }[] = [
    { id: 'story', en: 'Story', hi: 'कहानी' },
    { id: 'lens', en: 'Lens', hi: 'लेंस' },
    { id: 'passport', en: 'Passport', hi: 'पासपोर्ट' }, { id: 'drift', en: 'Drift', hi: 'बदलाव' },
    { id: 'simulate', en: 'Simulate', hi: 'सिमुलेट' }, { id: 'timeline', en: 'Timeline', hi: 'समयरेखा' },
    { id: 'family', en: 'Family', hi: 'परिवार' }, { id: 'merchant', en: 'Merchant', hi: 'विक्रेता' },
    { id: 'insights', en: 'Insights', hi: 'जानकारी' },
  ];

  return <section className="screen suite-screen">
    <button className="back" onClick={onBack}>← {l('Home', 'होम')}</button>
    <div className="suite-heading"><div><p className="eyebrow">BUYSURE TRUST SUITE</p><h2>{l('One purchase. A lifetime of proof.', 'एक खरीद। जीवनभर का प्रमाण।')}</h2></div><span>12 USP</span></div>
    <p className="intro">{l('Prevent misleading purchases, preserve evidence and stay claim-ready from checkout to resale.', 'भ्रामक खरीद रोकें, प्रमाण सुरक्षित रखें और चेकआउट से पुनर्विक्रय तक दावा-तैयार रहें।')}</p>
    <div className="suite-tabs" role="tablist" aria-label={l('Trust Suite modules', 'ट्रस्ट सूट मॉड्यूल')}>
      {tabs.map((tab) => <button key={tab.id} className={panel === tab.id ? 'active' : ''} onClick={() => setPanel(tab.id)}>{l(tab.en, tab.hi)}</button>)}
    </div>

    {panel === 'story' && <StoryMode language={language} />}

    {panel === 'lens' && <div className="suite-panel lens-panel">
      <div className="lens-actions"><button onClick={() => lensInput.current?.click()}><span>▣</span><strong>{l('Capture / upload', 'कैप्चर / अपलोड')}</strong><small>{l('Real image evidence', 'वास्तविक चित्र प्रमाण')}</small></button><button onClick={loadLensDemo}><span>◇</span><strong>{l('Guided demo', 'निर्देशित डेमो')}</strong><small>{l('Reliable presentation path', 'विश्वसनीय प्रस्तुति प्रवाह')}</small></button></div>
      <input ref={lensInput} hidden type="file" accept="image/*" capture="environment" onChange={inspectScreenshot} />
      <div className={`lens-stage ${!screenshotUrl && !demoLens ? 'empty' : ''}`}>
        {screenshotUrl && <>{/* Blob URLs from local user files cannot use the framework image optimizer. */}<img src={screenshotUrl} alt={l('Uploaded commerce screenshot', 'अपलोड किया गया खरीद स्क्रीनशॉट')} />{markers.map((marker, index) => <span key={`${marker.text}-${index}`} className="ocr-marker" style={{ left: `${marker.x}%`, top: `${marker.y}%`, width: `${marker.width}%`, height: `${marker.height}%` }} title={marker.text} />)}</>}
        {demoLens && <div className="demo-commerce"><div className="demo-store"><b>NOVA</b><span>{l('Secure checkout', 'सुरक्षित चेकआउट')}</span></div><div className="demo-product"><span>5G</span><div><strong>iQOO Neo · 256 GB</strong><small>₹49,999</small></div></div><div className="demo-offers"><mark>{l('FREE THEFT INSURANCE', 'मुफ़्त चोरी बीमा')}</mark><mark>{l('NO-COST EMI · 12 MONTHS', 'नो-कॉस्ट ईएमआई · 12 महीने')}</mark><mark>₹10,000 {l('CASHBACK', 'कैशबैक')}</mark><mark>{l('7-DAY RETURN', '7 दिन रिटर्न')}</mark></div><button>{l('PAY ₹49,999', '₹49,999 भुगतान करें')}</button><small>{l('GUIDED DEMO OFFER · NOT A REAL MERCHANT', 'निर्देशित डेमो ऑफ़र · वास्तविक विक्रेता नहीं')}</small></div>}
        {!screenshotUrl && !demoLens && <div className="lens-empty"><span>▣</span><strong>{l('Add a checkout screenshot', 'चेकआउट स्क्रीनशॉट जोड़ें')}</strong><small>{l('The original image stays in this browser.', 'मूल चित्र इसी ब्राउज़र में रहता है।')}</small></div>}
      </div>
      {(screenshotName || scanStatus) && <div className="scan-status"><span>{imageHash ? '✓' : '…'}</span><p><strong>{screenshotName}</strong><small>{scanStatus}</small>{imageHash && <code>SHA-256 · {imageHash}</code>}</p></div>}
      <label className="lens-text"><span>{l('CONFIRM VISIBLE OFFER TEXT', 'दिखाई दे रहे ऑफ़र टेक्स्ट की पुष्टि करें')}</span><textarea value={screenshotText} onChange={(event) => setScreenshotText(event.target.value)} placeholder={l('OCR text appears here. Correct anything it misunderstood.', 'OCR टेक्स्ट यहाँ दिखाई देगा। गलत जानकारी सुधारें।')} /></label>
      {lensFindings.length > 0 && <div className="lens-findings"><div className="lens-findings-head"><span>{l('LIVE RISK HIGHLIGHTS', 'लाइव जोखिम हाइलाइट')}</span><b>{lensFindings.length}</b></div>{lensFindings.map((finding) => <div key={finding.match} className={finding.tone}><i>!</i><p><strong>{finding.match.toUpperCase()}</strong><small>{l(finding.en, finding.hi)}</small></p></div>)}</div>}
      {screenshotText && <div className="checkout-compare"><span>{l('BEFORE → CHECKOUT COMPARISON', 'पहले → चेकआउट तुलना')}</span><textarea value={checkoutText} onChange={(event) => setCheckoutText(event.target.value)} aria-label={l('Checkout text', 'चेकआउट टेक्स्ट')} /><div><b>{disappeared.length}</b><p><strong>{l('promises disappeared or changed', 'वादे गायब हुए या बदले')}</strong><small>{disappeared.length ? disappeared.join(' · ') : l('No tracked promise disappeared.', 'कोई दर्ज वादा गायब नहीं हुआ।')}</small></p></div></div>}
      <div className="lens-boundary"><b>◎</b><p><strong>{l('Honest OCR boundary', 'ईमानदार OCR सीमा')}</strong><small>{l('Native on-device OCR is used only when the browser supports TextDetector. Otherwise BuySure requires user-confirmed text; the guided path is labelled demo data.', 'नेटिव ऑन-डिवाइस OCR केवल TextDetector समर्थित होने पर उपयोग होता है। अन्यथा BuySure उपयोगकर्ता-पुष्ट टेक्स्ट माँगता है; निर्देशित प्रवाह डेमो डेटा के रूप में चिह्नित है।')}</small></p></div>
      <button className="primary" disabled={!screenshotText.trim()} onClick={() => onImportClaims(screenshotText)}>{l('Add confirmed claims to Promise Ledger', 'पुष्ट दावे वादा खाते में जोड़ें')} <span>→</span></button>
    </div>}

    {panel === 'passport' && <div className="suite-panel">
      <div className="passport-card"><div className="passport-top"><span className="passport-icon">▣</span><div><small>{l('PURCHASE PASSPORT', 'खरीद पासपोर्ट')}</small><strong>iQOO Neo · 256 GB</strong><p>Nova Electronics · INV-29041</p></div><b>76</b></div><div className="passport-progress"><span style={{ width: '76%' }} /></div><div className="passport-stats"><span><b>5</b>{l('promises', 'वादे')}</span><span><b>3</b>{l('verified', 'सत्यापित')}</span><span><b>2</b>{l('actions', 'कार्रवाइयाँ')}</span></div></div>
      <div className="graph-card"><span>{l('PROMISE-TO-PROOF GRAPH', 'वादा-से-प्रमाण ग्राफ')}</span><div className="graph-flow"><b>{l('Seller promise', 'विक्रेता वादा')}</b><i>→</i><b>{l('Invoice clause', 'इनवॉइस धारा')}</b><i>→</i><b>{l('Policy', 'पॉलिसी')}</b><i>→</i><b>{l('Claim action', 'दावा कार्रवाई')}</b></div><small>{l('Every conclusion remains linked to its original evidence.', 'हर निष्कर्ष अपने मूल प्रमाण से जुड़ा रहता है।')}</small></div>
      <div className="lifecycle"><span>{l('OWNERSHIP RECORD', 'स्वामित्व रिकॉर्ड')}</span>{[['07 Sep','Purchased'],['07 Sep','Promises captured'],['08 Sep','Policy checked'],['14 Sep','Return deadline']].map(([date,label],i)=><div key={label} className={i<3?'done':''}><b>{i<3?'✓':'○'}</b><small>{date}</small><strong>{l(label, label==='Purchased'?'खरीदा':label==='Promises captured'?'वादे दर्ज':label==='Policy checked'?'पॉलिसी जाँची':'रिटर्न समय-सीमा')}</strong></div>)}</div>
    </div>}

    {panel === 'drift' && <div className="suite-panel">
      <div className="drift-score"><span>{l('CLAUSE DRIFT', 'धारा बदलाव')}</span><strong>{drift}/100</strong><small>{drift > 70 ? l('Material promise weakening detected', 'वादे में महत्वपूर्ण कमजोरी मिली') : l('No material contradiction detected', 'कोई महत्वपूर्ण विरोधाभास नहीं मिला')}</small></div>
      <label className="stage-input"><span>01 · {l('Advertisement', 'विज्ञापन')}</span><textarea value={adCopy} onChange={(e)=>setAdCopy(e.target.value)} /></label>
      <div className="drift-arrow">↓ <small>{l('meaning narrowed', 'अर्थ सीमित हुआ')}</small></div>
      <label className="stage-input"><span>02 · {l('Checkout', 'चेकआउट')}</span><textarea value={checkoutCopy} onChange={(e)=>setCheckoutCopy(e.target.value)} /></label>
      <div className="drift-arrow danger">↓ <small>{l('exclusion introduced', 'अपवाद जोड़ा गया')}</small></div>
      <label className="stage-input final"><span>03 · {l('Final policy', 'अंतिम पॉलिसी')}</span><textarea value={policyCopy} onChange={(e)=>setPolicyCopy(e.target.value)} /></label>
      <div className="suite-alert"><b>!</b><p><strong>{l('“Comprehensive” became accidental damage only.', '“व्यापक” सुरक्षा केवल दुर्घटनावश क्षति बन गई।')}</strong><small>{l('Theft protection disappeared after checkout.', 'चेकआउट के बाद चोरी सुरक्षा गायब हो गई।')}</small></p></div>
    </div>}

    {panel === 'simulate' && <div className="suite-panel">
      <label className="scenario-select"><span>{l('WHAT-IF CLAIM SIMULATOR', 'क्या-हो-अगर दावा सिमुलेटर')}</span><select value={scenario} onChange={(e)=>setScenario(e.target.value as keyof typeof scenarioResults)}><option value="theft">{l('Phone stolen after 5 months', '5 महीने बाद फोन चोरी')}</option><option value="screen">{l('Screen breaks accidentally', 'स्क्रीन दुर्घटनावश टूटे')}</option><option value="cashback">{l('Cashback not received', 'कैशबैक न मिले')}</option></select></label>
      <div className="simulation-result"><span>{l('SIMULATED OUTCOME', 'सिमुलेटेड परिणाम')}</span><strong>{scenarioResults[scenario][language][0]}</strong><ul><li>{scenarioResults[scenario][language][1]}</li><li>{scenarioResults[scenario][language][2]}</li></ul><small>{l('Decision support—not a guarantee of claim approval.', 'निर्णय सहायता—दावा स्वीकृति की गारंटी नहीं।')}</small></div>
      <div className="source-proof"><span>◎</span><p><strong>{l('Evidence-bound answer', 'प्रमाण-बद्ध उत्तर')}</strong><small>{l('Based on the uploaded policy clause, not a generic chatbot response.', 'अपलोड की गई पॉलिसी धारा पर आधारित, सामान्य चैटबॉट उत्तर नहीं।')}</small></p></div>
    </div>}

    {panel === 'timeline' && <div className="suite-panel">
      <div className="timeline-head"><span>{l('CLAIMREADY TIMELINE', 'दावा-तैयार समयरेखा')}</span><b>{l('2 ACTIONS DUE', '2 कार्रवाइयाँ बाकी')}</b></div>
      {[{key:'returns',en:'Return / cancellation',hi:'रिटर्न / रद्दीकरण',tone:'urgent'},{key:'cashback',en:'Cashback credit',hi:'कैशबैक क्रेडिट',tone:'soon'},{key:'warranty',en:'Warranty expiry',hi:'वारंटी समाप्ति',tone:'safe'}].map((item)=><label key={item.key} className={`timeline-row ${item.tone}`}><i /><span><strong>{l(item.en,item.hi)}</strong><small>{item.tone==='urgent'?l('7 days remaining','7 दिन बाकी'):item.tone==='soon'?l('Evidence reminder scheduled','प्रमाण रिमाइंडर तय'):l('Coverage active','कवरेज सक्रिय')}</small></span><input type="date" value={dates[item.key as keyof typeof dates]} onChange={(e)=>setDates({...dates,[item.key]:e.target.value})}/></label>)}
      <button className="primary" onClick={makeCertificate}>{l('Generate integrity certificate', 'अखंडता प्रमाणपत्र बनाएँ')} <span>→</span></button>
      {certificate && <div className="certificate"><span>✓</span><div><strong>{l('Evidence integrity sealed', 'प्रमाण अखंडता सील हुई')}</strong><small>SHA-256 · {certificate}</small><p>{l('Timestamp, source chain and current terms are covered by this fingerprint.', 'समय-मुद्रा, स्रोत श्रृंखला और वर्तमान शर्तें इस फिंगरप्रिंट में शामिल हैं।')}</p></div></div>}
    </div>}

    {panel === 'family' && <div className="suite-panel">
      <div className="family-head"><div><span>{l('FAMILY PURCHASE VAULT', 'परिवार खरीद तिजोरी')}</span><strong>{l('Protect purchases together.', 'खरीदों को मिलकर सुरक्षित रखें।')}</strong></div><b>{members.length}</b></div>
      <div className="member-chips">{members.map((name)=><button key={name} className={member===name?'active':''} onClick={()=>setMember(name)}>{language==='hi'&&name==='Me'?'मैं':language==='hi'&&name==='Mother'?'माँ':language==='hi'&&name==='Father'?'पिता':name}</button>)}</div>
      <div className="family-purchase"><span>▣</span><div><strong>{l(`${member}'s phone`, `${member} का फोन`)}</strong><small>{l('Warranty active · return window closing', 'वारंटी सक्रिय · रिटर्न अवधि समाप्त होने वाली')}</small></div><b>!</b></div>
      <div className="add-member"><input value={newMember} onChange={(e)=>setNewMember(e.target.value)} placeholder={l('Family member name', 'परिवार सदस्य का नाम')} /><button onClick={addMember}>＋ {l('Add', 'जोड़ें')}</button></div>
      <div className="permission-note"><b>◎</b><p><strong>{l('Permission-controlled sharing', 'अनुमति-नियंत्रित साझाकरण')}</strong><small>{l('Only case summaries are shared in this prototype; original files stay on the owner’s device.', 'इस प्रोटोटाइप में केवल मामले का सार साझा होता है; मूल फ़ाइलें मालिक के डिवाइस पर रहती हैं।')}</small></p></div>
    </div>}

    {panel === 'merchant' && <div className="suite-panel">
      <label className="merchant-field"><span>{l('MERCHANT TRUST RECEIPT', 'विक्रेता भरोसा रसीद')}</span><input value={seller} onChange={(e)=>setSeller(e.target.value)} /></label>
      <div className="commitment-list">{[[l('Total payable','कुल देय'),'₹54,748'],[l('Insurance provider','बीमा प्रदाता'),l('Not supplied','नहीं दिया')],[l('Warranty','वारंटी'),l('24 months · manufacturer','24 महीने · निर्माता')],[l('Return terms','रिटर्न शर्तें'),l('7 days · defects only','7 दिन · केवल दोष')]].map(([a,b])=><div key={a}><span>{a}</span><strong>{b}</strong></div>)}</div>
      <button className="primary" onClick={()=>setReceiptReady(true)}>{l('Issue standard trust receipt', 'मानक भरोसा रसीद जारी करें')} <span>→</span></button>
      {receiptReady && <div className="receipt-ready"><span>✓</span><p><strong>{l('Buyer-readable receipt issued', 'खरीदार-पठनीय रसीद जारी')}</strong><small>{l('All commercial promises are now explicit and machine-readable.', 'सभी व्यावसायिक वादे अब स्पष्ट और मशीन-पठनीय हैं।')}</small></p></div>}
    </div>}

    {panel === 'insights' && <div className="suite-panel">
      <div className="consent-card"><div><span>{l('ANONYMOUS RISK INTELLIGENCE', 'अनाम जोखिम जानकारी')}</span><strong>{l('Help detect misleading patterns.', 'भ्रामक पैटर्न पहचानने में मदद करें।')}</strong><small>{l('No documents, names, order IDs or recordings leave this device.', 'कोई दस्तावेज़, नाम, ऑर्डर आईडी या रिकॉर्डिंग इस डिवाइस से बाहर नहीं जाती।')}</small></div><button role="switch" aria-checked={consent} className={consent?'switch on':'switch'} onClick={()=>setConsent(!consent)}><i /></button></div>
      <div className="cohort-label">{l('ILLUSTRATIVE COHORT SNAPSHOT', 'उदाहरणात्मक समूह झलक')} · {l('DEMO DATA', 'डेमो डेटा')}</div>
      <div className="insight-grid"><div><strong>38%</strong><span>{l('EMI offers missing full cost', 'ईएमआई ऑफ़र में पूरी लागत गायब')}</span></div><div><strong>27%</strong><span>{l('Insurance without policy ID', 'पॉलिसी आईडी के बिना बीमा')}</span></div><div><strong>19%</strong><span>{l('Return promise narrowed later', 'रिटर्न वादा बाद में सीमित')}</span></div><div><strong>14%</strong><span>{l('Conditional cashback', 'शर्तों वाला कैशबैक')}</span></div></div>
      <p className="prototype-boundary">{consent ? l('Consent enabled for anonymous risk signals. Backend aggregation is a production integration.', 'अनाम जोखिम संकेतों के लिए सहमति चालू। बैकएंड एकत्रीकरण प्रोडक्शन एकीकरण है।') : l('Sharing is off. These figures are clearly labelled demonstration data.', 'साझाकरण बंद है। ये आँकड़े स्पष्ट रूप से डेमो डेटा हैं।')}</p>
    </div>}
  </section>;
}
