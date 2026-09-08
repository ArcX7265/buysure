'use client';

import QRCode from 'qrcode';
import { useEffect, useState } from 'react';

type Lang = 'en' | 'hi';
type Mode = 'checkout' | 'contract' | 'resolve';
type ClaimType = 'delivery' | 'damage' | 'warranty' | 'cashback';

export function PurchaseGuardian({ language }: { language: Lang }) {
  const l = (en: string, hi: string) => language === 'hi' ? hi : en;
  const [mode, setMode] = useState<Mode>('checkout');
  const [journey, setJourney] = useState({ product: 49999, cart: 49999, checkout: 50998, fee: 999, warrantyBefore: '2-year comprehensive warranty', warrantyAfter: '1-year manufacturer warranty', cashbackPresent: false });
  const [contract, setContract] = useState({ seller: 'Nova Electronics', product: 'iQOO Neo · 256 GB', price: '₹50,998', warranty: '2 years', returns: '7 days', delivery: '10 Sep 2026' });
  const [sellerConfirmed, setSellerConfirmed] = useState(false);
  const [qr, setQr] = useState('');
  const [claimType, setClaimType] = useState<ClaimType>('damage');
  const [checked, setChecked] = useState<Record<string, boolean>>({ invoice: true, photo: true, policy: false, jobSheet: false });
  const [drafted, setDrafted] = useState(false);

  const priceDelta = journey.checkout - journey.product;
  const checkoutAlerts = [
    priceDelta !== 0 ? l(`Final payable changed by ₹${Math.abs(priceDelta).toLocaleString('en-IN')}.`, `अंतिम भुगतान ₹${Math.abs(priceDelta).toLocaleString('en-IN')} बदला।`) : '',
    journey.fee > 0 ? l(`₹${journey.fee.toLocaleString('en-IN')} processing fee appeared at checkout.`, `चेकआउट पर ₹${journey.fee.toLocaleString('en-IN')} प्रोसेसिंग शुल्क जुड़ा।`) : '',
    journey.warrantyBefore.trim().toLowerCase() !== journey.warrantyAfter.trim().toLowerCase() ? l('Warranty promise changed before payment.', 'भुगतान से पहले वारंटी का वादा बदल गया।') : '',
    !journey.cashbackPresent ? l('Advertised cashback is absent from the final order.', 'विज्ञापित कैशबैक अंतिम ऑर्डर में नहीं है।') : '',
  ].filter(Boolean);

  useEffect(() => {
    const payload = JSON.stringify({ type: 'BuySure Seller Promise Contract', version: 1, ...contract, sellerConfirmed, scope: 'User-entered prototype record' });
    QRCode.toDataURL(payload, { width: 260, margin: 1, errorCorrectionLevel: 'M', color: { dark: '#071421', light: '#ffffff' } }).then(setQr).catch(() => setQr(''));
  }, [contract, sellerConfirmed]);

  const routes: Record<ClaimType, { title: [string,string]; owner: [string,string]; days: number; docs: string[]; draft: [string,string] }> = {
    delivery: { title: ['Missing or delayed delivery','गायब या विलंबित डिलीवरी'], owner: ['Seller → marketplace','विक्रेता → मार्केटप्लेस'], days: 2, docs: ['invoice','photo'], draft: ['My order has not been delivered within the committed timeline. Please provide verified delivery proof or process a resolution.','मेरा ऑर्डर तय समय में नहीं मिला। कृपया सत्यापित डिलीवरी प्रमाण दें या समाधान करें।'] },
    damage: { title: ['Accidental product damage','दुर्घटनावश उत्पाद क्षति'], owner: ['Insurer → authorised service centre','बीमाकर्ता → अधिकृत सेवा केंद्र'], days: 3, docs: ['invoice','photo','policy'], draft: ['I am reporting accidental damage under the attached protection policy. Please register the claim and share the inspection reference.','मैं संलग्न सुरक्षा पॉलिसी के अंतर्गत दुर्घटनावश क्षति की सूचना दे रहा/रही हूँ। कृपया दावा दर्ज कर निरीक्षण संदर्भ साझा करें।'] },
    warranty: { title: ['Manufacturing defect','निर्माण दोष'], owner: ['Manufacturer service centre','निर्माता सेवा केंद्र'], days: 7, docs: ['invoice','photo','jobSheet'], draft: ['The product developed a manufacturing defect during the warranty period. Please inspect it and issue a written job sheet.','वारंटी अवधि में उत्पाद में निर्माण दोष आया। कृपया निरीक्षण कर लिखित जॉब शीट दें।'] },
    cashback: { title: ['Cashback not received','कैशबैक प्राप्त नहीं हुआ'], owner: ['Bank → marketplace','बैंक → मार्केटप्लेस'], days: 5, docs: ['invoice'], draft: ['The advertised cashback has not been credited despite meeting the stated conditions. Please verify eligibility and provide a resolution date.','बताई गई शर्तें पूरी होने के बावजूद कैशबैक नहीं मिला। कृपया पात्रता जाँचकर समाधान की तारीख दें।'] },
  };
  const route = routes[claimType];
  const completeness = Math.round(route.docs.filter((doc) => checked[doc]).length / route.docs.length * 100);
  const tabs: { id: Mode; icon: string; en: string; hi: string }[] = [
    { id: 'checkout', icon: '◉', en: 'Checkout Guardian', hi: 'चेकआउट गार्डियन' },
    { id: 'contract', icon: '⌁', en: 'Seller Contract', hi: 'विक्रेता अनुबंध' },
    { id: 'resolve', icon: '↗', en: 'Resolution Autopilot', hi: 'समाधान ऑटोपायलट' },
  ];

  return <div className="suite-panel guardian-module">
    <div className="guardian-hero"><div><span>{l('PURCHASE GUARDIAN', 'खरीद गार्डियन')}</span><h3>{l('Catch the change. Confirm the promise. Resolve the problem.', 'बदलाव पकड़ें। वादा पक्का करें। समस्या सुलझाएँ।')}</h3></div><b>LIVE<small>{l('interactive proof flow', 'इंटरैक्टिव प्रमाण प्रवाह')}</small></b></div>
    <div className="guardian-tabs">{tabs.map((tab) => <button key={tab.id} onClick={() => setMode(tab.id)} className={mode === tab.id ? 'active' : ''}><i>{tab.icon}</i><span>{l(tab.en, tab.hi)}</span></button>)}</div>

    {mode === 'checkout' && <div className="guardian-body">
      <div className="journey-map"><span>{l('LIVE CHECKOUT JOURNEY', 'लाइव चेकआउट यात्रा')}</span><div><b>{l('PRODUCT', 'उत्पाद')}<small>₹{journey.product.toLocaleString('en-IN')}</small></b><i>→</i><b>{l('CART', 'कार्ट')}<small>₹{journey.cart.toLocaleString('en-IN')}</small></b><i>→</i><b className="warn">{l('PAYMENT', 'भुगतान')}<small>₹{journey.checkout.toLocaleString('en-IN')}</small></b></div></div>
      <div className="guardian-inputs">{([['product','Product-page price','उत्पाद-पेज कीमत'],['cart','Cart price','कार्ट कीमत'],['checkout','Final payable','अंतिम भुगतान'],['fee','Processing fee','प्रोसेसिंग शुल्क']] as const).map(([key,en,hi]) => <label key={key}><span>{l(en,hi)}</span><div>₹ <input type="number" min="0" value={journey[key]} onChange={(event) => setJourney({ ...journey, [key]: Number(event.target.value) })} /></div></label>)}</div>
      <div className="promise-compare"><label><span>{l('PROMISED WARRANTY', 'वादा की गई वारंटी')}</span><input value={journey.warrantyBefore} onChange={(event) => setJourney({ ...journey, warrantyBefore: event.target.value })} /></label><b>→</b><label><span>{l('FINAL WARRANTY', 'अंतिम वारंटी')}</span><input value={journey.warrantyAfter} onChange={(event) => setJourney({ ...journey, warrantyAfter: event.target.value })} /></label></div>
      <button className={`cashback-toggle ${journey.cashbackPresent ? 'on' : ''}`} onClick={() => setJourney({ ...journey, cashbackPresent: !journey.cashbackPresent })}><i>{journey.cashbackPresent ? '✓' : '×'}</i><span><strong>{l('Advertised cashback in final order', 'अंतिम ऑर्डर में विज्ञापित कैशबैक')}</strong><small>{journey.cashbackPresent ? l('Evidence present', 'प्रमाण मौजूद') : l('Missing at checkout', 'चेकआउट पर गायब')}</small></span></button>
      <div className="guardian-alerts"><div><span>{l('CHANGE ALERTS', 'बदलाव चेतावनी')}</span><b>{checkoutAlerts.length}</b></div>{checkoutAlerts.map((alert, index) => <p key={alert}><i>{index + 1}</i>{alert}</p>)}</div>
      <div className="guardian-boundary"><b>i</b><p><strong>{l('Prototype boundary', 'प्रोटोटाइप सीमा')}</strong><small>{l('This interactive prototype compares user-entered or captured stages. Production browser and commerce integrations would automate capture with permission.', 'यह इंटरैक्टिव प्रोटोटाइप उपयोगकर्ता द्वारा दर्ज या कैप्चर किए चरणों की तुलना करता है। उत्पादन में अनुमति के साथ ब्राउज़र और कॉमर्स एकीकरण कैप्चर को स्वचालित करेंगे।')}</small></p></div>
    </div>}

    {mode === 'contract' && <div className="guardian-body">
      <div className="contract-status"><div><span>{l('SELLER QR PROMISE CONTRACT', 'विक्रेता QR वादा अनुबंध')}</span><strong>{sellerConfirmed ? l('Seller-confirmed', 'विक्रेता-पुष्ट') : l('Awaiting confirmation', 'पुष्टि की प्रतीक्षा')}</strong><small>{l('A shared, scannable record of the exact deal before payment.', 'भुगतान से पहले सटीक सौदे का साझा, स्कैन योग्य रिकॉर्ड।')}</small></div><b className={sellerConfirmed ? 'confirmed' : ''}>{sellerConfirmed ? '✓' : '…'}</b></div>
      <div className="contract-grid"><div className="contract-fields">{([['seller','Seller','विक्रेता'],['product','Product','उत्पाद'],['price','Final price','अंतिम कीमत'],['warranty','Warranty','वारंटी'],['returns','Return window','रिटर्न अवधि'],['delivery','Delivery by','डिलीवरी तक']] as const).map(([key,en,hi]) => <label key={key}><span>{l(en,hi)}</span><input value={contract[key]} onChange={(event) => { setContract({ ...contract, [key]: event.target.value }); setSellerConfirmed(false); }} /></label>)}</div>{qr && <div className="guardian-qr"><img src={qr} alt={l('Scannable BuySure seller promise contract', 'स्कैन योग्य BuySure विक्रेता वादा अनुबंध')} /><small>{l('SCAN TO READ TERMS', 'शर्तें पढ़ने के लिए स्कैन करें')}</small></div>}</div>
      <button className={`confirm-contract ${sellerConfirmed ? 'done' : ''}`} onClick={() => setSellerConfirmed(!sellerConfirmed)}><b>{sellerConfirmed ? '✓' : '○'}</b><span><strong>{sellerConfirmed ? l('Seller confirmation recorded', 'विक्रेता पुष्टि दर्ज') : l('Simulate seller confirmation', 'विक्रेता पुष्टि सिमुलेट करें')}</strong><small>{l('Prototype confirmation only—production requires verified seller identity and consent.', 'केवल प्रोटोटाइप पुष्टि—उत्पादन में सत्यापित विक्रेता पहचान और सहमति आवश्यक है।')}</small></span></button>
    </div>}

    {mode === 'resolve' && <div className="guardian-body">
      <div className="resolution-top"><span>{l('RETURN & CLAIM AUTOPILOT', 'रिटर्न और दावा ऑटोपायलट')}</span><h3>{l('What went wrong?', 'क्या समस्या हुई?')}</h3><div>{(Object.keys(routes) as ClaimType[]).map((key) => <button key={key} className={claimType === key ? 'active' : ''} onClick={() => { setClaimType(key); setDrafted(false); }}>{l(...routes[key].title)}</button>)}</div></div>
      <div className="route-card"><span>{l('RECOMMENDED ROUTE', 'सुझाया गया मार्ग')}</span><div><b>1</b><p><strong>{l(...route.owner)}</strong><small>{l(`Expected first response: ${route.days} working days`, `पहला उत्तर अपेक्षित: ${route.days} कार्य दिवस`)}</small></p></div><i>↓</i><div><b>2</b><p><strong>{l('Written reference number', 'लिखित संदर्भ संख्या')}</strong><small>{l('Keep every response in the evidence timeline.', 'हर उत्तर प्रमाण समयरेखा में रखें।')}</small></p></div><i>↓</i><div><b>3</b><p><strong>{l('Escalation-ready packet', 'एस्केलेशन-तैयार पैकेट')}</strong><small>{l('Use only if the first route remains unresolved.', 'पहला मार्ग अनसुलझा रहे तभी उपयोग करें।')}</small></p></div></div>
      <div className="claim-checklist"><div><span>{l('REQUIRED EVIDENCE', 'आवश्यक प्रमाण')}</span><b>{completeness}%</b></div>{route.docs.map((doc) => <button key={doc} className={checked[doc] ? 'ready' : ''} onClick={() => setChecked({ ...checked, [doc]: !checked[doc] })}><i>{checked[doc] ? '✓' : '+'}</i><span>{l(doc === 'invoice' ? 'Purchase invoice' : doc === 'photo' ? 'Photos / screenshots' : doc === 'policy' ? 'Policy certificate' : 'Service job sheet', doc === 'invoice' ? 'खरीद इनवॉइस' : doc === 'photo' ? 'फोटो / स्क्रीनशॉट' : doc === 'policy' ? 'पॉलिसी प्रमाणपत्र' : 'सेवा जॉब शीट')}</span></button>)}</div>
      <button className="primary" disabled={completeness < 100} onClick={() => setDrafted(true)}>{completeness < 100 ? l('Complete evidence to generate draft', 'ड्राफ्ट के लिए प्रमाण पूरा करें') : l('Generate resolution draft', 'समाधान ड्राफ्ट बनाएँ')} <span>→</span></button>
      {drafted && <div className="resolution-draft"><span>{l('REVIEW-READY DRAFT', 'समीक्षा-तैयार ड्राफ्ट')}</span><p>{l(...route.draft)}</p><div><button onClick={() => navigator.clipboard?.writeText(l(...route.draft))}>{l('Copy draft', 'ड्राफ्ट कॉपी करें')}</button><button onClick={() => setDrafted(false)}>{l('Edit evidence', 'प्रमाण संपादित करें')}</button></div><small>{l('BuySure prepares the draft; it never submits or contacts a third party without explicit consent.', 'BuySure ड्राफ्ट तैयार करता है; स्पष्ट सहमति के बिना जमा या किसी तीसरे पक्ष से संपर्क नहीं करता।')}</small></div>}
    </div>}
  </div>;
}
