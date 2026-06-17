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
  side: string
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
    temperature: 0.2,
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

  const pick = (a: string | null, b: string | null): string | null => a || b;

  return {
    itemName: pick(front.itemName, back.itemName),
    barcode: pick(front.barcode, back.barcode),
    manufacturer: pick(front.manufacturer, back.manufacturer),
    brand: pick(front.brand, back.brand),
    weight: pick(front.weight, back.weight),
    packagingType: pick(front.packagingType, back.packagingType),
    country: pick(front.country, back.country),
    variant: pick(front.variant, back.variant),
    type: pick(front.type, back.type),
    fragranceFlavor: pick(front.fragranceFlavor, back.fragranceFlavor),
    promotion: pick(front.promotion, back.promotion),
    addons: pick(front.addons, back.addons),
    tagline: pick(front.tagline, back.tagline),
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

export async function extractFromImages(
  frontBase64: string,
  backBase64?: string
): Promise<ExtractedData> {
  try {
    const frontData = await extractSingleImage(frontBase64, "front");

    if (!backBase64) {
      return frontData;
    }

    const backData = await extractSingleImage(backBase64, "back");
    return mergeExtractions(frontData, backData);
  } catch (error) {
    console.error("Multi-image extraction error:", error);
    throw error;
  }
}
