import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ExtractedData {
  barcode: string | null;
  categoryType: string | null;
  segmentType: string | null;
  manufacturer: string | null;
  brand: string | null;
  productName: string | null;
  weightUnit: string | null;
  packagingType: string | null;
  countryOfOrigin: string | null;
  promotionalMessage: string | null;
  confidence: Record<string, number>;
}

const EXTRACTION_PROMPT = `You are a product data extraction specialist. Extract EXACTLY these 10 fields from the product packaging image:

1. barcode - Product barcode/UPC/EAN number (alphanumeric code)
2. categoryType - Product category (dairy, beverages, snacks, personal care, etc.)
3. segmentType - Market segment classification (premium, standard, economy, organic, natural, etc.)
4. manufacturer - Company name that manufactures the product
5. brand - Brand name of the product
6. productName - Full product name and flavor/variant
7. weightUnit - Net weight with unit (e.g., "500g", "2L", "250ml", "12 oz")
8. packagingType - Type of packaging (bottle, can, box, jar, bag, pouch, etc.)
9. countryOfOrigin - Country where product is manufactured
10. promotionalMessage - Any promotional, marketing, or special offer text visible on packaging

IMPORTANT: Return ONLY valid JSON with these EXACT field names. Every field must be present (use null if not found).

{
  "barcode": "string or null",
  "categoryType": "string or null",
  "segmentType": "string or null",
  "manufacturer": "string or null",
  "brand": "string or null",
  "productName": "string or null",
  "weightUnit": "string or null",
  "packagingType": "string or null",
  "countryOfOrigin": "string or null",
  "promotionalMessage": "string or null",
  "confidence": {"barcode": 0.0, "categoryType": 0.0, ...}
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

  const extracted = JSON.parse(jsonStr) as Record<string, unknown>;

  const normalizeField = (val: unknown): string | null => {
    if (!val || val === "null" || val === "N/A" || val === "unknown") {
      return null;
    }
    return String(val).trim() || null;
  };

  return {
    barcode: normalizeField(extracted.barcode),
    categoryType: normalizeField(extracted.categoryType),
    segmentType: normalizeField(extracted.segmentType),
    manufacturer: normalizeField(extracted.manufacturer),
    brand: normalizeField(extracted.brand),
    productName: normalizeField(extracted.productName),
    weightUnit: normalizeField(extracted.weightUnit),
    packagingType: normalizeField(extracted.packagingType),
    countryOfOrigin: normalizeField(extracted.countryOfOrigin),
    promotionalMessage: normalizeField(extracted.promotionalMessage),
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

  return {
    barcode: front.barcode || back.barcode,
    categoryType: front.categoryType || back.categoryType,
    segmentType: front.segmentType || back.segmentType,
    manufacturer: front.manufacturer || back.manufacturer,
    brand: front.brand || back.brand,
    productName: front.productName || back.productName,
    weightUnit: front.weightUnit || back.weightUnit,
    packagingType: front.packagingType || back.packagingType,
    countryOfOrigin: front.countryOfOrigin || back.countryOfOrigin,
    promotionalMessage: (front.promotionalMessage || "") +
                        (back.promotionalMessage ? " " + back.promotionalMessage : ""),
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
