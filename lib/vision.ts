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
interface OCRAttempt {
  engine: 1 | 2;
  detectOrientation: boolean;
}

async function callOCRSpaceAPI(base64Image: string, attempt: OCRAttempt): Promise<string> {
  const formData = new URLSearchParams();
  formData.append('base64Image', `data:image/jpeg;base64,${base64Image}`);
  formData.append('apikey', process.env.OCR_SPACE_API_KEY || 'helloworld');
  formData.append('language', 'eng');
  formData.append('isOverlayRequired', 'false');
  formData.append('OCREngine', attempt.engine.toString());
  formData.append('scale', 'true');
  formData.append('isTable', 'true');
  // Auto-corrects sideways / upside-down photos. Package labels are often
  // shot rotated, and this was the root cause of the "Raif" label failing
  // while straighter shots succeeded.
  formData.append('detectOrientation', attempt.detectOrientation ? 'true' : 'false');

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

// ── Known label keys, longest/most-specific alias first ────────────────────
const KEY_DEFS: { field: keyof ExtractedData; aliases: string[] }[] = [
  { field: 'name',     aliases: ['name'] },
  { field: 'address',  aliases: ['address'] },
  { field: 'landmark', aliases: ['landmark'] },
  { field: 'city',     aliases: ['city'] },
  { field: 'district', aliases: ['district', 'dist'] },
  { field: 'state',    aliases: ['state'] },
  { field: 'pincode',  aliases: ['pincode', 'pin code', 'pin'] },
  { field: 'phoneNumber', aliases: ['phone', 'ph', 'mobile', 'mob', 'contact'] },
];

// Lines that mark the end of the address block (not real data fields).
const STOP_LINE = /^(from|preferred\s*courier|to\s*:)/i;

function keyLineMatch(line: string): { field: keyof ExtractedData; value: string } | null {
  for (const def of KEY_DEFS) {
    const pattern = new RegExp(`^\\s*(?:${def.aliases.join('|')})\\s*[:\\-–]+\\*?\\s*(.*)$`, 'i');
    const match = line.match(pattern);
    if (match) return { field: def.field, value: match[1].trim().replace(/\*$/, '').trim() };
  }
  return null;
}

// ── Core parser — built for "Key :- Value" label format ────────────────────
// Handles values that wrap across multiple OCR lines (e.g. a long address
// printed on 3 physical lines) by folding continuation lines into the
// current field until the next known key or a stop line appears.
function parsePackageLabel(rawText: string): ExtractedData {
  if (!rawText.trim()) return { ...EMPTY };

  const result: ExtractedData = { ...EMPTY, rawText };
  const chunks: Partial<Record<keyof ExtractedData, string[]>> = {};
  const consumedLines: string[] = [];

  let currentField: keyof ExtractedData | null = null;
  const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);

  for (const line of lines) {
    if (STOP_LINE.test(line)) { currentField = null; continue; }

    const keyed = keyLineMatch(line);
    if (keyed) {
      currentField = keyed.field;
      chunks[currentField] = chunks[currentField] || [];
      if (keyed.value) chunks[currentField]!.push(keyed.value);
      consumedLines.push(line);
    } else if (currentField) {
      // continuation of the previous field's value
      chunks[currentField]!.push(line);
      consumedLines.push(line);
    }
  }

  for (const def of KEY_DEFS) {
    const val = (chunks[def.field] || []).join(' ').replace(/\s+/g, ' ').trim();
    if (def.field !== 'phoneNumber') (result as any)[def.field] = val;
  }

  // ── Phone — handle "*8075907475", "+91 9747827737", "9744813329, 8547168769" ──
  const phoneRaw = (chunks.phoneNumber || []).join(' ');
  let allPhones: string[] = phoneRaw.match(/\d{10}/g) || [];

  // Also scan full text for any missed phones
  if (allPhones.length === 0) {
    const fullScan: string[] = rawText.match(/(?<!\d)[6-9]\d{9}(?!\d)/g) || [];
    allPhones.push(...fullScan);
  }
  allPhones = [...new Set(allPhones)];

  result.phoneNumber    = allPhones[0] || '';
  result.alternatePhone = allPhones[1] || '';

  // ── Tracking ID — DTDC format R5000XXXXXX ──────────────────────────────
  const trackingMatch = rawText.match(/\b([A-Z][A-Z0-9]{6,})\b/g);
  if (trackingMatch) {
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
  const consumedSet = new Set(consumedLines);
  const otherLines = rawText
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 2 && !consumedSet.has(l));

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

// ── How "complete" a parse is — used to pick the best of several OCR tries ──
const CORE_FIELDS: (keyof ExtractedData)[] = ['name', 'phoneNumber', 'address', 'city', 'state', 'pincode'];

function score(data: ExtractedData): number {
  let s = 0;
  for (const f of CORE_FIELDS) if (data[f]) s += 1;
  if (data.rawText) s += data.rawText.length / 1000; // tiebreaker: more text read
  return s;
}

// ── Buffer → base64 helper ─────────────────────────────────────────────────
function toBase64(input: Buffer | string): string {
  if (typeof input === 'string') {
    return input.startsWith('data:') ? (input.split(',')[1] ?? '') : input;
  }
  return input.toString('base64');
}

// ── Exported: primary extraction ───────────────────────────────────────────
// Tries several engine/orientation combinations and keeps the best-scoring
// result, instead of stopping at the first one that doesn't throw. A rotated
// or blurry label can "succeed" with a near-empty response — that used to be
// accepted as final. Now every attempt is scored and only the best kept.
export async function extractTextFromImage(imageBuffer: Buffer | string): Promise<ExtractedData> {
  const b64 = toBase64(imageBuffer);

  const attempts: OCRAttempt[] = [
    { engine: 2, detectOrientation: true },
    { engine: 1, detectOrientation: true },
    { engine: 2, detectOrientation: false },
    { engine: 1, detectOrientation: false },
  ];

  let best: ExtractedData = { ...EMPTY };
  let bestScore = -1;
  const errors: string[] = [];

  for (const attempt of attempts) {
    try {
      const rawText = await callOCRSpaceAPI(b64, attempt);
      const parsed = parsePackageLabel(rawText);
      const s = score(parsed);
      if (s > bestScore) {
        best = parsed;
        bestScore = s;
      }
      // Good enough — stop burning API calls once all core fields are present.
      if (CORE_FIELDS.every(f => parsed[f])) break;
    } catch (err: any) {
      errors.push(`engine${attempt.engine} orient=${attempt.detectOrientation}: ${err.message}`);
    }
  }

  if (bestScore < 0) {
    console.error('extractTextFromImage: all OCR attempts failed:', errors.join(' | '));
  } else if (bestScore < CORE_FIELDS.length) {
    console.warn('extractTextFromImage: partial read, missing some fields. Errors seen:', errors.join(' | '));
  }

  return best;
}

// ── Exported: document type — no extra API call, derived from text ─────────
export async function detectDocumentType(imageBuffer: Buffer | string): Promise<string> {
  return 'package_label';
}

// ── Exported: advanced (tries both engines, picks longer result) ───────────
export async function extractTextWithOCRSpaceAdvanced(imageBuffer: Buffer | string): Promise<ExtractedData> {
  try {
    const b64 = toBase64(imageBuffer);
    const [text1, text2] = await Promise.allSettled([
      callOCRSpaceAPI(b64, { engine: 1, detectOrientation: true }),
      callOCRSpaceAPI(b64, { engine: 2, detectOrientation: true }),
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