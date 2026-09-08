'use client';

import { ChangeEvent, useEffect, useMemo, useState } from 'react';

type Lang = 'en' | 'hi';
type Mode = 'lens' | 'replay' | 'decision';
type Evidence = { insurer: boolean; policy: boolean; fee: boolean; warranty: boolean; cashback: boolean; returns: boolean };

export function DecisionLab({ language }: { language: Lang }) {
  const l = (en: string, hi: string) => language === 'hi' ? hi : en;
  const [mode, setMode] = useState<Mode>('lens');
  const [imageUrl, setImageUrl] = useState('');
  const [evidence, setEvidence] = useState<Evidence>({ insurer: true, policy: false, fee: false, warranty: true, cashback: false, returns: true });
  const [stage, setStage] = useState(3);
  const [scanned, setScanned] = useState(false);

  useEffect(() => () => { if (imageUrl) URL.revokeObjectURL(imageUrl); }, [imageUrl]);
  const score = 20 + (evidence.insurer ? 15 : 0) + (evidence.policy ? 15 : 0) + (evidence.fee ? 15 : 0) + (evidence.warranty ? 15 : 0) + (evidence.cashback ? 10 : 0) + (evidence.returns ? 10 : 0);
  const verdict = score >= 80 ? 'proceed' : score >= 50 ? 'pause' : 'avoid';
  const missing = useMemo(() => ([
    ['policy', 'Add a verifiable policy ID', 'सत्यापन योग्य पॉलिसी आईडी जोड़ें'],
    ['fee', 'Disclose every checkout fee', 'हर चेकआउट शुल्क बताएँ'],
    ['cashback', 'Confirm cashback eligibility and date', 'कैशबैक पात्रता और तारीख की पुष्टि करें'],
    ['insurer', 'Name the protection provider', 'सुरक्षा प्रदाता का नाम बताएँ'],
    ['warranty', 'Make final warranty match the promise', 'अंतिम वारंटी को वादे से मिलाएँ'],
    ['returns', 'Provide written return conditions', 'लिखित रिटर्न शर्तें दें'],
  ] as const).filter(([key]) => !evidence[key]), [evidence]);

  const stages = [
    { name: ['Advertisement','विज्ञापन'], price: '₹49,999', protection: ['Free 2-year protection','मुफ़्त 2-वर्ष सुरक्षा'], cashback: ['₹5,000 cashback','₹5,000 कैशबैक'] },
    { name: ['Product page','उत्पाद पेज'], price: '₹49,999', protection: ['2-year comprehensive warranty','2-वर्ष व्यापक वारंटी'], cashback: ['₹5,000 eligible cashback','₹5,000 पात्र कैशबैक'] },
    { name: ['Cart','कार्ट'], price: '₹49,999', protection: ['1-year manufacturer + protection','1-वर्ष निर्माता + सुरक्षा'], cashback: ['Selected cards only','केवल चुनिंदा कार्ड'] },
    { name: ['Checkout','चेकआउट'], price: evidence.fee ? '₹50,998' : '₹49,999 + hidden fee', protection: evidence.policy ? 'Policy ID attached' : 'Policy ID missing', cashback: evidence.cashback ? 'Cashback confirmed' : 'Cashback absent' },
    { name: ['Final policy','अंतिम पॉलिसी'], price: '₹50,998', protection: evidence.warranty ? 'Warranty preserved' : 'Screen damage only', cashback: evidence.cashback ? 'Credit date recorded' : 'No cashback clause' },
  ];

  function loadImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    setImageUrl(URL.createObjectURL(file));
    setScanned(true);
    event.target.value = '';
  }

  const labels: Record<keyof Evidence, [string,string,string,string]> = {
    insurer: ['Insurer named','बीमाकर्ता बताया','Provider identified','प्रदाता पहचाना'],
    policy: ['Policy ID visible','पॉलिसी आईडी दिखी','Missing policy number','पॉलिसी नंबर गायब'],
    fee: ['Fee disclosed','शुल्क बताया','₹999 fee hidden','₹999 शुल्क छिपा'],
    warranty: ['Warranty matches','वारंटी मेल खाती','Promise weakened','वादा कमजोर'],
    cashback: ['Cashback confirmed','कैशबैक पुष्ट','Eligibility missing','पात्रता गायब'],
    returns: ['Return terms written','रिटर्न शर्तें लिखित','Return limits missing','रिटर्न सीमाएँ गायब'],
  };

  return <div className="suite-panel decision-lab">
    <div className="decision-hero"><div><span>{l('DECISION LAB', 'निर्णय लैब')}</span><h3>{l('See the deal change before it changes your decision.', 'निर्णय से पहले सौदे का बदलाव देखें।')}</h3><p>{l('One evidence state powers the camera overlay, promise replay and final verdict.', 'एक प्रमाण स्थिति कैमरा ओवरले, वादा रिप्ले और अंतिम निर्णय को चलाती है।')}</p></div><b>{score}<small>/100</small></b></div>
    <div className="decision-tabs"><button className={mode === 'lens' ? 'active' : ''} onClick={() => setMode('lens')}>⌾ <span>{l('AR Deal Lens', 'AR डील लेंस')}</span></button><button className={mode === 'replay' ? 'active' : ''} onClick={() => setMode('replay')}>▶ <span>{l('Promise Replay', 'वादा रिप्ले')}</span></button><button className={mode === 'decision' ? 'active' : ''} onClick={() => setMode('decision')}>◆ <span>{l('Kill Switch', 'किल स्विच')}</span></button></div>

    {mode === 'lens' && <div className="decision-body">
      <div className={`ar-stage ${imageUrl ? 'has-image' : ''}`}>
        {imageUrl ? <img src={imageUrl} alt={l('Uploaded product or offer', 'अपलोड उत्पाद या ऑफ़र')} /> : <div className="ar-demo"><span>5G</span><b>iQOO Neo</b><small>₹49,999 · FREE PROTECTION</small></div>}
        {scanned && <div className="scan-line" />}
        <div className="ar-overlay top"><i>{evidence.warranty ? '✓' : '!'}</i><p><strong>{l(...labels.warranty.slice(0,2) as [string,string])}</strong><small>{evidence.warranty ? l('2-year promise retained', '2-वर्ष का वादा बरकरार') : l(...labels.warranty.slice(2) as [string,string])}</small></p></div>
        <div className="ar-overlay bottom"><i>{evidence.policy ? '✓' : '!'}</i><p><strong>{evidence.policy ? l(...labels.policy.slice(0,2) as [string,string]) : l(...labels.policy.slice(2) as [string,string])}</strong><small>{l('Tap evidence controls to resolve', 'समाधान के लिए प्रमाण नियंत्रण टैप करें')}</small></p></div>
      </div>
      <label className="camera-upload">▣ <span><strong>{l('Use camera or upload image', 'कैमरा उपयोग करें या चित्र अपलोड करें')}</strong><small>{l('The image remains in this browser session.', 'चित्र इसी ब्राउज़र सत्र में रहता है।')}</small></span><input type="file" accept="image/*" capture="environment" onChange={loadImage} /></label>
      <div className="evidence-switches">{(Object.keys(evidence) as (keyof Evidence)[]).map((key) => <button key={key} className={evidence[key] ? 'on' : ''} onClick={() => { setEvidence({ ...evidence, [key]: !evidence[key] }); setScanned(true); }}><i>{evidence[key] ? '✓' : '×'}</i><span><strong>{evidence[key] ? l(...labels[key].slice(0,2) as [string,string]) : l(...labels[key].slice(2) as [string,string])}</strong><small>{l('Tap to change evidence', 'प्रमाण बदलने के लिए टैप करें')}</small></span></button>)}</div>
      <div className="decision-boundary"><b>i</b><small>{l('The prototype demonstrates an AR-style evidence overlay using user-confirmed signals. Production OCR and commerce integrations would require device permission and official APIs.', 'प्रोटोटाइप उपयोगकर्ता-पुष्ट संकेतों से AR-जैसा प्रमाण ओवरले दिखाता है। उत्पादन OCR और कॉमर्स एकीकरण के लिए डिवाइस अनुमति और आधिकारिक API चाहिए।')}</small></div>
    </div>}

    {mode === 'replay' && <div className="decision-body">
      <div className="replay-head"><span>{l('PROMISE REPLAY', 'वादा रिप्ले')}</span><strong>{stage + 1}/5 · {l(...stages[stage].name as [string,string])}</strong><small>{l('Move through the purchase and watch promises weaken or disappear.', 'खरीद में आगे बढ़ें और वादों को कमजोर या गायब होते देखें।')}</small></div>
      <div className="replay-track">{stages.map((item,index) => <button key={item.name[0]} className={`${index <= stage ? 'seen' : ''} ${index === stage ? 'active' : ''}`} onClick={() => setStage(index)}><i>{index + 1}</i><span>{l(...item.name as [string,string])}</span></button>)}</div>
      <div className="replay-card"><div><span>{l('PRICE', 'कीमत')}</span><strong>{stages[stage].price}</strong><small className={stage >= 3 && !evidence.fee ? 'lost' : ''}>{stage >= 3 && !evidence.fee ? l('Undisclosed cost detected', 'अघोषित लागत मिली') : l('Recorded at this stage', 'इस चरण पर दर्ज')}</small></div><div><span>{l('PROTECTION', 'सुरक्षा')}</span><strong>{l(...stages[stage].protection as [string,string])}</strong><small className={stage >= 2 ? 'lost' : ''}>{stage >= 2 ? l('Changed from advertisement', 'विज्ञापन से बदला') : l('Original promise', 'मूल वादा')}</small></div><div><span>{l('CASHBACK', 'कैशबैक')}</span><strong>{l(...stages[stage].cashback as [string,string])}</strong><small className={stage >= 2 && !evidence.cashback ? 'lost' : ''}>{stage >= 2 && !evidence.cashback ? l('Promise disappeared', 'वादा गायब') : l('Promise present', 'वादा मौजूद')}</small></div></div>
      <div className="replay-controls"><button disabled={stage === 0} onClick={() => setStage(stage - 1)}>←</button><div>{stages.map((_,index) => <i key={index} className={index <= stage ? 'on' : ''} />)}</div><button disabled={stage === 4} onClick={() => setStage(stage + 1)}>→</button></div>
    </div>}

    {mode === 'decision' && <div className="decision-body">
      <div className={`kill-verdict ${verdict}`}><span>{l('PURCHASE KILL SWITCH', 'खरीद किल स्विच')}</span><b>{verdict === 'proceed' ? l('PROCEED', 'आगे बढ़ें') : verdict === 'pause' ? l('PAUSE', 'रुकें') : l('AVOID', 'बचें')}</b><strong>{score}/100</strong><p>{verdict === 'proceed' ? l('Critical evidence is present. Review once more before paying.', 'महत्वपूर्ण प्रमाण मौजूद है। भुगतान से पहले फिर समीक्षा करें।') : verdict === 'pause' ? l('The deal may be recoverable, but missing proof needs action.', 'सौदा सुधर सकता है, लेकिन गायब प्रमाण पर कार्रवाई चाहिए।') : l('Material contradictions make this purchase unsafe right now.', 'महत्वपूर्ण विरोधाभास इस खरीद को अभी असुरक्षित बनाते हैं।')}</p></div>
      <div className="decision-factors">{(Object.keys(evidence) as (keyof Evidence)[]).map((key) => <button key={key} onClick={() => setEvidence({ ...evidence, [key]: !evidence[key] })} className={evidence[key] ? 'good' : 'bad'}><i>{evidence[key] ? '✓' : '!'}</i><span><strong>{l(...labels[key].slice(0,2) as [string,string])}</strong><small>{evidence[key] ? l('Verified evidence', 'सत्यापित प्रमाण') : l(...labels[key].slice(2) as [string,string])}</small></span><b>{evidence[key] ? '+' : '−'}</b></button>)}</div>
      {missing.length > 0 && <div className="change-decision"><span>{l('WHAT WOULD CHANGE THIS DECISION?', 'इस निर्णय को क्या बदलेगा?')}</span>{missing.slice(0,3).map(([key,en,hi]) => <button key={key} onClick={() => setEvidence({ ...evidence, [key]: true })}><i>+</i>{l(en,hi)}</button>)}</div>}
      <div className="decision-note">{l('Decision support—not a guarantee. BuySure explains the available evidence and keeps the final choice with the buyer.', 'यह निर्णय सहायता है—गारंटी नहीं। BuySure उपलब्ध प्रमाण समझाता है और अंतिम चुनाव खरीदार के पास रखता है।')}</div>
    </div>}
  </div>;
}
