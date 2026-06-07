// lib/vision-ocrspace.ts
export interface ExtractedData {
  rawText:        string;
  name:           string;
  phoneNumber:    string;
  alternatePhone: string;
  address:        string;
  landmark:       string;
  city:           string;
  district:       string;
  state:          string;
  pincode:        string;
  trackingId:     string;
  courier:        string;
  trackingUrl:    string;
  otherText:      string;
}

const EMPTY: ExtractedData = {
  rawText: '', name: '', phoneNumber: '', alternatePhone: '',
  address: '', landmark: '', city: '', district: '', state: '',
  pincode: '', trackingId: '', courier: '', trackingUrl: '', otherText: '',
};

// ── OCR API call ────────────────────────────────────────────────────────────
async function callOCRSpaceAPI(base64Image: string, engine = 2): Promise<string> {
  const formData = new URLSearchParams();
  formData.append('base64Image', `data:image/jpeg;base64,${base64Image}`);
  formData.append('apikey', process.env.OCR_SPACE_API_KEY || 'helloworld');
  formData.append('language', 'eng');
  formData.append('isOverlayRequired', 'false');
  formData.append('OCREngine', engine.toString());
  formData.append('scale', 'true');
  formData.append('isTable', 'true');

  const res = await fetch('https://api.ocr.space/parse/image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formData,
  });

  if (!res.ok) throw new Error(`OCR.space failed: ${res.status}`);
  const result = await res.json();
  if (result.IsErroredOnProcessing) throw new Error(result.ErrorMessage?.[0] || 'OCR error');

  return (result.ParsedResults?.[0]?.ParsedText || '').replace(/\r\n/g, '\n').trim();
}

// ── Courier patterns ────────────────────────────────────────────────────────
const COURIERS = [
  {
    name: 'DTDC',
    match: [/\bdtdc\b/i],
    prefix: /\b[RZD]\d{7,}\b/i,
    url: (id: string) => `https://www.dtdc.in/tracking.asp?podNo=${id}`,
  },
  {
    name: 'BlueDart',
    match: [/blue\s*dart/i],
    prefix: /^\d{9,11}$/,
    url: (id: string) => `https://www.bluedart.com/tracking?trackfor=${id}`,
  },
  {
    name: 'Delhivery',
    match: [/delhivery/i],
    prefix: /^\d{12,18}$/,
    url: (id: string) => `https://www.delhivery.com/track/package/${id}`,
  },
  {
    name: 'Ekart',
    match: [/ekart/i, /flipkart/i],
    prefix: /^FMPP\d+/i,
    url: (id: string) => `https://ekartlogistics.com/track?trackingId=${id}`,
  },
  {
    name: 'India Post',
    match: [/india\s*post/i, /speed\s*post/i],
    prefix: /^[A-Z]{2}\d{9}IN$/i,
    url: (id: string) => `https://www.indiapost.gov.in/vas/Pages/IndiaPostHome.aspx?q=${id}`,
  },
];

function detectCourier(rawText: string, trackingId: string) {
  for (const c of COURIERS) {
    if (c.match.some(p => p.test(rawText)) || c.prefix.test(trackingId)) {
      return { courier: c.name, trackingUrl: c.url(trackingId) };
    }
  }
  return {
    courier: 'Unknown',
    trackingUrl: `https://www.google.com/search?q=${encodeURIComponent(trackingId + ' tracking')}`,
  };
}

// ── Core parser — built for "Key :- Value" label format ────────────────────
function parsePackageLabel(rawText: string): ExtractedData {
  if (!rawText.trim()) return { ...EMPTY };

  const result: ExtractedData = { ...EMPTY, rawText };

  // Extract "Key :- Value" or "Key :- Value" patterns
  // Handles separators: :-, :-, :, :-*, :-
  const field = (keys: string[]): string => {
    const pattern = new RegExp(
      `(?:${keys.join('|')})\\s*[:\\-–]+\\*?\\s*(.+?)(?=\\n|$)`,
      'i'
    );
    const match = rawText.match(pattern);
    return match ? match[1].trim().replace(/\*$/, '').trim() : '';
  };

  // ── Structured fields ───────────────────────────────────────────────────
  result.name     = field(['name']);
  result.address  = field(['address']);
  result.landmark = field(['landmark']);
  result.city     = field(['city']);
  result.district = field(['district', 'dist']);
  result.state    = field(['state']);
  result.pincode  = field(['pincode', 'pin code', 'pin']);

  // ── Phone — handle "*8075907475", "+91 9747827737", "9744813329, 8547168769" ──
  const phoneRaw  = field(['phone', 'ph', 'mobile', 'mob', 'contact']);
  const allPhones: string[] = phoneRaw.match(/[\d]{10}/g) || [];
  
  // Also scan full text for any missed phones
  if (allPhones.length === 0) {
    const fullScan: string[] = rawText.match(/(?<!\d)[6-9]\d{9}(?!\d)/g) || [];
    allPhones.push(...fullScan);
  }

  result.phoneNumber    = allPhones[0] || '';
  result.alternatePhone = allPhones[1] || '';

  // ── Tracking ID — DTDC format R5000XXXXXX ──────────────────────────────
  const trackingMatch = rawText.match(/\b([A-Z][A-Z0-9]{6,})\b/g);
  if (trackingMatch) {
    // Filter out common false positives
    const ignored = /^(NAME|ADDRESS|PHONE|CITY|STATE|DISTRICT|PINCODE|LANDMARK|POST|TAMIL|NADU|KERALA|KARNATAKA)$/i;
    const trackingId = trackingMatch.find(t => !ignored.test(t) && /\d/.test(t));
    if (trackingId) {
      result.trackingId = trackingId;
      const { courier, trackingUrl } = detectCourier(rawText, trackingId);
      result.courier    = courier;
      result.trackingUrl = trackingUrl;
    }
  }

  // ── otherText — anything not captured ──────────────────────────────────
  const captured = new Set([
    result.name, result.address, result.landmark, result.city,
    result.district, result.state, result.pincode,
    result.phoneNumber, result.alternatePhone, result.trackingId,
  ].filter(Boolean));

  const otherLines = rawText
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 2 && !captured.has(l) && !/^(name|address|landmark|city|district|state|pincode|pin|phone|ph|mobile)[\s:–-]/i.test(l));

  result.otherText = otherLines.join('\n');

  console.log('Parsed package label:', {
    name: result.name,
    phone: result.phoneNumber,
    city: result.city,
    state: result.state,
    pincode: result.pincode,
    trackingId: result.trackingId,
    courier: result.courier,
  });

  return result;
}

// ── Buffer → base64 helper ─────────────────────────────────────────────────
function toBase64(input: Buffer | string): string {
  if (typeof input === 'string') {
    return input.startsWith('data:') ? (input.split(',')[1] ?? '') : input;
  }
  return input.toString('base64');
}

// ── Exported: primary extraction ───────────────────────────────────────────
export async function extractTextFromImage(imageBuffer: Buffer | string): Promise<ExtractedData> {
  try {
    const b64 = toBase64(imageBuffer);

    // Try engine 2 first (better for printed text), fallback to engine 1
    let rawText = '';
    try {
      rawText = await callOCRSpaceAPI(b64, 2);
    } catch {
      console.warn('Engine 2 failed, trying engine 1...');
      rawText = await callOCRSpaceAPI(b64, 1);
    }

    return parsePackageLabel(rawText);
  } catch (err: any) {
    console.error('extractTextFromImage failed:', err.message);
    return { ...EMPTY };
  }
}

// ── Exported: document type — no extra API call, derived from text ─────────
export async function detectDocumentType(imageBuffer: Buffer | string): Promise<string> {
  // All your images are package labels — skip the extra OCR call
  // If you ever need real detection, parse rawText from extractTextFromImage
  return 'package_label';
}

// ── Exported: advanced (tries both engines, picks longer result) ───────────
export async function extractTextWithOCRSpaceAdvanced(imageBuffer: Buffer | string): Promise<ExtractedData> {
  try {
    const b64 = toBase64(imageBuffer);
    const [text1, text2] = await Promise.allSettled([
      callOCRSpaceAPI(b64, 1),
      callOCRSpaceAPI(b64, 2),
    ]);

    const t1 = text1.status === 'fulfilled' ? text1.value : '';
    const t2 = text2.status === 'fulfilled' ? text2.value : '';
    const best = t1.length >= t2.length ? t1 : t2;

    return parsePackageLabel(best);
  } catch (err: any) {
    console.error('Advanced extraction failed:', err.message);
    return { ...EMPTY };
  }
}