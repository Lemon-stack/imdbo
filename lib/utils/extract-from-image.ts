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

const EXTRACTION_PROMPT = `Extract the following information from the product image. Return a JSON object with these exact fields. If a field is not visible or cannot be determined, set it to null. Include a "confidence" object with 0-1 scores for each field.

Fields to extract:
1. barcode - The product barcode/SKU number
2. categoryType - Product category (e.g., dairy, beverages, snacks)
3. segmentType - Market segment (e.g., premium, economy, organic)
4. manufacturer - Company that manufactures the product
5. brand - Brand name
6. productName - Full product name/description
7. weightUnit - Weight and unit (e.g., "500g", "2L")
8. packagingType - Type of packaging (e.g., bottle, box, can)
9. countryOfOrigin - Country where product is from
10. promotionalMessage - Any promotional text or marketing message

Return ONLY valid JSON, no additional text.`;

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
  return {
    barcode: extracted.barcode || null,
    categoryType: extracted.categoryType || null,
    segmentType: extracted.segmentType || null,
    manufacturer: extracted.manufacturer || null,
    brand: extracted.brand || null,
    productName: extracted.productName || null,
    weightUnit: extracted.weightUnit || null,
    packagingType: extracted.packagingType || null,
    countryOfOrigin: extracted.countryOfOrigin || null,
    promotionalMessage: extracted.promotionalMessage || null,
    confidence: extracted.confidence || {},
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
