export const extractFormFields = (ocrLines, language = 'eng') => {
  if (!ocrLines || !Array.isArray(ocrLines)) return [];

  const keywordSets = {
    eng: [
      'name', 'first name', 'last name', 'full name',
      'phone', 'telephone', 'mobile', 'cell',
      'number', 'phone number', 'contact',
      'date', 'birth', 'birthday', 'dob', 'date of birth',
      'address', 'street', 'city', 'state', 'zip', 'postal',
      'age', 'years old',
      'email', 'e-mail', 'mail',
      'gender', 'sex', 'male', 'female',
      'occupation', 'job', 'profession', 'work',
      'signature', 'sign here', 'signed'
    ],
    kan: [
      'ಹೆಸರು', 'ಮೊದಲ ಹೆಸರು', 'ಕೊನೆಯ ಹೆಸರು', 'ಪೂರ್ಣ ಹೆಸರು',
      'ಫೋನ್', 'ದೂರವಾಣಿ', 'ಮೊಬೈಲ್', 'ಸೆಲ್',
      'ಸಂಖ್ಯೆ', 'ಫೋನ್ ಸಂಖ್ಯೆ', 'ಸಂಪರ್ಕ',
      'ದಿನಾಂಕ', 'ಜನ್ಮ', 'ಜನ್ಮದಿನ', 'ಡಿಒಬಿ', 'ಜನ್ಮ ದಿನಾಂಕ',
      'ವಿಳಾಸ', 'ರಸ್ತೆ', 'ನಗರ', 'ರಾಜ್ಯ', 'ಜಿಪ್', 'ಪೋಸ್ಟಲ್',
      'ವಯಸ್ಸು', 'ವರ್ಷಗಳು',
      'ಇಮೇಲ್', 'ಇ-ಮೇಲ್', 'ಮೇಲ್',
      'ಲಿಂಗ', 'ಸೆಕ್ಸ್', 'ಪುರುಷ', 'ಸ್ತ್ರೀ',
      'ಉದ್ಯೋಗ', 'ಕೆಲಸ', 'ವೃತ್ತಿ', 'ಕೆಲಸ',
      'ಸಹಿ', 'ಇಲ್ಲಿ ಸಹಿ ಮಾಡಿ', 'ಸಹಿ ಮಾಡಲಾಗಿದೆ'
    ],
    tam: [
      'பெயர்', 'முதல் பெயர்', 'கடைசி பெயர்', 'முழு பெயர்',
      'தொலைபேசி', 'மொபைல்', 'செல்',
      'எண்', 'தொலைபேசி எண்', 'தொடர்பு',
      'தேதி', 'பிறப்பு', 'பிறந்தநாள்', 'டிஓபி', 'பிறந்த தேதி',
      'முகவரி', 'தெரு', 'நகரம்', 'மாநிலம்', 'ஜிப்', 'அஞ்சல்',
      'வயது', 'ஆண்டுகள்',
      'மின்னஞ்சல்', 'இ-மெயில்', 'மெயில்',
      'பாலினம்', 'பாலினம்', 'ஆண்', 'பெண்',
      'தொழில்', 'வேலை', 'தொழில்', 'வேலை',
      'கையொப்பம்', 'இங்கே கையொப்பம் செய்யுங்கள்', 'கையொப்பம் செய்யப்பட்டது'
    ],
    hin: [
      'नाम', 'पहला नाम', 'अंतिम नाम', 'पूर्ण नाम',
      'फोन', 'टेलीफोन', 'मोबाइल', 'सेल',
      'संख्या', 'फोन संख्या', 'संपर्क',
      'तारीख', 'जन्म', 'जन्मदिन', 'डीओबी', 'जन्म तारीख',
      'पता', 'सड़क', 'शहर', 'राज्य', 'ज़िप', 'डाक',
      'आयु', 'साल',
      'ईमेल', 'ई-मेल', 'मेल',
      'लिंग', 'सेक्स', 'पुरुष', 'महिला',
      'व्यवसाय', 'नौकरी', 'पेशा', 'काम',
      'हस्ताक्षर', 'यहाँ हस्ताक्षर करें', 'हस्ताक्षरित'
    ],
    tel: [
      'పేరు', 'మొదటి పేరు', 'చివరి పేరు', 'పూర్తి పేరు',
      'ఫోన్', 'టెలిఫోన్', 'మొబైల్', 'సెల్',
      'సంఖ్య', 'ఫోన్ సంఖ్య', 'సంప్రదింపు',
      'తేదీ', 'పుట్టిన', 'పుట్టినరోజు', 'డిఓబి', 'పుట్టిన తేదీ',
      'చిరునామా', 'వీధి', 'నగరం', 'రాష్ట్రం', 'జిప్', 'పోస్టల్',
      'వయస్సు', 'సంవత్సరాలు',
      'ఇమెయిల్', 'ఇ-మెయిల్', 'మెయిల్',
      'లింగం', 'సెక్స్', 'పురుషుడు', 'స్త్రీ',
      'వృత్తి', 'ఉద్యోగం', 'వృత్తి', 'పని',
      'సంతకం', 'ఇక్కడ సంతకం చేయండి', 'సంతకం చేయబడింది'
    ]
  };

  const keywords = keywordSets[language] || keywordSets.eng;

  const found = [];

  // Pass: extract fields with bounding boxes
  ocrLines.forEach((lineObj, idx) => {
    if (!lineObj) return;
    
    // Support both Tesseract objects {text, bbox} and raw strings
    const isString = typeof lineObj === 'string';
    const rawText = isString ? lineObj : lineObj.text;
    
    if (!rawText) return;
    
    const rawLine = rawText.trim();
    
    // Extract bbox or generate a fake sequential one if missing
    const bbox = (!isString && lineObj.bbox) 
      ? lineObj.bbox 
      : { x0: 20, y0: 40 + (idx * 20), x1: 100, y1: 40 + (idx * 20) };
    
    if (rawLine.length < 2 || rawLine.length > 100) return; // Too long for a field label
    if (/^\d+\.?\s*$/.test(rawLine)) return; // Just numbers
    if (/^[A-Za-z]$/.test(rawLine)) return; // Single letters

    const lowerLine = rawLine.toLowerCase();

    // STRICT CHECK: To avoid extracting headings like "Registration Form"
    // A valid field label should ideally have a colon, a separator, OR match a known field keyword exactly.
    const hasKeyword = keywords.some(k => {
      // Use whitespace boundaries instead of \b to support non-ASCII languages (Tamil, Hindi, etc.)
      const regex = new RegExp(`(^|\\s|[.,:])${k}(\\s|[.,:]|$)`, 'i');
      return regex.test(lowerLine);
    });
    
    const hasSeparator = /[:\-–—=]/.test(rawLine);
    const looksLikeField = hasKeyword || hasSeparator;

    if (!looksLikeField) return;

    let candidate = rawLine;

    // If it has a colon or separator, the label is usually everything before it
    if (hasSeparator) {
      const parts = rawLine.split(/[:\-–—=]+/).map(p => p.trim()).filter(Boolean);
      if (parts.length > 0) {
        candidate = parts[0];
      }
    }

    candidate = candidate
      .replace(/^\d+\.?\s*/, '')
      // eslint-disable-next-line no-useless-escape
      .replace(/[\[\]\(\)]/g, '')
      .replace(/[^ \p{L}\p{N}\s-]/gu, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (candidate.length < 2 || candidate.length > 50) return;

    const normalizedCandidate = candidate.toLowerCase();
    
    // Prevent duplicates
    if (found.some(f => f.label.toLowerCase() === normalizedCandidate)) return;

    // eslint-disable-next-line no-control-regex
    const formatted = /^[\x00-\x7F\s]+$/.test(candidate)
      ? candidate.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')
      : candidate;

    found.push({ label: formatted, bbox });
  });

  console.log('Form processing result:', { extractedFields: found });
  return found;
};
