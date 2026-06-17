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

const EXTRACTION_PROMPT = `Extract EXACTLY these 13 fields from the product packaging image. Use ground truth from packaging as shown:

1. ITEM_NAME - Full descriptive product name as intended for the catalog
2. BARCODE - Numeric barcode as printed on package; numeric string without spaces/dashes
3. MANUFACTURER - Company that manufactures the product
4. BRAND - Brand name as shown on package
5. WEIGHT - Net weight or net volume (including unit). Use same format as ground truth (e.g., "260g", "430g", "1.5 KG", "500 ML")
6. PACKAGING_TYPE - Packaging form (TUB, GLASS JAR, SACHET, BOTTLE, CAN, etc.)
7. COUNTRY - Country of manufacture/packaging
8. VARIANT - Product variant if applicable (e.g., "ORIGINAL", "LOW FAT"); empty if not applicable
9. TYPE - Product type or short category (e.g., "MARGARINE", "MAYONNAISE", "BUTTER")
10. FRAGRANCE_FLAVOR - Flavor or fragrance where applicable (e.g., "RICH", "ORIGINAL"); empty if not applicable
11. PROMOTION - Any on-pack promotion text the ground truth includes (e.g., "50% OFF"); empty if not applicable
12. ADDONS - Additional product features or pack contents (e.g., "SPOON INCLUDED"); empty if not applicable
13. TAGLINE - Short promotional or descriptive tagline; may be empty

Return ONLY valid JSON with these EXACT field names. Every field must be present (use null or empty string "" if not found).

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
  "confidence": {"itemName": 0.9, "barcode": 0.95, ...}
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
    max_tokens: 500,
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

  const extracted = JSON.parse(jsonStr);

  const normalizeField = (val: any): string | null => {
    if (!val || val === "null" || val === "N/A" || val === "unknown" || val === "") {
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
      ? extracted.confidence
      : {},
  };
}

function mergeExtractions(
  front: ExtractedData,
  back: ExtractedData | null
): ExtractedData {
  if (!back) return front;

  return {
    itemName: front.itemName || back.itemName,
    barcode: front.barcode || back.barcode,
    manufacturer: front.manufacturer || back.manufacturer,
    brand: front.brand || back.brand,
    weight: front.weight || back.weight,
    packagingType: front.packagingType || back.packagingType,
    country: front.country || back.country,
    variant: front.variant || back.variant,
    type: front.type || back.type,
    fragranceFlavor: front.fragranceFlavor || back.fragranceFlavor,
    promotion: (front.promotion || "") + (back.promotion ? " " + back.promotion : ""),
    addons: (front.addons || "") + (back.addons ? " " + back.addons : ""),
    tagline: front.tagline || back.tagline,
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
