import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { submissions } from "@/lib/db/schema";
import { extractFromImages } from "@/lib/utils/extract-from-image";
import { getClientIp } from "@/lib/utils/get-ip";
import { sha256Hex } from "@/lib/utils/image-hash";
import { eq, and } from "drizzle-orm";
import { EXTRACTED_FIELDS, type FieldName } from "@/lib/utils/confidence";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userIp = await getClientIp();
    const numericId = Number(id);
    if (Number.isNaN(numericId)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    // Verify ownership
    const existing = await getDb()
      .select()
      .from(submissions)
      .where(and(eq(submissions.id, numericId), eq(submissions.userIp, userIp)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const row = existing[0];

    const formData = await req.formData();
    const frontFile = formData.get("front") as File;
    const backFile = formData.get("back") as File | null;

    if (!frontFile) {
      return NextResponse.json({ error: "Front image required" }, { status: 400 });
    }

    // Server-side validation
    if (!frontFile.type.startsWith("image/")) {
      return NextResponse.json({ error: "Front file must be an image" }, { status: 400 });
    }
    if (frontFile.size > 15 * 1024 * 1024) {
      return NextResponse.json({ error: "Front image must be under 15MB" }, { status: 400 });
    }
    if (backFile) {
      if (!backFile.type.startsWith("image/")) {
        return NextResponse.json({ error: "Back file must be an image" }, { status: 400 });
      }
      if (backFile.size > 15 * 1024 * 1024) {
        return NextResponse.json({ error: "Back image must be under 15MB" }, { status: 400 });
      }
    }

    const frontBytes = await frontFile.arrayBuffer();
    const frontBase64 = Buffer.from(frontBytes).toString("base64");
    const frontDataUrl = `data:${frontFile.type};base64,${frontBase64}`;
    const frontHash = sha256Hex(frontBytes);

    let backBase64: string | undefined;
    let backDataUrl: string | undefined;
    let backHash: string | undefined;
    if (backFile) {
      const backBytes = await backFile.arrayBuffer();
      backBase64 = Buffer.from(backBytes).toString("base64");
      backDataUrl = `data:${backFile.type};base64,${backBase64}`;
      backHash = sha256Hex(backBytes);
    }

    const extracted = await extractFromImages(frontBase64, backBase64);

    // Preserve manually-edited fields: don't overwrite them with new extraction
    const manuallyEdited =
      (row.manuallyEdited as Record<string, boolean> | null) ?? {};
    const oldConfidence = (row.confidence as Record<string, number> | null) ?? {};

    const update: Record<string, unknown> = {};
    const confidence: Record<string, number> = {};

    for (const field of EXTRACTED_FIELDS) {
      const fieldName = field as FieldName;
      if (manuallyEdited[fieldName]) {
        // Keep the human-edited value and confidence
        update[fieldName] = (row as Record<string, unknown>)[fieldName];
        confidence[fieldName] = oldConfidence[fieldName] ?? 1.0;
      } else {
        update[fieldName] = (extracted as unknown as Record<string, unknown>)[fieldName];
        confidence[fieldName] = extracted.confidence[fieldName] ?? 0;
      }
    }
    update.confidence = confidence;
    update.rawExtraction = extracted;
    // Always update the source images + their hashes on re-extract
    update.frontImage = frontDataUrl;
    update.backImage = backDataUrl ?? null;
    update.frontImageHash = frontHash;
    update.backImageHash = backHash ?? null;

    const updated = await getDb()
      .update(submissions)
      .set(update)
      .where(and(eq(submissions.id, numericId), eq(submissions.userIp, userIp)))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error("Re-extract error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Re-extraction failed" },
      { status: 500 }
    );
  }
}