'use client';

import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import './integrity-lab.css';

type Lang = 'en' | 'hi';
type Stage = 'passport' | 'checkout' | 'reality' | 'claim';
type EvidenceKey = 'invoice' | 'listing' | 'checkout' | 'unboxing' | 'serial' | 'support';

type Passport = {
  product: string;
  variant: string;
  seller: string;
  listingPrice: number;
  finalPrice: number;
  cashback: number;
  warranty: string;
  returns: string;
  delivery: string;
};

const defaultPassport: Passport = {
  product: 'iQOO Neo',
  variant: '256 GB · Titanium Blue',
  seller: 'Nova Electronics',
  listingPrice: 49999,
  finalPrice: 49999,
  cashback: 5000,
  warranty: '2-year comprehensive warranty',
  returns: '7-day return',
  delivery: '10 Sep 2026',
};

export function IntegrityLab({ language }: { language: Lang }) {
  const l = (en: string, hi: string) => language === 'hi' ? hi : en;
  const [stage, setStage] = useState<Stage>('passport');
  const [passport, setPassport] = useState<Passport>(defaultPassport);
  const [passportHash, setPassportHash] = useState('');
  const [capturedAt, setCapturedAt] = useState('');
  const [checkout, setCheckout] = useState({
    cartPrice: 49999,
    payable: 51998,
    cashbackVisible: false,
    warranty: '1-year manufacturer warranty',
    addOn: 999,
    subscription: true,
    urgency: true,
  });
  const [actual, setActual] = useState({
    product: 'iQOO Neo',
    variant: '128 GB · Titanium Blue',
    seller: 'Nova Electronics',
    serialMatch: false,
    warranty: '1-year manufacturer warranty',
    condition: 'Seal broken; minor frame scratch',
  });
  const [evidence, setEvidence] = useState<Record<EvidenceKey, boolean>>({
    invoice: true,
    listing: true,
    checkout: true,
    unboxing: false,
    serial: false,
    support: false,
  });
  const [evidenceHash, setEvidenceHash] = useState('');
  const [evidenceName, setEvidenceName] = useState('');
  const [draftReady, setDraftReady] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('buysure-integrity-v14');
      if (!saved) return;
      const data = JSON.parse(saved);
      queueMicrotask(() => {
        if (data.passport) setPassport(data.passport);
        if (data.checkout) setCheckout(data.checkout);
        if (data.actual) setActual(data.actual);
        if (data.evidence) setEvidence(data.evidence);
        if (data.passportHash) setPassportHash(data.passportHash);
        if (data.capturedAt) setCapturedAt(data.capturedAt);
      });
    } catch {
      // A damaged local draft should never block the workspace.
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('buysure-integrity-v14', JSON.stringify({
      passport, checkout, actual, evidence, passportHash, capturedAt,
    }));
  }, [passport, checkout, actual, evidence, passportHash, capturedAt]);

  const checkoutAlerts = useMemo(() => {
    const alerts: { type: string; title: [string, string]; detail: [string, string]; amount?: number }[] = [];
    if (checkout.payable > passport.finalPrice) alerts.push({
      type: 'drip',
      title: ['Drip pricing detected', 'ड्रिप प्राइसिंग मिली'],
      detail: [
        `Final payable is ₹${(checkout.payable - passport.finalPrice).toLocaleString('en-IN')} above the captured offer.`,
        `अंतिम भुगतान कैप्चर किए ऑफ़र से ₹${(checkout.payable - passport.finalPrice).toLocaleString('en-IN')} अधिक है।`,
      ],
      amount: checkout.payable - passport.finalPrice,
    });
    if (checkout.addOn > 0) alerts.push({
      type: 'basket',
      title: ['Possible basket sneaking', 'संभावित बास्केट स्नीकिंग'],
      detail: [`₹${checkout.addOn.toLocaleString('en-IN')} add-on appeared during checkout.`, `चेकआउट के दौरान ₹${checkout.addOn.toLocaleString('en-IN')} ऐड-ऑन जुड़ा।`],
      amount: checkout.addOn,
    });
    if (!checkout.cashbackVisible && passport.cashback > 0) alerts.push({
      type: 'bait',
      title: ['Advertised benefit disappeared', 'विज्ञापित लाभ गायब'],
      detail: ['Cashback is absent from the final order summary.', 'कैशबैक अंतिम ऑर्डर सारांश में नहीं है।'],
    });
    if (checkout.warranty.trim().toLowerCase() !== passport.warranty.trim().toLowerCase()) alerts.push({
      type: 'switch',
      title: ['Warranty changed before payment', 'भुगतान से पहले वारंटी बदली'],
      detail: [`“${passport.warranty}” became “${checkout.warranty}”.`, `“${passport.warranty}” बदलकर “${checkout.warranty}” हो गई।`],
    });
    if (checkout.subscription) alerts.push({
      type: 'subscription',
      title: ['Recurring plan selected', 'आवर्ती योजना चुनी गई'],
      detail: ['Confirm that the protection subscription is intentional.', 'पुष्टि करें कि सुरक्षा सदस्यता जानबूझकर चुनी गई है।'],
    });
    if (checkout.urgency) alerts.push({
      type: 'urgency',
      title: ['Urgency pressure found', 'जल्दबाज़ी का दबाव मिला'],
      detail: ['A countdown or low-stock message may be influencing the decision.', 'काउंटडाउन या कम-स्टॉक संदेश निर्णय को प्रभावित कर सकता है।'],
    });
    return alerts;
  }, [checkout, passport]);

  const mismatches = useMemo(() => {
    const items: { title: [string, string]; promised: string; received: string; severity: 'high' | 'medium' }[] = [];
    if (actual.product.trim().toLowerCase() !== passport.product.trim().toLowerCase()) items.push({
      title: ['Wrong product', 'गलत उत्पाद'], promised: passport.product, received: actual.product, severity: 'high',
    });
    if (actual.variant.trim().toLowerCase() !== passport.variant.trim().toLowerCase()) items.push({
      title: ['Variant mismatch', 'वेरिएंट मेल नहीं'], promised: passport.variant, received: actual.variant, severity: 'high',
    });
    if (!actual.serialMatch) items.push({
      title: ['Serial chain unverified', 'सीरियल क्रम असत्यापित'], promised: 'Box = invoice = device', received: 'Serial numbers do not match', severity: 'high',
    });
    if (actual.warranty.trim().toLowerCase() !== passport.warranty.trim().toLowerCase()) items.push({
      title: ['Warranty mismatch', 'वारंटी मेल नहीं'], promised: passport.warranty, received: actual.warranty, severity: 'medium',
    });
    if (/broken|scratch|damage|crack/i.test(actual.condition)) items.push({
      title: ['Condition issue', 'स्थिति संबंधी समस्या'], promised: 'Factory-sealed, undamaged', received: actual.condition, severity: 'high',
    });
    return items;
  }, [actual, passport]);

  const evidenceWeights: Record<EvidenceKey, number> = { invoice: 18, listing: 18, checkout: 16, unboxing: 22, serial: 16, support: 10 };
  const readiness = (Object.keys(evidence) as EvidenceKey[]).reduce((score, key) => score + (evidence[key] ? evidenceWeights[key] : 0), 0);
  const readinessLabel = readiness >= 85 ? l('ESCALATION READY', 'एस्केलेशन तैयार') : readiness >= 60 ? l('ACTIONABLE', 'कार्रवाई योग्य') : l('EVIDENCE GAPS', 'प्रमाण अधूरा');
  const nextMissing = (Object.keys(evidence) as EvidenceKey[]).find((key) => !evidence[key]);

  async function sealPassport() {
    const time = new Date().toISOString();
    const payload = JSON.stringify({ type: 'BuySure Purchase Passport', version: 14, capturedAt: time, ...passport });
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(payload));
    setPassportHash(Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, '0')).join('').toUpperCase());
    setCapturedAt(time);
  }

  function downloadPassport() {
    const record = JSON.stringify({ type: 'BuySure Purchase Passport', capturedAt, fingerprint: passportHash, ...passport }, null, 2);
    const url = URL.createObjectURL(new Blob([record], { type: 'application/json' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'buysure-purchase-passport.json';
    anchor.click();
    URL.revokeObjectURL(url);
  }

  async function captureEvidence(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const digest = await crypto.subtle.digest('SHA-256', await file.arrayBuffer());
    setEvidenceHash(Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, '0')).join('').slice(0, 24).toUpperCase());
    setEvidenceName(file.name);
    setEvidence({ ...evidence, unboxing: true });
    event.target.value = '';
  }

  const stages: { id: Stage; number: string; en: string; hi: string }[] = [
    { id: 'passport', number: '01', en: 'Freeze promise', hi: 'वादा सुरक्षित करें' },
    { id: 'checkout', number: '02', en: 'Audit checkout', hi: 'चेकआउट जाँचें' },
    { id: 'reality', number: '03', en: 'Verify delivery', hi: 'डिलीवरी सत्यापित करें' },
    { id: 'claim', number: '04', en: 'Prepare remedy', hi: 'समाधान तैयार करें' },
  ];
  const evidenceLabels: Record<EvidenceKey, [string, string]> = {
    invoice: ['Tax invoice', 'कर इनवॉइस'],
    listing: ['Listing snapshot', 'लिस्टिंग स्नैपशॉट'],
    checkout: ['Checkout summary', 'चेकआउट सारांश'],
    unboxing: ['Continuous unboxing', 'निरंतर अनबॉक्सिंग'],
    serial: ['Serial / IMEI proof', 'सीरियल / IMEI प्रमाण'],
    support: ['Support conversation', 'सहायता बातचीत'],
  };

  return <div className="suite-panel integrity-lab">
    <div className="integrity-hero">
      <div><span>BUYSURE INTEGRITY ENGINE</span><h3>{l('One verified timeline from promise to remedy.', 'वादे से समाधान तक एक सत्यापित समयरेखा।')}</h3><p>{l('Capture what was sold, detect checkout manipulation, verify delivery and build a claim-ready record.', 'क्या बेचा गया उसे सुरक्षित करें, चेकआउट हेरफेर पहचानें, डिलीवरी सत्यापित करें और दावा-तैयार रिकॉर्ड बनाएँ।')}</p></div>
      <b>{readiness}<small>{l('readiness', 'तत्परता')}</small></b>
    </div>
    <div className="integrity-spine" role="tablist" aria-label={l('Purchase integrity stages', 'खरीद सत्यापन चरण')}>
      {stages.map((item) => <button key={item.id} className={stage === item.id ? 'active' : ''} onClick={() => setStage(item.id)}><i>{item.number}</i><span>{l(item.en, item.hi)}</span></button>)}
    </div>

    {stage === 'passport' && <div className="integrity-body">
      <div className="integrity-heading"><span>{l('PURCHASE PASSPORT', 'खरीद पासपोर्ट')}</span><strong>{l('Freeze the exact promise before payment', 'भुगतान से पहले सटीक वादा सुरक्षित करें')}</strong><small>{l('The fingerprint changes if any captured term changes.', 'किसी दर्ज शर्त के बदलने पर फिंगरप्रिंट बदल जाता है।')}</small></div>
      <div className="passport-form">
        <label><span>{l('PRODUCT', 'उत्पाद')}</span><input value={passport.product} onChange={(e) => { setPassport({ ...passport, product: e.target.value }); setPassportHash(''); }} /></label>
        <label><span>{l('VARIANT', 'वेरिएंट')}</span><input value={passport.variant} onChange={(e) => { setPassport({ ...passport, variant: e.target.value }); setPassportHash(''); }} /></label>
        <label><span>{l('SELLER', 'विक्रेता')}</span><input value={passport.seller} onChange={(e) => { setPassport({ ...passport, seller: e.target.value }); setPassportHash(''); }} /></label>
        <label><span>{l('LISTING PRICE', 'लिस्टिंग कीमत')}</span><div>₹ <input type="number" value={passport.listingPrice} onChange={(e) => { setPassport({ ...passport, listingPrice: Number(e.target.value) }); setPassportHash(''); }} /></div></label>
        <label><span>{l('PROMISED FINAL PRICE', 'वादा अंतिम कीमत')}</span><div>₹ <input type="number" value={passport.finalPrice} onChange={(e) => { setPassport({ ...passport, finalPrice: Number(e.target.value) }); setPassportHash(''); }} /></div></label>
        <label><span>{l('PROMISED CASHBACK', 'वादा कैशबैक')}</span><div>₹ <input type="number" value={passport.cashback} onChange={(e) => { setPassport({ ...passport, cashback: Number(e.target.value) }); setPassportHash(''); }} /></div></label>
        <label><span>{l('WARRANTY', 'वारंटी')}</span><input value={passport.warranty} onChange={(e) => { setPassport({ ...passport, warranty: e.target.value }); setPassportHash(''); }} /></label>
        <label><span>{l('RETURN PROMISE', 'रिटर्न वादा')}</span><input value={passport.returns} onChange={(e) => { setPassport({ ...passport, returns: e.target.value }); setPassportHash(''); }} /></label>
        <label><span>{l('DELIVERY PROMISE', 'डिलीवरी वादा')}</span><input value={passport.delivery} onChange={(e) => { setPassport({ ...passport, delivery: e.target.value }); setPassportHash(''); }} /></label>
      </div>
      {!passportHash ? <button className="primary" onClick={sealPassport}>{l('Seal purchase passport', 'खरीद पासपोर्ट सील करें')} <span>→</span></button> :
        <div className="passport-sealed"><b>✓</b><p><strong>{l('Promise record sealed', 'वादा रिकॉर्ड सील')}</strong><small>{new Date(capturedAt).toLocaleString(language === 'hi' ? 'hi-IN' : 'en-IN')}</small><code>SHA-256 · {passportHash.slice(0, 28)}</code></p><button onClick={downloadPassport}>{l('Export', 'निर्यात')}</button></div>}
      <button className="integrity-next" disabled={!passportHash} onClick={() => setStage('checkout')}>{l('Continue to checkout audit', 'चेकआउट जाँच पर जाएँ')} →</button>
    </div>}

    {stage === 'checkout' && <div className="integrity-body">
      <div className="integrity-heading"><span>{l('LIVE CHECKOUT GUARDIAN', 'लाइव चेकआउट गार्डियन')}</span><strong>{l('Find changes before money leaves', 'भुगतान से पहले बदलाव पहचानें')}</strong><small>{l('Prototype inputs simulate captured product, cart and payment screens.', 'प्रोटोटाइप इनपुट कैप्चर किए उत्पाद, कार्ट और भुगतान स्क्रीन सिमुलेट करते हैं।')}</small></div>
      <div className="checkout-rail"><div><span>{l('LISTING', 'लिस्टिंग')}</span><b>₹{passport.listingPrice.toLocaleString('en-IN')}</b></div><i>→</i><div><span>{l('CART', 'कार्ट')}</span><input type="number" value={checkout.cartPrice} onChange={(e) => setCheckout({ ...checkout, cartPrice: Number(e.target.value) })} /></div><i>→</i><div className="risk"><span>{l('PAYMENT', 'भुगतान')}</span><input type="number" value={checkout.payable} onChange={(e) => setCheckout({ ...checkout, payable: Number(e.target.value) })} /></div></div>
      <div className="checkout-controls">
        <label><span>{l('FINAL WARRANTY', 'अंतिम वारंटी')}</span><input value={checkout.warranty} onChange={(e) => setCheckout({ ...checkout, warranty: e.target.value })} /></label>
        <label><span>{l('NEW ADD-ON', 'नया ऐड-ऑन')}</span><div>₹ <input type="number" value={checkout.addOn} onChange={(e) => setCheckout({ ...checkout, addOn: Number(e.target.value) })} /></div></label>
      </div>
      <div className="integrity-toggles">
        <button className={checkout.cashbackVisible ? 'on' : ''} onClick={() => setCheckout({ ...checkout, cashbackVisible: !checkout.cashbackVisible })}><i>{checkout.cashbackVisible ? '✓' : '×'}</i><span><strong>{l('Cashback visible', 'कैशबैक दिखाई देता है')}</strong><small>{l('Present in final order', 'अंतिम ऑर्डर में मौजूद')}</small></span></button>
        <button className={!checkout.subscription ? 'on' : ''} onClick={() => setCheckout({ ...checkout, subscription: !checkout.subscription })}><i>{!checkout.subscription ? '✓' : '!'}</i><span><strong>{l('No hidden subscription', 'कोई छिपी सदस्यता नहीं')}</strong><small>{checkout.subscription ? l('Recurring plan selected', 'आवर्ती योजना चुनी गई') : l('Clear', 'स्पष्ट')}</small></span></button>
        <button className={!checkout.urgency ? 'on' : ''} onClick={() => setCheckout({ ...checkout, urgency: !checkout.urgency })}><i>{!checkout.urgency ? '✓' : '!'}</i><span><strong>{l('No urgency pressure', 'जल्दबाज़ी का दबाव नहीं')}</strong><small>{checkout.urgency ? l('Countdown / low stock', 'काउंटडाउन / कम स्टॉक') : l('Clear', 'स्पष्ट')}</small></span></button>
      </div>
      <div className="dark-pattern-report"><div><span>{l('CHECKOUT FINDINGS', 'चेकआउट निष्कर्ष')}</span><b>{checkoutAlerts.length}</b></div>{checkoutAlerts.map((alert) => <article key={alert.type}><i>!</i><p><strong>{l(...alert.title)}</strong><small>{l(...alert.detail)}</small></p></article>)}</div>
      <button className="integrity-next" onClick={() => setStage('reality')}>{l('Verify delivered product', 'डिलीवर उत्पाद सत्यापित करें')} →</button>
    </div>}

    {stage === 'reality' && <div className="integrity-body">
      <div className="integrity-heading"><span>{l('PROMISE VS REALITY', 'वादा बनाम वास्तविकता')}</span><strong>{l('Compare the delivery against the frozen record', 'डिलीवरी की सुरक्षित रिकॉर्ड से तुलना करें')}</strong><small>{l('Every mismatch becomes a structured claim fact.', 'हर असंगति एक संरचित दावा तथ्य बनती है।')}</small></div>
      <div className="reality-grid">
        <div><span>{l('PROMISED', 'वादा')}</span><strong>{passport.product}</strong><small>{passport.variant}</small><small>{passport.warranty}</small><small>{l('Factory-sealed, undamaged', 'फैक्टरी-सील, बिना क्षति')}</small></div>
        <b>⇄</b>
        <div><span>{l('RECEIVED', 'प्राप्त')}</span><input value={actual.product} onChange={(e) => setActual({ ...actual, product: e.target.value })} /><input value={actual.variant} onChange={(e) => setActual({ ...actual, variant: e.target.value })} /><input value={actual.warranty} onChange={(e) => setActual({ ...actual, warranty: e.target.value })} /><input value={actual.condition} onChange={(e) => setActual({ ...actual, condition: e.target.value })} /></div>
      </div>
      <button className={`serial-toggle ${actual.serialMatch ? 'on' : ''}`} onClick={() => { setActual({ ...actual, serialMatch: !actual.serialMatch }); setEvidence({ ...evidence, serial: !actual.serialMatch }); }}><i>{actual.serialMatch ? '✓' : '×'}</i><span><strong>{l('Box, invoice and device serial match', 'बॉक्स, इनवॉइस और डिवाइस सीरियल मेल खाते हैं')}</strong><small>{actual.serialMatch ? l('Identity chain verified', 'पहचान क्रम सत्यापित') : l('Potential substitution risk', 'संभावित अदला-बदली जोखिम')}</small></span></button>
      <label className="evidence-capture"><b>▣</b><span><strong>{l('Add unboxing evidence', 'अनबॉक्सिंग प्रमाण जोड़ें')}</strong><small>{evidenceName || l('Camera or image upload · hashed on device', 'कैमरा या चित्र अपलोड · डिवाइस पर हैश')}</small>{evidenceHash && <code>SHA-256 · {evidenceHash}</code>}</span><input type="file" accept="image/*" capture="environment" onChange={captureEvidence} /></label>
      <div className="mismatch-list"><div><span>{l('STRUCTURED MISMATCHES', 'संरचित असंगतियाँ')}</span><b>{mismatches.length}</b></div>{mismatches.length === 0 ? <p className="all-clear">✓ {l('Delivery matches the recorded promise.', 'डिलीवरी दर्ज वादे से मेल खाती है।')}</p> : mismatches.map((item) => <article key={item.title[0]} className={item.severity}><i>!</i><p><strong>{l(...item.title)}</strong><small><s>{item.promised}</s> → {item.received}</small></p></article>)}</div>
      <button className="integrity-next" onClick={() => setStage('claim')}>{l('Build claim-ready record', 'दावा-तैयार रिकॉर्ड बनाएँ')} →</button>
    </div>}

    {stage === 'claim' && <div className="integrity-body">
      <div className="readiness-card"><div><span>{l('CLAIM READINESS SCORE', 'दावा तत्परता स्कोर')}</span><strong>{readinessLabel}</strong><small>{l(`${mismatches.length} mismatches linked to ${Object.values(evidence).filter(Boolean).length} evidence items`, `${mismatches.length} असंगतियाँ ${Object.values(evidence).filter(Boolean).length} प्रमाणों से जुड़ीं`)}</small></div><b>{readiness}<small>/100</small></b><div className="readiness-bar"><i style={{ width: `${readiness}%` }} /></div></div>
      <div className="evidence-matrix"><div><span>{l('EVIDENCE MATRIX', 'प्रमाण मैट्रिक्स')}</span><b>{Object.values(evidence).filter(Boolean).length}/6</b></div>{(Object.keys(evidence) as EvidenceKey[]).map((key) => <button key={key} className={evidence[key] ? 'ready' : ''} onClick={() => { setEvidence({ ...evidence, [key]: !evidence[key] }); setDraftReady(false); }}><i>{evidence[key] ? '✓' : '+'}</i><span><strong>{l(...evidenceLabels[key])}</strong><small>+{evidenceWeights[key]} {l('readiness points', 'तत्परता अंक')}</small></span></button>)}</div>
      {nextMissing ? <div className="readiness-action"><b>→</b><p><strong>{l('Best next action', 'सर्वोत्तम अगली कार्रवाई')}</strong><small>{l(`Add “${evidenceLabels[nextMissing][0]}” to increase readiness by ${evidenceWeights[nextMissing]} points.`, `तत्परता ${evidenceWeights[nextMissing]} अंक बढ़ाने के लिए “${evidenceLabels[nextMissing][1]}” जोड़ें।`)}</small></p></div> : <div className="readiness-action ready"><b>✓</b><p><strong>{l('Evidence package complete', 'प्रमाण पैकेज पूरा')}</strong><small>{l('The record is ready for user-reviewed escalation.', 'रिकॉर्ड उपयोगकर्ता-समीक्षित एस्केलेशन के लिए तैयार है।')}</small></p></div>}
      <button className="primary" disabled={readiness < 75 || mismatches.length === 0} onClick={() => setDraftReady(true)}>{readiness < 75 ? l('Reach 75 to generate remedy', 'समाधान बनाने के लिए 75 तक पहुँचें') : mismatches.length === 0 ? l('No mismatch requires a claim', 'किसी असंगति पर दावा आवश्यक नहीं') : l('Generate evidence-linked remedy', 'प्रमाण-जुड़ा समाधान बनाएँ')} <span>→</span></button>
      {draftReady && <div className="remedy-card"><span>{l('RECOMMENDED REMEDY', 'सुझाया गया समाधान')}</span><h4>{l('Request replacement for material mismatch', 'महत्वपूर्ण असंगति के लिए प्रतिस्थापन माँगें')}</h4><p>{l(`The delivered item differs from the Purchase Passport in ${mismatches.length} material ways. Request a replacement under the captured return promise, attaching the invoice, listing record and hashed delivery evidence.`, `डिलीवर वस्तु खरीद पासपोर्ट से ${mismatches.length} महत्वपूर्ण तरीकों से अलग है। इनवॉइस, लिस्टिंग रिकॉर्ड और हैश किए डिलीवरी प्रमाण के साथ दर्ज रिटर्न वादे के तहत प्रतिस्थापन माँगें।`)}</p><div><b>1</b><small>{l('Marketplace replacement', 'मार्केटप्लेस प्रतिस्थापन')}</small><i>→</i><b>2</b><small>{l('Written reference', 'लिखित संदर्भ')}</small><i>→</i><b>3</b><small>{l('Consumer escalation', 'उपभोक्ता एस्केलेशन')}</small></div><em>{l('BuySure prepares evidence and guidance; the user reviews and submits every request.', 'BuySure प्रमाण और मार्गदर्शन तैयार करता है; उपयोगकर्ता हर अनुरोध की समीक्षा कर जमा करता है।')}</em></div>}
      <button className="integrity-reset" onClick={() => { setPassport(defaultPassport); setCheckout({ cartPrice: 49999, payable: 51998, cashbackVisible: false, warranty: '1-year manufacturer warranty', addOn: 999, subscription: true, urgency: true }); setActual({ product: 'iQOO Neo', variant: '128 GB · Titanium Blue', seller: 'Nova Electronics', serialMatch: false, warranty: '1-year manufacturer warranty', condition: 'Seal broken; minor frame scratch' }); setEvidence({ invoice: true, listing: true, checkout: true, unboxing: false, serial: false, support: false }); setPassportHash(''); setCapturedAt(''); setDraftReady(false); setStage('passport'); }}>{l('Reset guided scenario', 'निर्देशित परिदृश्य रीसेट करें')}</button>
    </div>}
  </div>;
}
