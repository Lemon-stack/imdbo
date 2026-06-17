import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ExtractedData {
  itemName: string | null;
  barcode: string | null;
  manufacturer: string | null;
  brand: string | null;
  weight: string | null;
  packagingType: string | null;
  country: string | null;
  variant: string | null;
  type: string | null;
  fragranceFlavor: string | null;
  promotion: string | null;
  addons: string | null;
  tagline: string | null;
  confidence: Record<string, number>;
}

const EXTRACTION_PROMPT = `You are a product data extraction specialist. Extract EXACTLY these 13 fields from the product packaging image. Return null for any field not present on the package.

1. itemName - Full descriptive product name as intended for the catalog (string).
2. barcode - Numeric barcode as printed on the package; numeric string without spaces/dashes.
3. manufacturer - Company that manufactures the product (string).
4. brand - Brand name as shown on the package (string).
5. weight - Net weight or net volume (including unit). Use the same format as printed (examples: "250G", "430G", "1.5 KG", "500 ML").
6. packagingType - Packaging form (examples: "TUB", "GLASS JAR", "SACHET", "BOTTLE", "CAN").
7. country - Country of manufacture/packing (string).
8. variant - Product variant if applicable (e.g., "ORIGINAL", "LOW FAT"); null if not applicable.
9. type - Product type or short category (e.g., "MARGARINE", "MAYONNAISE", "BUTTER").
10. fragranceFlavor - Flavor or fragrance where applicable (e.g., "RICH", "ORIGINAL"); null if not applicable.
11. promotion - Any on-pack promotion text (e.g., "50% OFF"); null if not applicable.
12. addons - Additional product features or pack contents (e.g., "SPOON INCLUDED"); null if not applicable.
13. tagline - Short promotional or descriptive tagline (string); may be null.

IMPORTANT: Return ONLY valid JSON with these EXACT field names. Every field must be present (use null if not found). Also include a "confidence" object mapping each field name to a number between 0.0 and 1.0 indicating how confident you are in the extracted value.

{
  "itemName": "string or null",
  "barcode": "string or null",
  "manufacturer": "string or null",
  "brand": "string or null",
  "weight": "string or null",
  "packagingType": "string or null",
  "country": "string or null",
  "variant": "string or null",
  "type": "string or null",
  "fragranceFlavor": "string or null",
  "promotion": "string or null",
  "addons": "string or null",
  "tagline": "string or null",
  "confidence": {"itemName": 0.0, "barcode": 0.0, ...}
}`;

async function extractSingleImage(
  base64Image: string,
  side: string,
  temperatureBoost = 0
): Promise<ExtractedData> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: {
              url: `data:image/jpeg;base64,${base64Image}`,
            },
          },
          {
            type: "text",
            text: `${EXTRACTION_PROMPT}\n\nThis is the ${side} of the product.`,
          },
        ],
      },
    ],
    max_tokens: 800,
    temperature: 0.2 + temperatureBoost,
  });

  const content = response.choices[0].message.content;
  if (!content) {
    throw new Error("No response from OpenAI");
  }

  let jsonStr = content.trim();
  if (jsonStr.startsWith("```json")) {
    jsonStr = jsonStr.replace(/^```json\n?/, "").replace(/\n?```$/, "");
  } else if (jsonStr.startsWith("```")) {
    jsonStr = jsonStr.replace(/^```\n?/, "").replace(/\n?```$/, "");
  }

  const extracted = JSON.parse(jsonStr) as Record<string, unknown>;

  const normalizeField = (val: unknown): string | null => {
    if (!val || val === "null" || val === "N/A" || val === "unknown") {
      return null;
    }
    return String(val).trim() || null;
  };

  return {
    itemName: normalizeField(extracted.itemName),
    barcode: normalizeField(extracted.barcode),
    manufacturer: normalizeField(extracted.manufacturer),
    brand: normalizeField(extracted.brand),
    weight: normalizeField(extracted.weight),
    packagingType: normalizeField(extracted.packagingType),
    country: normalizeField(extracted.country),
    variant: normalizeField(extracted.variant),
    type: normalizeField(extracted.type),
    fragranceFlavor: normalizeField(extracted.fragranceFlavor),
    promotion: normalizeField(extracted.promotion),
    addons: normalizeField(extracted.addons),
    tagline: normalizeField(extracted.tagline),
    confidence: extracted.confidence && typeof extracted.confidence === "object"
      ? (extracted.confidence as Record<string, number>)
      : {},
  };
}

function mergeExtractions(
  front: ExtractedData,
  back: ExtractedData | null
): ExtractedData {
  if (!back) return front;

  // For each field, pick the value from whichever side has higher confidence.
  // This is better than "front wins unless null" because the back often has
  // the barcode, weight, and ingredients while the front has the brand/name.
  const pickByConfidence = (
    field: keyof ExtractedData
  ): string | null => {
    const fConf = front.confidence[field] ?? 0;
    const bConf = back.confidence[field] ?? 0;
    if (fConf >= bConf) {
      return front[field] as string | null;
    }
    return back[field] as string | null;
  };

  return {
    itemName: pickByConfidence("itemName"),
    barcode: pickByConfidence("barcode"),
    manufacturer: pickByConfidence("manufacturer"),
    brand: pickByConfidence("brand"),
    weight: pickByConfidence("weight"),
    packagingType: pickByConfidence("packagingType"),
    country: pickByConfidence("country"),
    variant: pickByConfidence("variant"),
    type: pickByConfidence("type"),
    fragranceFlavor: pickByConfidence("fragranceFlavor"),
    promotion: pickByConfidence("promotion"),
    addons: pickByConfidence("addons"),
    tagline: pickByConfidence("tagline"),
    confidence: {
      ...front.confidence,
      ...Object.entries(back.confidence || {}).reduce(
        (acc, [key, val]) => ({
          ...acc,
          [key]: Math.max(acc[key as keyof typeof acc] || 0, val),
        }),
        front.confidence || {}
      ),
    },
  };
}

export async function extractFromImage(
  base64Image: string
): Promise<ExtractedData> {
  try {
    return await extractSingleImage(base64Image, "");
  } catch (error) {
    console.error("Extraction error:", error);
    throw error;
  }
}

/**
 * Count how many of the 13 spec fields have a non-null value.
 */
function countNonNull(data: ExtractedData): number {
  const fields: (keyof ExtractedData)[] = [
    "itemName", "barcode", "manufacturer", "brand", "weight",
    "packagingType", "country", "variant", "type", "fragranceFlavor",
    "promotion", "addons", "tagline",
  ];
  return fields.reduce((acc, f) => acc + (data[f] != null ? 1 : 0), 0);
}

/**
 * Extract from one or two images. If the result has fewer than MIN_FIELDS
 * non-null values, retry up to MAX_RETRIES times. Each retry uses a slightly
 * higher temperature to encourage the model to look harder.
 */
const MIN_FIELDS = 5; // at least 5 of 13 fields must be non-null
const MAX_RETRIES = 2; // up to 3 total attempts (initial + 2 retries)

export async function extractFromImages(
  frontBase64: string,
  backBase64?: string
): Promise<ExtractedData> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const frontData = await extractSingleImage(
        frontBase64,
        "front",
        attempt * 0.15 // increase temperature on retries
      );

      const merged = backBase64
        ? mergeExtractions(
            frontData,
            await extractSingleImage(backBase64, "back", attempt * 0.15)
          )
        : frontData;

      const filled = countNonNull(merged);
      if (filled >= MIN_FIELDS) {
        return merged;
      }

      console.warn(
        `Extraction attempt ${attempt + 1}: only ${filled}/${MIN_FIELDS} fields filled, retrying...`
      );
      lastError = new Error(
        `Insufficient fields extracted: ${filled}/${MIN_FIELDS}`
      );
    } catch (error) {
      console.error(`Extraction attempt ${attempt + 1} failed:`, error);
      lastError = error;
    }
  }

  // Last attempt — return whatever we got, even if sparse
  try {
    const frontData = await extractSingleImage(frontBase64, "front", 0.3);
    if (backBase64) {
      const backData = await extractSingleImage(backBase64, "back", 0.3);
      return mergeExtractions(frontData, backData);
    }
    return frontData;
  } catch (error) {
    console.error("Final extraction attempt failed:", error);
    throw lastError || error;
  }
}
