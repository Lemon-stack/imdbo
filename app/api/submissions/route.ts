import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { submissions } from "@/lib/db/schema";
import { extractFromImages } from "@/lib/utils/extract-from-image";
import { getClientIp } from "@/lib/utils/get-ip";
import { sha256Hex } from "@/lib/utils/image-hash";
import { eq, desc } from "drizzle-orm";

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX = 10; // 10 extractions per minute per IP

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): { ok: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || entry.resetAt < now) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { ok: true, remaining: RATE_LIMIT_MAX - 1, resetIn: RATE_LIMIT_WINDOW_MS };
  }

  entry.count += 1;
  if (entry.count > RATE_LIMIT_MAX) {
    return { ok: false, remaining: 0, resetIn: entry.resetAt - now };
  }
  return { ok: true, remaining: RATE_LIMIT_MAX - entry.count, resetIn: entry.resetAt - now };
}

function validateImageFile(file: File, label: string): string | null {
  if (!file.type.startsWith("image/")) {
    return `${label} must be an image file`;
  }
  if (file.size > MAX_FILE_SIZE) {
    return `${label} must be under 15MB`;
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const userIp = await getClientIp();

    // Rate limit
    const rl = checkRateLimit(userIp);
    if (!rl.ok) {
      return NextResponse.json(
        { error: `Rate limit exceeded. Try again in ${Math.ceil(rl.resetIn / 1000)}s.` },
        { status: 429, headers: { "Retry-After": String(Math.ceil(rl.resetIn / 1000)) } }
      );
    }

    const formData = await req.formData();
    const frontFile = formData.get("front") as File;
    const backFile = formData.get("back") as File | null;

    if (!frontFile) {
      return NextResponse.json(
        { error: "Front image required" },
        { status: 400 }
      );
    }

    // Server-side validation
    const frontError = validateImageFile(frontFile, "Front image");
    if (frontError) {
      return NextResponse.json({ error: frontError }, { status: 400 });
    }
    if (backFile) {
      const backError = validateImageFile(backFile, "Back image");
      if (backError) {
        return NextResponse.json({ error: backError }, { status: 400 });
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

    // No deduplication: each recursive upload creates a new row so the user
    // can compare extraction results across runs. The hash columns are
    // stored for traceability (UI can show "you've uploaded this before")
    // but are NOT used to block or merge uploads.
    const extracted = await extractFromImages(frontBase64, backBase64);

    const result = await getDb().insert(submissions).values({
      userIp,
      itemName: extracted.itemName,
      barcode: extracted.barcode,
      manufacturer: extracted.manufacturer,
      brand: extracted.brand,
      weight: extracted.weight,
      packagingType: extracted.packagingType,
      country: extracted.country,
      variant: extracted.variant,
      type: extracted.type,
      fragranceFlavor: extracted.fragranceFlavor,
      promotion: extracted.promotion,
      addons: extracted.addons,
      tagline: extracted.tagline,
      frontImage: frontDataUrl,
      backImage: backDataUrl ?? null,
      frontImageHash: frontHash,
      backImageHash: backHash ?? null,
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

export async function GET() {
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

export async function DELETE() {
  try {
    const userIp = await getClientIp();
    const deleted = await getDb()
      .delete(submissions)
      .where(eq(submissions.userIp, userIp))
      .returning({ id: submissions.id });

    return NextResponse.json({ ok: true, deleted: deleted.length });
  } catch (error) {
    console.error("Clear submissions error:", error);
    return NextResponse.json(
      { error: "Failed to clear submissions" },
      { status: 500 }
    );
  }
}
