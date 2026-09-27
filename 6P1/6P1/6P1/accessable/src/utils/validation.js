/**
 * Data validation utility for AccessAble application.
 */

export const toTitleCase = (str) => {
  return str.replace(/\b\w/g, char => char.toUpperCase());
};

// Email validation (standard email format, robust for speech)
export const validateEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return { isValid: false, message: 'Email address is required.' };
  }
  
  // Clean up spoken email (e.g. "john at gmail dot com" -> "john@gmail.com")
  let cleanEmail = email.toLowerCase()
    .replace(/\b(at)\b/g, '@')
    .replace(/\b(dot)\b/g, '.')
    .replace(/\s+/g, ''); // Remove all remaining spaces

  // Remove any trailing punctuation from speech (e.g. "com.")
  cleanEmail = cleanEmail.replace(/[.,!?;:]$/, '');

  if (!cleanEmail.includes('@')) {
    return { isValid: false, message: 'Please include the @ symbol or say "at" (e.g. name at example dot com).' };
  }
  return { isValid: true, message: '', sanitized: cleanEmail };
};

// Age validation (up to 2 numbers: 1 to 99)
export const validateAge = (age) => {
  if (age === undefined || age === null || age === '') {
    return { isValid: false, message: 'Age is required.' };
  }
  
  // Extract numbers if passed as spoken text e.g. "twenty five" or "25"
  let numVal = parseInt(String(age).replace(/\D/g, ''), 10);

  if (isNaN(numVal)) {
    // Basic spoken word map fallback for low numbers
    const wordMap = {
      one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
      eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17,
      eighteen: 18, nineteen: 19, twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60,
      seventy: 70, eighty: 80, ninety: 90
    };
    const cleanWord = String(age).trim().toLowerCase();
    if (wordMap[cleanWord]) {
      numVal = wordMap[cleanWord];
    }
  }

  if (isNaN(numVal) || numVal < 1 || numVal > 99) {
    return { isValid: false, message: 'Age must be a valid number up to 2 digits (1 to 99).' };
  }
  return { isValid: true, message: '', sanitized: String(numVal) };
};

// Phone number validation (exactly 10 numbers)
export const validatePhone = (phone) => {
  if (!phone) {
    return { isValid: false, message: 'Phone number is required.' };
  }
  
  // Map spoken digits to numbers (e.g. "nine eight seven" -> "9 8 7")
  const digitWords = {
    zero: '0', one: '1', two: '2', three: '3', four: '4', 
    five: '5', six: '6', seven: '7', eight: '8', nine: '9'
  };
  
  let mappedPhone = String(phone).toLowerCase();
  Object.keys(digitWords).forEach(word => {
    // Replace all occurrences of the word with its digit
    mappedPhone = mappedPhone.replace(new RegExp(`\\b${word}\\b`, 'g'), digitWords[word]);
  });

  // Clean phone input to keep only digits
  const cleanDigits = mappedPhone.replace(/\D/g, '');

  if (cleanDigits.length === 0) {
    return { isValid: false, message: 'Phone number must contain numbers only.' };
  }

  if (cleanDigits.length !== 10) {
    return { isValid: false, message: 'Phone number must be exactly 10 digits.' };
  }

  return { isValid: true, message: '', sanitized: cleanDigits };
};

/**
 * Helper to validate dynamically extracted form fields based on label names
 */
export const validateField = (label, value) => {
  if (!label || typeof label !== 'string') {
    return { isValid: true, message: '', sanitized: value };
  }

  const lowerLabel = label.toLowerCase();

  // Age field matching
  if (lowerLabel.includes('age') || lowerLabel.includes('years old') || lowerLabel.includes('வயது') || lowerLabel.includes('ವಯಸ್ಸು') || lowerLabel.includes('आयु') || lowerLabel.includes('వయస్సు')) {
    return validateAge(value);
  }

  // Email field matching
  if (lowerLabel.includes('email') || lowerLabel.includes('e-mail') || lowerLabel.includes(' mail') || lowerLabel.includes('ಇಮೇಲ್') || lowerLabel.includes('மின்னஞ்சல்') || lowerLabel.includes('ईमेल') || lowerLabel.includes('ఇమెయిల్')) {
    return validateEmail(value);
  }

  // Phone / Mobile field matching
  if (lowerLabel.includes('phone') || lowerLabel.includes('mobile') || lowerLabel.includes('contact') || lowerLabel.includes('cell') || lowerLabel.includes('telephone') || lowerLabel.includes('ಸಂಖ್ಯೆ') || lowerLabel.includes('தொலைபேசி') || lowerLabel.includes('फोन') || lowerLabel.includes('ఫోన్')) {
    return validatePhone(value);
  }

  // Name field matching
  if (lowerLabel.includes('name') || lowerLabel.includes('first') || lowerLabel.includes('last') || lowerLabel.includes('middle') || lowerLabel.includes('பெயர்') || lowerLabel.includes('ಹೆಸರು') || lowerLabel.includes('नाम') || lowerLabel.includes('పేరు')) {
    return { isValid: true, message: '', sanitized: toTitleCase(String(value).trim()) };
  }

  // Generic non-empty check
  if (!value || String(value).trim().length === 0) {
    return { isValid: false, message: `${label} cannot be empty.` };
  }

  return { isValid: true, message: '', sanitized: String(value).trim() };
};
