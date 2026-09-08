'use client';

import { Children, cloneElement, isValidElement, ReactElement, ReactNode } from 'react';

const hi: Record<string, string> = {
  'Know what you buy. Prove what was promised.': 'जानें कि आप क्या खरीद रहे हैं। जो वादा किया गया, उसे साबित करें।',
  '● Private by default': '● डिफ़ॉल्ट रूप से निजी',
  'PURCHASE TRUST LAYER': 'खरीद भरोसा परत',
  'Capture what a seller promised, verify what the documents prove, and stay ready to claim.': 'विक्रेता के वादे दर्ज करें, दस्तावेज़ों से उनकी पुष्टि करें और दावे के लिए तैयार रहें।',
  'LOCAL': 'स्थानीय', 'FIRST': 'प्रथम', 'NEW CHECK': 'नई जाँच',
  'Before purchase or after purchase': 'खरीद से पहले या खरीद के बाद',
  'Capture': 'दर्ज करें', 'Assess': 'आकलन', 'Verify': 'सत्यापन', 'Act': 'कार्रवाई',
  'Try the complete flow': 'पूरा प्रवाह आज़माएँ', 'DETERMINISTIC DEMO': 'नियम-आधारित डेमो',
  'Electronics purchase': 'इलेक्ट्रॉनिक्स खरीद',
  'Insurance · EMI · warranty · cashback · returns': 'बीमा · ईएमआई · वारंटी · कैशबैक · रिटर्न',
  '5 promises': '5 वादे', 'Seller promise captured — final proof pending': 'विक्रेता का वादा दर्ज — अंतिम प्रमाण बाकी',
  '◈ User-selected files': '◈ उपयोगकर्ता द्वारा चुनी फ़ाइलें', '◎ Source-linked findings': '◎ स्रोत से जुड़े निष्कर्ष', '⌁ Stored on this device': '⌁ इस डिवाइस पर सुरक्षित',
  '← Home': '← होम', 'STEP 1 · CAPTURE THE PROMISE': 'चरण 1 · वादा दर्ज करें',
  'What did the seller offer?': 'विक्रेता ने क्या पेशकश की?',
  'Add evidence, then confirm the promise in your own words. BuySure never treats an unconfirmed recording as fact.': 'प्रमाण जोड़ें, फिर अपने शब्दों में वादे की पुष्टि करें। BuySure अपुष्ट रिकॉर्डिंग को तथ्य नहीं मानता।',
  'Camera / screenshot': 'कैमरा / स्क्रीनशॉट', 'Capture visual evidence': 'दृश्य प्रमाण दर्ज करें',
  'Listening…': 'सुन रहा है…', 'Voice promise': 'आवाज़ में वादा', 'With consent': 'सहमति के साथ',
  'Offer PDF': 'ऑफ़र पीडीएफ', 'Real local extraction': 'वास्तविक स्थानीय निष्कर्षण',
  'CONFIRMED SELLER PROMISE': 'पुष्टि किया गया विक्रेता वादा',
  'Example: Free theft insurance, no-cost EMI for 12 months and a two-year warranty…': 'उदाहरण: मुफ़्त चोरी बीमा, 12 महीने की नो-कॉस्ट ईएमआई और दो साल की वारंटी…',
  'Use sample offer': 'नमूना ऑफ़र इस्तेमाल करें', 'Nothing is uploaded to the web.': 'वेब पर कुछ भी अपलोड नहीं होता।',
  'Create Promise Ledger ': 'वादा खाता बनाएँ ', '← Capture': '← दर्ज करें',
  'STEP 2 · PROMISE LEDGER': 'चरण 2 · वादा खाता', 'Confirm what must be delivered.': 'जो मिलना चाहिए उसकी पुष्टि करें।',
  'Every promise stays connected to its source. Edit anything the extraction misunderstood.': 'हर वादा अपने स्रोत से जुड़ा रहता है। गलत निकाली गई जानकारी को संपादित करें।',
  'Insurance': 'बीमा', 'Warranty': 'वारंटी', 'Finance': 'वित्त', 'Cashback': 'कैशबैक', 'Return': 'रिटर्न', 'Delivery': 'डिलीवरी', 'Other': 'अन्य',
  'Remove promise': 'वादा हटाएँ', '＋ Add another promise': '＋ एक और वादा जोड़ें',
  'User confirmation is mandatory': 'उपयोगकर्ता की पुष्टि अनिवार्य है',
  'BuySure shows what it extracted; you decide what enters the ledger.': 'BuySure निकाली गई जानकारी दिखाता है; खाते में क्या जाएगा, यह आप तय करते हैं।',
  'Assess purchase risk ': 'खरीद जोखिम का आकलन करें ', '← Ledger': '← वादा खाता',
  'STEP 3 · BEFORE YOU PAY': 'चरण 3 · भुगतान से पहले', 'The offer sounds good. Is it complete?': 'ऑफ़र अच्छा लगता है। क्या यह पूरा है?',
  'OFFER RISK': 'ऑफ़र जोखिम', 'HIGH — ASK FIRST': 'उच्च — पहले पूछें', 'REVIEW REQUIRED': 'समीक्षा आवश्यक', 'LOW': 'कम',
  'Insurer is not identified': 'बीमाकर्ता की पहचान नहीं है', 'A benefit name alone does not establish who provides cover.': 'सिर्फ लाभ का नाम यह सिद्ध नहीं करता कि कवर कौन देता है।',
  'Who is the regulated insurer underwriting this benefit?': 'इस लाभ को अंडरराइट करने वाला विनियमित बीमाकर्ता कौन है?',
  'No policy or certificate number': 'पॉलिसी या प्रमाणपत्र संख्या नहीं है', 'The promised cover is not yet traceable or claimable.': 'वादा किया गया कवर अभी पता लगाने या दावा करने योग्य नहीं है।',
  'Please provide the policy or certificate number before I pay.': 'कृपया भुगतान से पहले पॉलिसी या प्रमाणपत्र संख्या दें।',
  'Coverage dates are missing': 'कवरेज की तारीखें गायब हैं', 'The start and end of protection are unknown.': 'सुरक्षा की शुरुआत और समाप्ति अज्ञात है।',
  'What are the exact coverage start and end dates?': 'कवरेज की सटीक शुरुआत और समाप्ति तारीखें क्या हैं?',
  'True EMI cost is undisclosed': 'ईएमआई की वास्तविक लागत नहीं बताई गई', 'Processing fees and tax can make “no-cost” financing more expensive.': 'प्रोसेसिंग शुल्क और कर “नो-कॉस्ट” फाइनेंसिंग को महँगा बना सकते हैं।',
  'What are the processing fee, GST, APR and total payable amount?': 'प्रोसेसिंग शुल्क, जीएसटी, एपीआर और कुल देय राशि कितनी है?',
  'Cashback conditions are unclear': 'कैशबैक की शर्तें स्पष्ट नहीं हैं', 'Eligibility and credit timing are not stated.': 'पात्रता और क्रेडिट का समय नहीं बताया गया है।',
  'Which cards qualify, and when will the cashback be credited?': 'कौन से कार्ड पात्र हैं और कैशबैक कब जमा होगा?',
  'Return eligibility is ambiguous': 'रिटर्न पात्रता अस्पष्ट है', 'A return period can still contain restrictive conditions.': 'रिटर्न अवधि में भी प्रतिबंधात्मक शर्तें हो सकती हैं।',
  'Is the return unconditional, and what conditions or deductions apply?': 'क्या रिटर्न बिना शर्त है, और कौन-सी शर्तें या कटौतियाँ लागू हैं?',
  'ASK:': 'पूछें:', 'BUYER DECISION': 'खरीदार का निर्णय',
  'Do not rely on a verbal benefit until its provider, dates, conditions and claim path are written down.': 'जब तक प्रदाता, तारीखें, शर्तें और दावा प्रक्रिया लिखित न हों, मौखिक लाभ पर भरोसा न करें।',
  'Copy questions for seller': 'विक्रेता के लिए प्रश्न कॉपी करें', 'I purchased it — verify proof ': 'मैंने खरीद लिया — प्रमाण जाँचें ',
  '← Risk report': '← जोखिम रिपोर्ट', 'STEP 4 · FINAL DOCUMENTS': 'चरण 4 · अंतिम दस्तावेज़', 'What did you actually receive?': 'आपको वास्तव में क्या मिला?',
  'Upload a text-based policy, invoice, KFS or warranty PDF. Extraction runs locally in this browser.': 'टेक्स्ट-आधारित पॉलिसी, इनवॉइस, केएफएस या वारंटी पीडीएफ अपलोड करें। निष्कर्षण इसी ब्राउज़र में स्थानीय रूप से होता है।',
  'Import final documents': 'अंतिम दस्तावेज़ आयात करें', 'Evidence extracted and ready to compare': 'प्रमाण निकाला गया और तुलना के लिए तैयार है',
  'PDF · policy · invoice · warranty': 'पीडीएफ · पॉलिसी · इनवॉइस · वारंटी', 'Use complete demo evidence': 'पूरा डेमो प्रमाण इस्तेमाल करें',
  'DEADLINE WATCH': 'समय-सीमा निगरानी', 'Return / cancellation': 'रिटर्न / रद्दीकरण', 'Warranty ends': 'वारंटी समाप्ति',
  'Compare promise vs proof ': 'वादे और प्रमाण की तुलना करें ', '← Documents': '← दस्तावेज़',
  'STEP 5 · EVIDENCE VERDICT': 'चरण 5 · प्रमाण निर्णय', 'COMPLETE': 'पूर्ण',
  'Each verdict is tied to a final-document clause. Unverified means more evidence is needed—not that the promise is false.': 'हर निर्णय अंतिम दस्तावेज़ की धारा से जुड़ा है। असत्यापित का अर्थ है कि अधिक प्रमाण चाहिए—यह नहीं कि वादा झूठा है।',
  'DEAL CONFIDENCE': 'सौदे पर भरोसा', 'Evidence looks consistent': 'प्रमाण सुसंगत दिखते हैं',
  'VERIFIED': 'सत्यापित', 'MISSING': 'गायब', 'CONTRADICTED': 'विरोधाभासी', 'UNVERIFIED': 'असत्यापित',
  'View exact source clause →': 'सटीक स्रोत धारा देखें →', '← Verdicts': '← निर्णय',
  'STEP 6 · CLAIMREADY': 'चरण 6 · दावा-तैयार', 'Turn findings into action.': 'निष्कर्षों को कार्रवाई में बदलें।',
  'BuySure packages the promise, supporting evidence, contradiction and key deadlines into one portable record.': 'BuySure वादा, सहायक प्रमाण, विरोधाभास और प्रमुख समय-सीमाओं को एक पोर्टेबल रिकॉर्ड में समेटता है।',
  'CLAIM READINESS': 'दावा तैयारी', 'Evidence pack ready': 'प्रमाण पैक तैयार', 'No dispute detected': 'कोई विवाद नहीं मिला',
  'promises': 'वादे', 'sources': 'स्रोत', 'issues': 'समस्याएँ', 'Original promise ledger': 'मूल वादा खाता',
  'What was offered and where it came from': 'क्या पेश किया गया और उसका स्रोत', 'READY': 'तैयार',
  'Clause-level findings': 'धारा-स्तरीय निष्कर्ष', 'Contradictions and supporting excerpts': 'विरोधाभास और सहायक अंश', 'Deadline record': 'समय-सीमा रिकॉर्ड',
  'SELLER MESSAGE': 'विक्रेता संदेश',
  '“The final documents do not match the benefits represented before purchase. Please review the attached evidence summary and resolve the highlighted discrepancies before the applicable deadline.”': '“अंतिम दस्तावेज़ खरीद से पहले बताए गए लाभों से मेल नहीं खाते। कृपया संलग्न प्रमाण सारांश देखें और लागू समय-सीमा से पहले चिन्हित विसंगतियों का समाधान करें।”',
  'Copy seller message': 'विक्रेता संदेश कॉपी करें', 'Download evidence pack ': 'प्रमाण पैक डाउनलोड करें ',
  'LOCAL EVIDENCE VAULT': 'स्थानीय प्रमाण तिजोरी', 'Your purchase checks stay on this device.': 'आपकी खरीद जाँच इसी डिवाइस पर रहती है।',
  'This prototype stores only case summaries in browser storage. Uploaded document files are not retained.': 'यह प्रोटोटाइप ब्राउज़र स्टोरेज में केवल मामले का सार रखता है। अपलोड किए गए दस्तावेज़ सुरक्षित नहीं रखे जाते।',
  'No saved checks yet': 'अभी कोई जाँच सुरक्षित नहीं है', 'Complete a promise-to-proof comparison to create one.': 'एक जाँच बनाने के लिए वादे और प्रमाण की तुलना पूरी करें।',
  'Start a new check ': 'नई जाँच शुरू करें ', 'Local-first processing · user-selected evidence only': 'स्थानीय प्रसंस्करण · केवल उपयोगकर्ता द्वारा चुने प्रमाण',
  'SOURCE-BOUND EVIDENCE': 'स्रोत-बद्ध प्रमाण', 'Exact extracted clause': 'निकाली गई सटीक धारा', 'Home': 'होम', 'Check': 'जाँच', 'Suite': 'सूट', 'Vault': 'तिजोरी',
  'BUYSURE · TEAM ANKOR': 'BUYSURE · टीम ANKOR', 'From persuasive promise to portable proof.': 'लुभावने वादे से पोर्टेबल प्रमाण तक।',
  'A consumer trust workflow designed for the moments before payment, after delivery, and before a claim deadline.': 'भुगतान से पहले, डिलीवरी के बाद और दावे की समय-सीमा से पहले के लिए बनाया गया उपभोक्ता भरोसा प्रवाह।',
  'Promise Ledger': 'वादा खाता', 'Camera, voice, text and PDFs become user-confirmed obligations.': 'कैमरा, आवाज़, टेक्स्ट और पीडीएफ उपयोगकर्ता-पुष्ट दायित्व बनते हैं।',
  'Explainable Risk': 'समझने योग्य जोखिम', 'Disclosure gaps become precise questions before payment.': 'जानकारी की कमियाँ भुगतान से पहले सटीक प्रश्न बनती हैं।',
  'Evidence Reconciliation': 'प्रमाण मिलान', 'Final clauses are matched to each promise with confidence.': 'अंतिम धाराओं का हर वादे से भरोसे के साथ मिलान होता है।',
  'ClaimReady Action': 'दावा-तैयार कार्रवाई', 'Deadlines, sources and contradictions become a portable pack.': 'समय-सीमाएँ, स्रोत और विरोधाभास एक पोर्टेबल पैक बनते हैं।',
  'PRIVACY-FIRST PIPELINE': 'गोपनीयता-प्रथम पाइपलाइन', 'Extract': 'निकालें', 'Structure': 'संरचना', 'Reconcile': 'मिलान',
  'PDF.js local text layer · deterministic claim rules · source-linked explanations · device-local case summaries': 'PDF.js स्थानीय टेक्स्ट परत · नियम-आधारित दावा जाँच · स्रोत-जुड़ी व्याख्याएँ · डिवाइस-स्थानीय मामले सारांश',
  'LIVE PDF PARSING': 'लाइव पीडीएफ पार्सिंग', 'VOICE WHEN SUPPORTED': 'समर्थित होने पर आवाज़', 'LOCAL VAULT': 'स्थानीय तिजोरी', 'EXPORTABLE PACK': 'निर्यात योग्य पैक',
  'Camera files are preserved as visual evidence and require user confirmation. Automated image OCR and official-source connectors are the next production integrations.': 'कैमरा फ़ाइलें दृश्य प्रमाण के रूप में रहती हैं और उपयोगकर्ता की पुष्टि आवश्यक है। स्वचालित इमेज OCR और आधिकारिक-स्रोत कनेक्टर अगले प्रोडक्शन एकीकरण हैं।',
  '↻ Restart experience': '↻ अनुभव फिर शुरू करें',
  'The final document says protection was not included and no policy was issued.': 'अंतिम दस्तावेज़ कहता है कि सुरक्षा शामिल नहीं थी और कोई पॉलिसी जारी नहीं हुई।',
  'A traceable insurance identifier was found.': 'पता लगाने योग्य बीमा पहचान मिली।', 'No claimable policy evidence was found.': 'दावा करने योग्य पॉलिसी प्रमाण नहीं मिला।',
  'Additional financing charges were found despite the no-cost promise.': 'नो-कॉस्ट वादे के बावजूद अतिरिक्त वित्तीय शुल्क मिले।',
  'Upload the invoice and Key Fact Statement to verify total financing cost.': 'कुल वित्त लागत जाँचने के लिए इनवॉइस और मुख्य तथ्य विवरण अपलोड करें।',
  'Twenty-four months of manufacturer coverage is documented.': 'निर्माता की 24 महीने की कवरेज दर्ज है।', 'No matching warranty duration was found.': 'मेल खाती वारंटी अवधि नहीं मिली।',
  'The benefit has eligibility conditions absent from the original promise.': 'लाभ पर ऐसी पात्रता शर्तें हैं जो मूल वादे में नहीं थीं।', 'No bank or credit evidence has been linked.': 'कोई बैंक या क्रेडिट प्रमाण जुड़ा नहीं है।',
  'The final terms restrict the advertised return window.': 'अंतिम शर्तें विज्ञापित रिटर्न अवधि को सीमित करती हैं।', 'A matching return window was found.': 'मेल खाती रिटर्न अवधि मिली।',
  'No matching final evidence has been linked yet.': 'अभी तक मेल खाता अंतिम प्रमाण नहीं जुड़ा है।', 'No linked evidence.': 'कोई जुड़ा प्रमाण नहीं।',
  'No financing evidence linked.': 'कोई वित्तीय प्रमाण नहीं जुड़ा।', 'No cashback evidence linked.': 'कोई कैशबैक प्रमाण नहीं जुड़ा।',
  'free theft insurance': 'मुफ़्त चोरी बीमा', 'no-cost EMI for 12 months': '12 महीने की नो-कॉस्ट ईएमआई', 'two-year manufacturer warranty': 'दो साल की निर्माता वारंटी',
  '₹10,000 cashback': '₹10,000 कैशबैक', '7-day return window': '7 दिन की रिटर्न अवधि',
  'Typed promise': 'टाइप किया गया वादा', 'Store offer screenshot': 'स्टोर ऑफ़र स्क्रीनशॉट', 'Captured': 'दर्ज किया गया',
  'Seller promise transcript': 'विक्रेता वादा प्रतिलिपि', 'User confirmed': 'उपयोगकर्ता द्वारा पुष्टि',
  'Store offer + seller statement': 'स्टोर ऑफ़र + विक्रेता कथन', 'Consented seller statement': 'सहमति वाला विक्रेता कथन',
  'Transcribed and awaiting confirmation': 'लिप्यंतरण पूरा; पुष्टि बाकी', 'Visual evidence secured': 'दृश्य प्रमाण सुरक्षित',
  'Demo seller offer': 'डेमो विक्रेता ऑफ़र', 'User-editable sample': 'उपयोगकर्ता द्वारा संपादन योग्य नमूना',
  'New seller promise': 'नया विक्रेता वादा', 'Manual entry': 'मैन्युअल प्रविष्टि',
  'Extracting seller promises from the PDF locally…': 'पीडीएफ से विक्रेता के वादे स्थानीय रूप से निकाले जा रहे हैं…',
  'Offer PDF parsed locally': 'ऑफ़र पीडीएफ स्थानीय रूप से पढ़ा गया', 'This PDF could not be read. Try a text-based PDF.': 'यह पीडीएफ पढ़ा नहीं जा सका। टेक्स्ट-आधारित पीडीएफ आज़माएँ।',
  'Image captured—describe or paste the visible promise to confirm it': 'चित्र दर्ज हुआ—पुष्टि के लिए दिखाई दे रहा वादा लिखें या पेस्ट करें',
  'Voice recognition is unavailable here—type the promise instead': 'यहाँ आवाज़ पहचान उपलब्ध नहीं है—वादा टाइप करें',
  'Voice capture stopped—type the promise instead': 'आवाज़ दर्ज करना रुका—वादा टाइप करें',
  'Parsing final documents and reconciling every promise…': 'अंतिम दस्तावेज़ पढ़े जा रहे हैं और हर वादे का मिलान हो रहा है…',
  'Could not read this PDF. Try a text-based document.': 'यह पीडीएफ पढ़ा नहीं जा सका। टेक्स्ट-आधारित दस्तावेज़ आज़माएँ।',
  'Demo invoice, policy and warranty evidence linked': 'डेमो इनवॉइस, पॉलिसी और वारंटी प्रमाण जुड़े',
  'Case saved to this device': 'मामला इस डिवाइस पर सुरक्षित हुआ', 'Evidence pack downloaded': 'प्रमाण पैक डाउनलोड हुआ',
  'Seller questions copied': 'विक्रेता के प्रश्न कॉपी हुए', 'Seller message copied': 'विक्रेता संदेश कॉपी हुआ',
  'Reconciling promise nodes with clause-level evidence…': 'वादों का धारा-स्तरीय प्रमाण से मिलान हो रहा है…',
  'the demo final document': 'डेमो अंतिम दस्तावेज़',
  'Evidence Lens screenshot': 'एविडेंस लेंस स्क्रीनशॉट', 'User-confirmed visual claims': 'उपयोगकर्ता-पुष्ट दृश्य दावे',
  'Screenshot claims added to the Promise Ledger': 'स्क्रीनशॉट दावे वादा खाते में जोड़े गए',
  'Electronics purchase check': 'इलेक्ट्रॉनिक्स खरीद जाँच', 'Return ': 'रिटर्न ', ' · warranty ': ' · वारंटी ',
  'User-selected evidence only': 'केवल उपयोगकर्ता द्वारा चुना प्रमाण',
};

function translateText(value: string) {
  if (hi[value]) return hi[value];
  return value
    .replace(/^(\d+) promises?$/, '$1 वादे')
    .replace(/^(\d+) disclosure gaps? found$/, '$1 जानकारी की कमियाँ मिलीं')
    .replace(/^(\d+) issues? require action$/, '$1 समस्याओं पर कार्रवाई आवश्यक')
    .replace(/^(\d+) verified · (\d+) unverified$/, '$1 सत्यापित · $2 असत्यापित')
    .replace(/^(\d+) issues?$/, '$1 समस्याएँ')
    .replace(/^(\d+) pages? parsed locally$/, '$1 पृष्ठ स्थानीय रूप से पढ़े गए')
    .replace(/^(\d+) promises? structured for confirmation$/, 'पुष्टि के लिए $1 वादों की संरचना बनी')
    .replace(/^(\d+) pages? linked as final evidence$/, '$1 पृष्ठ अंतिम प्रमाण के रूप में जुड़े')
    .replace(/^(.+) · (\d+) promises$/, '$1 · $2 वादे')
    .replace(/^Return (.+) · warranty (.+)$/, 'रिटर्न $1 · वारंटी $2')
    .replace(/^Linked to (.+) · extracted in this browser$/, '$1 से जुड़ा · इसी ब्राउज़र में निकाला गया');
}

export function Translate({ language, children }: { language: 'en' | 'hi'; children: ReactNode }) {
  if (language === 'en') return <>{children}</>;
  const walk = (node: ReactNode): ReactNode => {
    if (typeof node === 'string') return translateText(node);
    if (Array.isArray(node)) return Children.map(node, walk);
    if (!isValidElement(node)) return node;
    const element = node as ReactElement<Record<string, unknown>>;
    const props = element.props;
    if (props['data-no-translate']) return element;
    const translated: Record<string, unknown> = {};
    for (const key of ['placeholder', 'aria-label', 'title']) {
      if (typeof props[key] === 'string') translated[key] = translateText(props[key] as string);
    }
    if ('children' in props) translated.children = Children.map(props.children as ReactNode, walk);
    return cloneElement(element, translated);
  };
  return <>{walk(children)}</>;
}
