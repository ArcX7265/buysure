'use client';

import { useMemo, useState } from 'react';

type Lang = 'en' | 'hi';
type Tool = 'benefits' | 'traps' | 'authenticity' | 'claim' | 'sandbox';

const today = new Date('2026-09-08T00:00:00');

export function LifecycleLab({ language }: { language: Lang }) {
  const l = (en: string, hi: string) => language === 'hi' ? hi : en;
  const [tool, setTool] = useState<Tool>('benefits');
  const [benefits, setBenefits] = useState({ warranty: true, theft: false, cashback: false, installation: true });
  const [monthly, setMonthly] = useState(499);
  const [trialDays, setTrialDays] = useState(30);
  const [autoRenew, setAutoRenew] = useState(true);
  const [addon, setAddon] = useState(true);
  const [serials, setSerials] = useState({ box: 'IQ-NEO-74A29', invoice: 'IQ-NEO-74A29', policy: 'IQ-NEO-74A92', repair: 'IQ-NEO-74A29' });
  const [claim, setClaim] = useState({ buyer: 'Adarsh Kumar', product: 'iQOO Neo · 256 GB', serial: 'IQ-NEO-74A29', policy: 'POL-482910', incident: '2026-09-08', description: 'Screen cracked after an accidental drop.' });
  const [preview, setPreview] = useState(false);
  const [rules, setRules] = useState({ policy: true, fee: false, returnRule: false, receipt: true, warranty: true });

  const benefitRows = [
    { id: 'warranty' as const, en: 'Manufacturer warranty', hi: 'निर्माता वारंटी', due: '08 Sep' },
    { id: 'theft' as const, en: 'Theft protection', hi: 'चोरी सुरक्षा', due: '10 Sep' },
    { id: 'cashback' as const, en: 'Bank cashback claim', hi: 'बैंक कैशबैक दावा', due: '12 Sep' },
    { id: 'installation' as const, en: 'Free installation', hi: 'मुफ़्त इंस्टॉलेशन', due: '09 Sep' },
  ];
  const benefitCount = Object.values(benefits).filter(Boolean).length;
  const authenticity = useMemo(() => {
    const values = Object.values(serials).map((value) => value.trim().toUpperCase());
    const canonical = values[0];
    return { matches: values.filter((value) => value === canonical).length, canonical };
  }, [serials]);
  const sandboxScore = useMemo(() => 50 + (rules.policy ? 15 : -20) + (rules.fee ? 10 : -15) + (rules.returnRule ? 10 : -10) + (rules.receipt ? 8 : -8) + (rules.warranty ? 7 : -10), [rules]);
  const safeScore = Math.max(0, Math.min(100, sandboxScore));
  const annual = monthly * 12 + (addon ? 1188 : 0);

  const tabs: { id: Tool; icon: string; en: string; hi: string }[] = [
    { id: 'benefits', icon: '✓', en: 'Activate', hi: 'सक्रिय करें' },
    { id: 'traps', icon: '↻', en: 'Traps', hi: 'जाल' },
    { id: 'authenticity', icon: '⌁', en: 'Authenticity', hi: 'प्रामाणिकता' },
    { id: 'claim', icon: '▤', en: 'Claim', hi: 'दावा' },
    { id: 'sandbox', icon: '◫', en: 'Sandbox', hi: 'सैंडबॉक्स' },
  ];

  return <div className="suite-panel lifecycle-lab">
    <div className="lab-hero"><div><span>{l('PURCHASE LIFECYCLE LAB', 'खरीद जीवनचक्र लैब')}</span><h3>{l('Protection that continues after payment.', 'सुरक्षा जो भुगतान के बाद भी जारी रहे।')}</h3><p>{l('Activate benefits, expose recurring costs, preserve authenticity and become claim-ready.', 'लाभ सक्रिय करें, आवर्ती लागत पहचानें, प्रामाणिकता सुरक्षित रखें और दावा-तैयार बनें।')}</p></div><div className="lab-ring"><strong>5</strong><small>{l('live tools', 'लाइव टूल')}</small></div></div>
    <div className="lab-tabs" role="tablist">{tabs.map((tab) => <button key={tab.id} className={tool === tab.id ? 'active' : ''} onClick={() => setTool(tab.id)}><i>{tab.icon}</i><span>{l(tab.en, tab.hi)}</span></button>)}</div>

    {tool === 'benefits' && <div className="lab-body">
      <div className="lab-score"><div><span>{l('BENEFIT ACTIVATION', 'लाभ सक्रियण')}</span><strong>{benefitCount}/4</strong></div><div className="lab-meter"><i style={{ width: `${benefitCount * 25}%` }} /></div><p>{benefitCount === 4 ? l('Every promised benefit is secured.', 'हर वादा किया गया लाभ सुरक्षित है।') : l(`${4 - benefitCount} promised benefits still need action.`, `${4 - benefitCount} वादा किए गए लाभों पर अभी कार्रवाई बाकी है।`)}</p></div>
      <div className="benefit-list">{benefitRows.map((row) => <button key={row.id} className={benefits[row.id] ? 'done' : ''} onClick={() => setBenefits((current) => ({ ...current, [row.id]: !current[row.id] }))}><b>{benefits[row.id] ? '✓' : '!'}</b><span><strong>{l(row.en, row.hi)}</strong><small>{benefits[row.id] ? l('Proof saved', 'प्रमाण सुरक्षित') : l(`Activate by ${row.due}`, `${row.due} तक सक्रिय करें`)}</small></span><em>{benefits[row.id] ? l('ACTIVE', 'सक्रिय') : l('ACT NOW', 'अभी करें')}</em></button>)}</div>
      <div className="lab-note"><b>◎</b><span><strong>{l('Why this matters', 'यह क्यों जरूरी है')}</strong><small>{l('“Included” benefits often require registration, a coupon or a separate policy certificate. BuySure keeps the activation deadline visible.', '“शामिल” लाभों के लिए अक्सर पंजीकरण, कूपन या अलग पॉलिसी प्रमाणपत्र चाहिए। BuySure सक्रियण समय-सीमा दिखाता है।')}</small></span></div>
    </div>}

    {tool === 'traps' && <div className="lab-body">
      <div className="renewal-card"><span>{l('SUBSCRIPTION-TRAP DETECTOR', 'सब्सक्रिप्शन-जाल डिटेक्टर')}</span><div className="renewal-flow"><b>{l('TODAY', 'आज')}<small>₹0</small></b><i>→</i><b>{trialDays} {l('DAYS', 'दिन')}<small>₹{monthly}/{l('mo', 'माह')}</small></b><i>→</i><b>{l('YEAR 1', 'वर्ष 1')}<small>₹{annual.toLocaleString('en-IN')}</small></b></div><div className="cancel-date"><b>!</b><p><strong>{l('Cancel before', 'इससे पहले रद्द करें')} {new Date(today.getTime() + Math.max(0, trialDays - 2) * 86400000).toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</strong><small>{l('Two-day safety buffer before renewal.', 'नवीनीकरण से पहले दो दिन का सुरक्षा अंतर।')}</small></p></div></div>
      <div className="lab-fields"><label><span>{l('MONTHLY PRICE', 'मासिक मूल्य')}</span><input type="number" min="0" value={monthly} onChange={(e) => setMonthly(Number(e.target.value))} /></label><label><span>{l('FREE-TRIAL DAYS', 'मुफ़्त ट्रायल दिन')}</span><input type="number" min="0" value={trialDays} onChange={(e) => setTrialDays(Number(e.target.value))} /></label></div>
      <div className="switch-list"><button onClick={() => setAutoRenew(!autoRenew)}><span><strong>{l('Automatic renewal', 'स्वचालित नवीनीकरण')}</strong><small>{autoRenew ? l('Enabled — payment can recur', 'चालू — भुगतान दोहर सकता है') : l('Disabled', 'बंद')}</small></span><i className={autoRenew ? 'on' : ''} /></button><button onClick={() => setAddon(!addon)}><span><strong>{l('Protection add-on', 'सुरक्षा ऐड-ऑन')}</strong><small>{addon ? l('Adds ₹1,188/year', '₹1,188/वर्ष जोड़ता है') : l('Not selected', 'चयनित नहीं')}</small></span><i className={addon ? 'on' : ''} /></button></div>
    </div>}

    {tool === 'authenticity' && <div className="lab-body">
      <div className={`auth-verdict ${authenticity.matches === 4 ? 'valid' : ''}`}><div><span>{l('AUTHENTICITY CHAIN', 'प्रामाणिकता श्रृंखला')}</span><strong>{authenticity.matches}/4 {l('records agree', 'रिकॉर्ड मेल खाते हैं')}</strong><small>{authenticity.matches === 4 ? l('Serial continuity verified across uploaded evidence.', 'अपलोड प्रमाणों में सीरियल निरंतरता सत्यापित।') : l('Mismatch detected. Pause the purchase or claim until corrected.', 'असंगति मिली। सुधार तक खरीद या दावा रोकें।')}</small></div><b>{authenticity.matches === 4 ? '✓' : '!'}</b></div>
      <div className="serial-chain">{([['box','Box label','बॉक्स लेबल'],['invoice','Invoice','इनवॉइस'],['policy','Policy','पॉलिसी'],['repair','Repair record','मरम्मत रिकॉर्ड']] as const).map(([id,en,hi], index) => <label key={id} className={serials[id].trim().toUpperCase() === authenticity.canonical ? 'match' : 'mismatch'}><span><i>{index + 1}</i>{l(en,hi)}</span><input value={serials[id]} onChange={(e) => setSerials((current) => ({ ...current, [id]: e.target.value }))} /><small>{serials[id].trim().toUpperCase() === authenticity.canonical ? l('MATCH', 'मेल') : l('MISMATCH', 'असंगति')}</small></label>)}</div>
      <div className="lab-note"><b>i</b><span><strong>{l('Verification boundary', 'सत्यापन सीमा')}</strong><small>{l('This prototype checks consistency between user-provided records; it does not claim access to an official manufacturer registry.', 'यह प्रोटोटाइप उपयोगकर्ता द्वारा दिए रिकॉर्डों की संगति जाँचता है; यह आधिकारिक निर्माता रजिस्ट्री तक पहुँच का दावा नहीं करता।')}</small></span></div>
    </div>}

    {tool === 'claim' && <div className="lab-body">
      <div className="claim-head"><span>{l('CLAIM FORM AUTOFILL', 'दावा फॉर्म ऑटोफिल')}</span><strong>{l('One verified record → a review-ready claim', 'एक सत्यापित रिकॉर्ड → समीक्षा-तैयार दावा')}</strong><small>{l('Nothing is submitted automatically. You stay in control.', 'कुछ भी अपने आप जमा नहीं होता। नियंत्रण आपके पास रहता है।')}</small></div>
      <div className="claim-grid">{([['buyer','Buyer name','खरीदार का नाम'],['product','Product','उत्पाद'],['serial','Serial number','सीरियल नंबर'],['policy','Policy ID','पॉलिसी आईडी'],['incident','Incident date','घटना तारीख']] as const).map(([id,en,hi]) => <label key={id}><span>{l(en,hi)}</span><input type={id === 'incident' ? 'date' : 'text'} value={claim[id]} onChange={(e) => setClaim((current) => ({ ...current, [id]: e.target.value }))} /></label>)}</div>
      <label className="claim-description"><span>{l('INCIDENT DESCRIPTION', 'घटना विवरण')}</span><textarea value={claim.description} onChange={(e) => setClaim((current) => ({ ...current, description: e.target.value }))} /></label>
      <button className="primary" onClick={() => setPreview(!preview)}>{preview ? l('Hide review copy', 'समीक्षा प्रति छिपाएँ') : l('Generate review copy', 'समीक्षा प्रति बनाएँ')} <span>→</span></button>
      {preview && <div className="claim-preview"><span>{l('REVIEW BEFORE SUBMISSION', 'जमा करने से पहले समीक्षा')}</span><h4>{claim.product}</h4><p><b>{l('Claimant', 'दावेदार')}:</b> {claim.buyer}</p><p><b>{l('Policy / serial', 'पॉलिसी / सीरियल')}:</b> {claim.policy} · {claim.serial}</p><p><b>{l('Incident', 'घटना')}:</b> {claim.incident}</p><p>{claim.description}</p><button onClick={() => setPreview(false)}>✓ {l('I reviewed this draft', 'मैंने इस ड्राफ्ट की समीक्षा की')}</button></div>}
    </div>}

    {tool === 'sandbox' && <div className="lab-body">
      <div className="sandbox-head"><div><span>{l('REVIEWER SANDBOX', 'रिव्यूअर सैंडबॉक्स')}</span><strong>{l('Change the evidence. Watch trust move.', 'प्रमाण बदलें। भरोसा बदलते देखें।')}</strong></div><b className={safeScore >= 75 ? 'good' : safeScore >= 50 ? 'mid' : 'bad'}>{safeScore}<small>/100</small></b></div>
      <div className="score-breakdown"><span style={{ width: `${safeScore}%` }} /></div>
      <div className="sandbox-rules">{([
        ['policy','Policy ID is present','पॉलिसी आईडी मौजूद है',15,-20],['fee','Processing fee is disclosed','प्रोसेसिंग शुल्क बताया गया है',10,-15],['returnRule','Return conditions are unrestricted','रिटर्न शर्तें निर्बंध हैं',10,-10],['receipt','Seller receipt is confirmed','विक्रेता रसीद पुष्ट है',8,-8],['warranty','Warranty record is verified','वारंटी रिकॉर्ड सत्यापित है',7,-10]
      ] as const).map(([id,en,hi,yes,no]) => <button key={id} onClick={() => setRules((current) => ({ ...current, [id]: !current[id] }))}><i className={rules[id] ? 'yes' : 'no'}>{rules[id] ? '+' : ''}{rules[id] ? yes : no}</i><span><strong>{l(en,hi)}</strong><small>{rules[id] ? l('Evidence supports this claim', 'प्रमाण इस दावे का समर्थन करता है') : l('Missing or contradicted', 'गायब या विरोधाभासी')}</small></span><em className={rules[id] ? 'on' : ''} /></button>)}</div>
      <button className="sandbox-reset" onClick={() => setRules({ policy: true, fee: false, returnRule: false, receipt: true, warranty: true })}>↺ {l('Reset scenario', 'परिदृश्य रीसेट करें')}</button>
      <div className="lab-note"><b>◎</b><span><strong>{l('Transparent, not magical', 'पारदर्शी, जादुई नहीं')}</strong><small>{l('The score changes through visible evidence rules. Reviewers can inspect every contribution instead of trusting an unexplained AI number.', 'स्कोर दिखाई देने वाले प्रमाण नियमों से बदलता है। रिव्यूअर अस्पष्ट AI संख्या पर भरोसा करने के बजाय हर योगदान जाँच सकते हैं।')}</small></span></div>
    </div>}
  </div>;
}
