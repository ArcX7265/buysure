'use client';

import { ChangeEvent, useEffect, useState } from 'react';

type Lang = 'en' | 'hi';
type Mode = 'offer' | 'unbox' | 'cooling' | 'history';
type UnboxKey = 'seal' | 'sides' | 'serial' | 'accessories' | 'power';

export function CommerceLab({ language }: { language: Lang }) {
  const l = (en: string, hi: string) => language === 'hi' ? hi : en;
  const [mode, setMode] = useState<Mode>('offer');
  const [offer, setOffer] = useState({ price: 49999, cashback: 5000, processing: 999, gst: 180, months: 12, interest: 0, minSpend: 40000, correctCard: true, offerUsed: false });
  const [unbox, setUnbox] = useState<Record<UnboxKey, boolean>>({ seal: true, sides: false, serial: false, accessories: false, power: false });
  const [photo, setPhoto] = useState('');
  const [certificate, setCertificate] = useState('');
  const [tasks, setTasks] = useState({ test: true, invoice: false, warranty: false, protection: false, return: false });
  const [historyStage, setHistoryStage] = useState(3);

  useEffect(() => () => { if (photo) URL.revokeObjectURL(photo); }, [photo]);
  const eligible = offer.correctCard && !offer.offerUsed && offer.price >= offer.minSpend;
  const effective = offer.price + offer.processing + offer.gst + offer.interest - (eligible ? offer.cashback : 0);
  const unboxCount = Object.values(unbox).filter(Boolean).length;
  const taskCount = Object.values(tasks).filter(Boolean).length;
  const histories = [
    { time: ['MON 09:00','सोम 09:00'], price: 52999, cashback: 5000, fee: 0, warranty: ['2-year comprehensive','2-वर्ष व्यापक'] },
    { time: ['WED 18:30','बुध 18:30'], price: 49999, cashback: 5000, fee: 0, warranty: ['2-year comprehensive','2-वर्ष व्यापक'] },
    { time: ['FRI 11:10','शुक्र 11:10'], price: 49999, cashback: 2500, fee: 999, warranty: ['2-year protection','2-वर्ष सुरक्षा'] },
    { time: ['CHECKOUT','चेकआउट'], price: 49999, cashback: eligible ? offer.cashback : 0, fee: offer.processing + offer.gst, warranty: ['1-year manufacturer','1-वर्ष निर्माता'] },
  ];
  const selectedHistory = histories[historyStage];
  const lowestEffective = Math.min(...histories.map((item) => item.price + item.fee - item.cashback));
  const currentEffective = selectedHistory.price + selectedHistory.fee - selectedHistory.cashback;
  const unboxSteps: { key: UnboxKey; en: string; hi: string; detailEn: string; detailHi: string }[] = [
    { key: 'seal', en: 'Capture intact seals', hi: 'सही सील कैप्चर करें', detailEn: 'Record every opening edge', detailHi: 'हर खुलने वाला किनारा रिकॉर्ड करें' },
    { key: 'sides', en: 'Record all package sides', hi: 'पैकेज के सभी भाग रिकॉर्ड करें', detailEn: 'Include shipping label and damage', detailHi: 'शिपिंग लेबल और क्षति शामिल करें' },
    { key: 'serial', en: 'Match serial and IMEI', hi: 'सीरियल और IMEI मिलाएँ', detailEn: 'Box → invoice → device', detailHi: 'बॉक्स → इनवॉइस → डिवाइस' },
    { key: 'accessories', en: 'Confirm accessories', hi: 'एक्सेसरी की पुष्टि करें', detailEn: 'Charger, cable and inserts', detailHi: 'चार्जर, केबल और दस्तावेज़' },
    { key: 'power', en: 'Record first power-on', hi: 'पहला पावर-ऑन रिकॉर्ड करें', detailEn: 'Screen and activation state', detailHi: 'स्क्रीन और सक्रियण स्थिति' },
  ];
  const coolingTasks = [
    ['test','Test every critical function','हर जरूरी फ़ंक्शन जाँचें','6h'],['invoice','Verify invoice and serial','इनवॉइस और सीरियल जाँचें','1d'],['warranty','Register manufacturer warranty','निर्माता वारंटी पंजीकृत करें','2d'],['protection','Activate protection benefit','सुरक्षा लाभ सक्रिय करें','2d'],['return','Make final keep/return decision','अंतिम रखें/लौटाएँ निर्णय लें','6d'],
  ] as const;

  async function capture(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]; if (!file) return;
    if (photo) URL.revokeObjectURL(photo); setPhoto(URL.createObjectURL(file)); setUnbox({ ...unbox, sides: true }); event.target.value = '';
  }
  async function issueCertificate() {
    const payload = JSON.stringify({ checklist: unbox, createdAt: new Date().toISOString(), scope: 'User-confirmed unboxing record' });
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(payload));
    setCertificate(Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2,'0')).join('').slice(0,24).toUpperCase());
  }

  const tabs: { id: Mode; icon: string; en: string; hi: string }[] = [
    { id: 'offer', icon: '₹', en: 'Bank Offer', hi: 'बैंक ऑफ़र' }, { id: 'unbox', icon: '▣', en: 'Unboxing', hi: 'अनबॉक्सिंग' },
    { id: 'cooling', icon: '◷', en: 'Cooling-Off', hi: 'कूलिंग-ऑफ' }, { id: 'history', icon: '↔', en: 'Time Machine', hi: 'टाइम मशीन' },
  ];

  return <div className="suite-panel commerce-lab">
    <div className="commerce-hero"><div><span>{l('COMMERCE INTELLIGENCE LAB', 'कॉमर्स इंटेलिजेंस लैब')}</span><h3>{l('Know the real offer. Protect the first week.', 'वास्तविक ऑफ़र जानें। पहले सप्ताह को सुरक्षित करें।')}</h3><p>{l('Fintech eligibility, delivery evidence and post-purchase deadlines in one flow.', 'फिनटेक पात्रता, डिलीवरी प्रमाण और खरीद-बाद समय-सीमाएँ एक प्रवाह में।')}</p></div><b>4<small>{l('connected tools', 'जुड़े टूल')}</small></b></div>
    <div className="commerce-tabs">{tabs.map((tab) => <button key={tab.id} className={mode === tab.id ? 'active' : ''} onClick={() => setMode(tab.id)}><i>{tab.icon}</i><span>{l(tab.en,tab.hi)}</span></button>)}</div>

    {mode === 'offer' && <div className="commerce-body">
      <div className={`eligibility-verdict ${eligible ? 'yes' : 'no'}`}><span>{l('BANK OFFER ELIGIBILITY', 'बैंक ऑफ़र पात्रता')}</span><b>{eligible ? l('ELIGIBLE', 'पात्र') : l('NOT ELIGIBLE', 'अपात्र')}</b><strong>₹{effective.toLocaleString('en-IN')}</strong><small>{l('effective amount after verified benefits and charges', 'सत्यापित लाभ और शुल्क के बाद वास्तविक राशि')}</small></div>
      <div className="offer-calculator">{([['price','Product price','उत्पाद कीमत'],['cashback','Promised cashback','वादा कैशबैक'],['processing','Processing fee','प्रोसेसिंग शुल्क'],['gst','GST on fee','शुल्क पर जीएसटी'],['interest','Total EMI interest','कुल EMI ब्याज'],['minSpend','Minimum spend','न्यूनतम खर्च']] as const).map(([key,en,hi]) => <label key={key}><span>{l(en,hi)}</span><div>₹ <input type="number" min="0" value={offer[key]} onChange={(event) => setOffer({ ...offer, [key]: Number(event.target.value) })} /></div></label>)}</div>
      <div className="eligibility-rules"><button className={offer.correctCard ? 'on' : ''} onClick={() => setOffer({ ...offer, correctCard: !offer.correctCard })}><i>{offer.correctCard ? '✓' : '×'}</i><span><strong>{l('Eligible bank and card variant', 'पात्र बैंक और कार्ड प्रकार')}</strong><small>{offer.correctCard ? l('Condition satisfied', 'शर्त पूरी') : l('Select an eligible card', 'पात्र कार्ड चुनें')}</small></span></button><button className={!offer.offerUsed ? 'on' : ''} onClick={() => setOffer({ ...offer, offerUsed: !offer.offerUsed })}><i>{!offer.offerUsed ? '✓' : '×'}</i><span><strong>{l('Offer not previously used', 'ऑफ़र पहले उपयोग नहीं हुआ')}</strong><small>{offer.offerUsed ? l('Usage limit reached', 'उपयोग सीमा पूरी') : l('Condition satisfied', 'शर्त पूरी')}</small></span></button></div>
      <div className="cost-waterfall"><span>{l('REAL COST WATERFALL', 'वास्तविक लागत प्रवाह')}</span><div><b>₹{offer.price.toLocaleString('en-IN')}<small>{l('headline','मुख्य')}</small></b><i>+</i><b>₹{(offer.processing+offer.gst+offer.interest).toLocaleString('en-IN')}<small>{l('charges','शुल्क')}</small></b><i>−</i><b>₹{(eligible?offer.cashback:0).toLocaleString('en-IN')}<small>{l('verified benefit','सत्यापित लाभ')}</small></b><i>=</i><b className="total">₹{effective.toLocaleString('en-IN')}<small>{l('effective','वास्तविक')}</small></b></div></div>
    </div>}

    {mode === 'unbox' && <div className="commerce-body">
      <div className="unbox-score"><span>{l('UNBOXING EVIDENCE DIRECTOR', 'अनबॉक्सिंग प्रमाण निर्देशक')}</span><strong>{unboxCount}/5</strong><div><i style={{width:`${unboxCount*20}%`}} /></div><small>{l('Follow the sequence without interrupting the evidence trail.', 'प्रमाण क्रम रोके बिना निर्देशों का पालन करें।')}</small></div>
      <label className="unbox-camera">{photo ? <img src={photo} alt={l('Unboxing evidence preview', 'अनबॉक्सिंग प्रमाण पूर्वावलोकन')} /> : <div><b>▣</b><strong>{l('Capture package condition', 'पैकेज स्थिति कैप्चर करें')}</strong><small>{l('Camera or image upload', 'कैमरा या चित्र अपलोड')}</small></div>}<input type="file" accept="image/*" capture="environment" onChange={capture} /></label>
      <div className="unbox-steps">{unboxSteps.map((step,index) => <button key={step.key} className={unbox[step.key] ? 'done' : ''} onClick={() => { setUnbox({ ...unbox, [step.key]: !unbox[step.key] }); setCertificate(''); }}><i>{unbox[step.key] ? '✓' : index+1}</i><span><strong>{l(step.en,step.hi)}</strong><small>{l(step.detailEn,step.detailHi)}</small></span></button>)}</div>
      <button className="primary" disabled={unboxCount < 5} onClick={issueCertificate}>{unboxCount < 5 ? l('Complete all five evidence steps', 'सभी पाँच प्रमाण चरण पूरे करें') : l('Create condition certificate', 'स्थिति प्रमाणपत्र बनाएँ')} <span>→</span></button>
      {certificate && <div className="condition-cert"><span>✓</span><p><strong>{l('Delivery condition record sealed', 'डिलीवरी स्थिति रिकॉर्ड सील')}</strong><small>SHA-256 · {certificate}</small></p></div>}
    </div>}

    {mode === 'cooling' && <div className="commerce-body">
      <div className="cooling-head"><span>{l('COOLING-OFF COMMAND CENTRE', 'कूलिंग-ऑफ कमांड सेंटर')}</span><strong>{taskCount}/5 {l('protected', 'सुरक्षित')}</strong><div><i style={{width:`${taskCount*20}%`}} /></div><small>{l('The first week decides whether benefits remain usable.', 'पहला सप्ताह तय करता है कि लाभ उपयोग योग्य रहेंगे या नहीं।')}</small></div>
      <div className="cooling-list">{coolingTasks.map(([key,en,hi,due]) => <button key={key} className={tasks[key] ? 'done' : ''} onClick={() => setTasks({ ...tasks, [key]: !tasks[key] })}><i>{tasks[key] ? '✓' : '!'}</i><span><strong>{l(en,hi)}</strong><small>{tasks[key] ? l('Completed with proof','प्रमाण सहित पूरा') : l('Action required','कार्रवाई आवश्यक')}</small></span><b>{tasks[key] ? l('DONE','पूर्ण') : due}</b></button>)}</div>
      <div className="next-action"><b>{taskCount === 5 ? '✓' : '→'}</b><p><strong>{taskCount === 5 ? l('Purchase is activation-ready', 'खरीद सक्रियण-तैयार है') : l('Next: verify the tax invoice', 'अगला: कर इनवॉइस जाँचें')}</strong><small>{l('Deadlines are demo-relative; production would use the actual purchase timestamp and local notifications.', 'समय-सीमाएँ डेमो-सापेक्ष हैं; उत्पादन में वास्तविक खरीद समय और स्थानीय सूचनाएँ उपयोग होंगी।')}</small></p></div>
    </div>}

    {mode === 'history' && <div className="commerce-body">
      <div className="history-head"><span>{l('DEAL TIME MACHINE', 'डील टाइम मशीन')}</span><strong>{l(...selectedHistory.time as [string,string])}</strong><small>{l('Select any captured stage to reconstruct the offer.', 'ऑफ़र फिर देखने के लिए कोई कैप्चर चरण चुनें।')}</small></div>
      <div className="history-track">{histories.map((item,index) => <button key={item.time[0]} className={index === historyStage ? 'active' : ''} onClick={() => setHistoryStage(index)}><i>{index+1}</i><span>{l(...item.time as [string,string])}</span></button>)}</div>
      <div className="history-card"><div><span>{l('PRICE','कीमत')}</span><strong>₹{selectedHistory.price.toLocaleString('en-IN')}</strong></div><div><span>{l('CASHBACK','कैशबैक')}</span><strong>₹{selectedHistory.cashback.toLocaleString('en-IN')}</strong></div><div><span>{l('ADDED FEES','जुड़े शुल्क')}</span><strong>₹{selectedHistory.fee.toLocaleString('en-IN')}</strong></div><div><span>{l('WARRANTY','वारंटी')}</span><strong>{l(...selectedHistory.warranty as [string,string])}</strong></div></div>
      <div className={`lowest-check ${currentEffective === lowestEffective ? 'best' : ''}`}><b>{currentEffective === lowestEffective ? '✓' : '!'}</b><p><strong>{currentEffective === lowestEffective ? l('This was the lowest effective offer', 'यह सबसे कम वास्तविक ऑफ़र था') : l(`₹${(currentEffective-lowestEffective).toLocaleString('en-IN')} above the best captured deal`, `सबसे अच्छे कैप्चर सौदे से ₹${(currentEffective-lowestEffective).toLocaleString('en-IN')} अधिक`)}</strong><small>{l('Compared after cashback and visible fees—not headline price alone.', 'कैशबैक और दिखाई देने वाले शुल्क के बाद तुलना—केवल मुख्य कीमत नहीं।')}</small></p></div>
      <div className="history-diff"><span>{l('WHAT CHANGED?', 'क्या बदला?')}</span><p><i>−</i>{l('Cashback fell from ₹5,000 to the final eligible amount.', 'कैशबैक ₹5,000 से अंतिम पात्र राशि तक घटा।')}</p><p><i>+</i>{l('Processing fee and GST appeared at checkout.', 'चेकआउट पर प्रोसेसिंग शुल्क और जीएसटी जुड़े।')}</p><p><i>−</i>{l('Comprehensive protection became manufacturer warranty.', 'व्यापक सुरक्षा निर्माता वारंटी बन गई।')}</p></div>
    </div>}
  </div>;
}
