'use client';

import QRCode from 'qrcode';
import { useEffect, useState } from 'react';

type Lang = 'en' | 'hi';
type Documents = Record<'invoice' | 'insurance' | 'warranty' | 'kfs' | 'cashback', boolean>;

export function StoryMode({ language }: { language: Lang }) {
  const l = (en: string, hi: string) => language === 'hi' ? hi : en;
  const [step, setStep] = useState(0);
  const [costs, setCosts] = useState({ price: 49999, fee: 999, gst: 180, insurance: 820, cashback: 2000 });
  const [documents, setDocuments] = useState<Documents>({ invoice: true, insurance: false, warranty: true, kfs: false, cashback: false });
  const [seller, setSeller] = useState('Nova Electronics');
  const [insurer, setInsurer] = useState('');
  const [policyId, setPolicyId] = useState('');
  const [returnTerms, setReturnTerms] = useState('7 days · manufacturing defects only');
  const [confirmed, setConfirmed] = useState(false);
  const [qr, setQr] = useState('');

  const effectiveCost = costs.price + costs.fee + costs.gst + costs.insurance - costs.cashback;
  const completeCount = Object.values(documents).filter(Boolean).length;
  const completeness = completeCount * 20;
  const missing = Object.entries(documents).filter(([, value]) => !value).map(([key]) => key);
  const trustScore = Math.max(20, Math.min(96, 46 + completeCount * 8 + (confirmed ? 16 : 0) - (insurer ? 0 : 8)));

  useEffect(() => {
    const payload = JSON.stringify({ type: 'BuySure Trust Receipt', seller, insurer: insurer || 'NOT SUPPLIED', policyId: policyId || 'NOT SUPPLIED', returnTerms, issued: new Date().toISOString().slice(0, 10), status: confirmed ? 'SELLER CONFIRMED' : 'AWAITING SELLER' });
    QRCode.toDataURL(payload, { width: 240, margin: 1, color: { dark: '#071421', light: '#ffffff' } }).then(setQr).catch(() => setQr(''));
  }, [confirmed, insurer, policyId, returnTerms, seller]);

  const titles = [
    l('Reveal the real cost', 'वास्तविक लागत जानें'), l('See what changed', 'देखें क्या बदला'),
    l('Find missing proof', 'गायब प्रमाण खोजें'), l('Confirm with the seller', 'विक्रेता से पुष्टि करें'),
    l('Leave purchase-ready', 'खरीद के लिए तैयार हों'),
  ];

  const docLabels: Record<keyof Documents, [string, string]> = {
    invoice: ['Tax invoice', 'कर इनवॉइस'], insurance: ['Insurance certificate', 'बीमा प्रमाणपत्र'],
    warranty: ['Warranty document', 'वारंटी दस्तावेज़'], kfs: ['EMI Key Fact Statement', 'ईएमआई मुख्य तथ्य विवरण'],
    cashback: ['Cashback confirmation', 'कैशबैक पुष्टि'],
  };

  function next() { setStep((current) => Math.min(4, current + 1)); }
  function back() { setStep((current) => Math.max(0, current - 1)); }

  return <div className="story-mode">
    <div className="story-top"><div><span>{l('GUIDED DECISION STORY', 'निर्देशित निर्णय कहानी')}</span><strong>{titles[step]}</strong></div><b>{step + 1}/5</b></div>
    <div className="story-progress">{[0,1,2,3,4].map((item)=><i key={item} className={item <= step ? 'on' : ''} />)}</div>

    {step === 0 && <div className="story-body">
      <p className="story-copy">{l('The advertised price hides financing charges, protection costs and conditional cashback.', 'विज्ञापित कीमत में वित्तीय शुल्क, सुरक्षा लागत और शर्तों वाला कैशबैक छिपा हो सकता है।')}</p>
      <div className="cost-twin"><div className="cost-head"><span>{l('TOTAL COST TWIN', 'कुल लागत ट्विन')}</span><b>₹{effectiveCost.toLocaleString('en-IN')}</b></div>{([
        ['price','Advertised price','विज्ञापित कीमत'],['fee','Processing fee','प्रोसेसिंग शुल्क'],['gst','GST on fee','शुल्क पर जीएसटी'],['insurance','Protection charge','सुरक्षा शुल्क'],['cashback','Eligible cashback','पात्र कैशबैक'],
      ] as const).map(([key,en,hi])=><label key={key}><span>{l(en,hi)}</span><div><b>{key==='cashback'?'−':'+'} ₹</b><input type="number" min="0" value={costs[key]} onChange={(event)=>setCosts({...costs,[key]:Number(event.target.value)})}/></div></label>)}<div className="cost-delta"><span>{l('Difference from headline price', 'मुख्य कीमत से अंतर')}</span><strong>{effectiveCost-costs.price>=0?'+':''}₹{(effectiveCost-costs.price).toLocaleString('en-IN')}</strong></div></div>
      <div className="story-insight"><b>!</b><p><strong>{l('“No-cost” does not mean zero additional cost.', '“नो-कॉस्ट” का अर्थ शून्य अतिरिक्त लागत नहीं है।')}</strong><small>{l('BuySure calculates what leaves your account after all charges and benefits.', 'BuySure सभी शुल्क और लाभ जोड़कर वास्तविक भुगतान दिखाता है।')}</small></p></div>
    </div>}

    {step === 1 && <div className="story-body">
      <p className="story-copy">{l('BuySure compares the persuasive promise with the final enforceable clause.', 'BuySure लुभावने वादे की अंतिम लागू धारा से तुलना करता है।')}</p>
      <div className="clause-diff"><span>{l('CLAUSE DIFF', 'धारा अंतर')}</span><div className="removed"><b>−</b><p>{l('Free comprehensive device protection', 'मुफ़्त व्यापक डिवाइस सुरक्षा')}</p></div><div className="added"><b>+</b><p>{l('Accidental screen damage only', 'केवल दुर्घटनावश स्क्रीन क्षति')}</p></div><div className="added"><b>+</b><p>{l('₹1,499 deductible per approved claim', 'हर स्वीकृत दावे पर ₹1,499 कटौती')}</p></div><div className="removed"><b>−</b><p>{l('Theft protection', 'चोरी सुरक्षा')}</p></div></div>
      <div className="drift-verdict"><span>82</span><p><strong>{l('Material promise weakening', 'वादे में महत्वपूर्ण कमजोरी')}</strong><small>{l('Theft disappeared and a deductible was introduced after checkout.', 'चोरी सुरक्षा गायब हुई और चेकआउट के बाद कटौती जोड़ी गई।')}</small></p></div>
    </div>}

    {step === 2 && <div className="story-body">
      <p className="story-copy">{l('Tap each document when it is available. BuySure shows what is still needed before payment.', 'दस्तावेज़ उपलब्ध होने पर टैप करें। BuySure भुगतान से पहले बाकी प्रमाण दिखाता है।')}</p>
      <div className="completeness"><div className="complete-score"><span>{l('DOCUMENT COMPLETENESS', 'दस्तावेज़ पूर्णता')}</span><strong>{completeness}%</strong></div><div className="complete-bar"><i style={{width:`${completeness}%`}} /></div>{(Object.keys(documents) as (keyof Documents)[]).map((key)=><button key={key} onClick={()=>setDocuments({...documents,[key]:!documents[key]})} className={documents[key]?'ready':''}><i>{documents[key]?'✓':'×'}</i><span><strong>{l(...docLabels[key])}</strong><small>{documents[key]?l('Received and linked','प्राप्त और जुड़ा'):l('Missing—request from seller','गायब—विक्रेता से माँगें')}</small></span><b>{documents[key]?l('READY','तैयार'):l('MISSING','गायब')}</b></button>)}</div>
      {missing.length>0 && <div className="request-preview"><span>{l('READY-TO-SEND REQUEST', 'भेजने योग्य अनुरोध')}</span><p>{l(`Please share the missing ${missing.map((key)=>docLabels[key as keyof Documents][0]).join(', ')} before I complete payment.`, `कृपया भुगतान से पहले गायब ${missing.map((key)=>docLabels[key as keyof Documents][1]).join(', ')} साझा करें।`)}</p></div>}
    </div>}

    {step === 3 && <div className="story-body">
      <p className="story-copy">{l('The seller scans a real QR containing the exact commitments that need confirmation.', 'विक्रेता पुष्टि योग्य सटीक प्रतिबद्धताओं वाला वास्तविक QR स्कैन करता है।')}</p>
      <div className="seller-confirm"><div className="seller-fields"><label>{l('Seller','विक्रेता')}<input value={seller} onChange={(event)=>setSeller(event.target.value)}/></label><label>{l('Insurer','बीमाकर्ता')}<input value={insurer} onChange={(event)=>setInsurer(event.target.value)} placeholder={l('Required','आवश्यक')}/></label><label>{l('Policy ID','पॉलिसी आईडी')}<input value={policyId} onChange={(event)=>setPolicyId(event.target.value)} placeholder={l('Required','आवश्यक')}/></label><label>{l('Return terms','रिटर्न शर्तें')}<input value={returnTerms} onChange={(event)=>setReturnTerms(event.target.value)}/></label></div>{qr&&<div className="real-qr"><img src={qr} alt={l('Scannable seller confirmation QR', 'स्कैन योग्य विक्रेता पुष्टि QR')}/><small>{l('REAL SCANNABLE QR', 'वास्तविक स्कैन योग्य QR')}</small></div>}</div>
      <button className={`seller-sign ${confirmed?'confirmed':''}`} onClick={()=>setConfirmed(!confirmed)}><span>{confirmed?'✓':'○'}</span><p><strong>{confirmed?l('Seller-confirmed Trust Receipt','विक्रेता-पुष्ट भरोसा रसीद'):l('Simulate seller confirmation','विक्रेता पुष्टि सिमुलेट करें')}</strong><small>{confirmed?l('Timestamped commitment created','समय-मुद्रित प्रतिबद्धता बनी'):l('Tap after reviewing the QR payload','QR विवरण जाँचने के बाद टैप करें')}</small></p></button>
    </div>}

    {step === 4 && <div className="story-body">
      <div className="story-finish"><span>✓</span><strong>{l('Purchase decision package ready', 'खरीद निर्णय पैकेज तैयार')}</strong><p>{l('One guided flow now connects real cost, clause drift, missing proof and seller confirmation.', 'एक निर्देशित प्रवाह अब वास्तविक लागत, धारा बदलाव, गायब प्रमाण और विक्रेता पुष्टि को जोड़ता है।')}</p><div><b>{trustScore}</b><small>{l('TRUST SCORE', 'भरोसा स्कोर')}</small></div></div>
      <div className="finish-list"><div><span>₹</span><p><strong>₹{effectiveCost.toLocaleString('en-IN')}</strong><small>{l('Effective purchase cost','वास्तविक खरीद लागत')}</small></p></div><div><span>≠</span><p><strong>82/100</strong><small>{l('Clause drift risk','धारा बदलाव जोखिम')}</small></p></div><div><span>▤</span><p><strong>{completeness}%</strong><small>{l('Document completeness','दस्तावेज़ पूर्णता')}</small></p></div><div><span>⌁</span><p><strong>{confirmed?l('Confirmed','पुष्ट'):l('Pending','बाकी')}</strong><small>{l('Merchant Trust Receipt','विक्रेता भरोसा रसीद')}</small></p></div></div>
      <button className="secondary" onClick={()=>setStep(0)}>{l('Replay guided story','निर्देशित कहानी फिर चलाएँ')}</button>
    </div>}

    <div className="story-nav">{step>0?<button onClick={back}>← {l('Back','पीछे')}</button>:<span/>}{step<4&&<button className="primary" onClick={next}>{l('Continue','आगे बढ़ें')} <span>→</span></button>}</div>
  </div>;
}
