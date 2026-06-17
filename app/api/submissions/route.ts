import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { submissions } from "@/lib/db/schema";
import { extractFromImages } from "@/lib/utils/extract-from-image";
import { getClientIp } from "@/lib/utils/get-ip";
import { eq, desc } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const frontFile = formData.get("front") as File;
    const backFile = formData.get("back") as File | null;

    if (!frontFile) {
      return NextResponse.json(
        { error: "Front image required" },
        { status: 400 }
      );
    }

    const frontBytes = await frontFile.arrayBuffer();
    const frontBase64 = Buffer.from(frontBytes).toString("base64");

    let backBase64: string | undefined;
    if (backFile) {
      const backBytes = await backFile.arrayBuffer();
      backBase64 = Buffer.from(backBytes).toString("base64");
    }

    const userIp = await getClientIp();
    const extracted = await extractFromImages(frontBase64, backBase64);

    const result = await getDb().insert(submissions).values({
      userIp,
      barcode: extracted.barcode,
      categoryType: extracted.categoryType,
      segmentType: extracted.segmentType,
      manufacturer: extracted.manufacturer,
      brand: extracted.brand,
      productName: extracted.productName,
      weightUnit: extracted.weightUnit,
      packagingType: extracted.packagingType,
      countryOfOrigin: extracted.countryOfOrigin,
      promotionalMessage: extracted.promotionalMessage,
      confidence: extracted.confidence,
      rawExtraction: extracted,
    }).returning();

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Processing failed" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const userIp = await getClientIp();
    const data = await getDb()
      .select()
      .from(submissions)
      .where(eq(submissions.userIp, userIp))
      .orderBy(desc(submissions.createdAt))
      .limit(100);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch submissions" },
      { status: 500 }
    );
  }
}
