import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { submissions } from "@/lib/db/schema";
import { getClientIp } from "@/lib/utils/get-ip";
import { eq, and } from "drizzle-orm";
import { EXTRACTED_FIELDS, type FieldName } from "@/lib/utils/confidence";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userIp = await getClientIp();
    const numericId = Number(id);
    if (Number.isNaN(numericId)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const rows = await getDb()
      .select()
      .from(submissions)
      .where(and(eq(submissions.id, numericId), eq(submissions.userIp, userIp)))
      .limit(1);

    if (rows.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error("Fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch submission" }, { status: 500 });
  }
}

export async function PATCH(
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

    const body = (await req.json()) as {
      field: string;
      value: string | null;
      keepHistory: boolean;
    };

    if (!body.field || !EXTRACTED_FIELDS.includes(body.field as FieldName)) {
      return NextResponse.json({ error: "Invalid field" }, { status: 400 });
    }
    const field = body.field as FieldName;

    // Fetch the existing row (scoped to the caller's IP)
    const existing = await getDb()
      .select()
      .from(submissions)
      .where(and(eq(submissions.id, numericId), eq(submissions.userIp, userIp)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const row = existing[0];
    const oldValue = (row as Record<string, unknown>)[field] as string | null;

    // Build the update payload
    const update: Record<string, unknown> = {
      [field]: body.value,
    };

    // Update confidence: set to 1.0 (human-confirmed)
    const confidence = {
      ...((row.confidence as Record<string, number> | null) ?? {}),
      [field]: 1.0,
    };
    update.confidence = confidence;

    // Mark as manually edited
    const manuallyEdited = {
      ...((row.manuallyEdited as Record<string, boolean> | null) ?? {}),
      [field]: true,
    };
    update.manuallyEdited = manuallyEdited;

    // Optionally push to edit history
    if (body.keepHistory) {
      const editHistory = (row.editHistory as EditHistoryEntry[] | null) ?? [];
      editHistory.push({
        field,
        from: oldValue,
        to: body.value,
        at: new Date().toISOString(),
        ip: userIp,
      });
      update.editHistory = editHistory;
    }

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
    console.error("Patch error:", error);
    return NextResponse.json(
      { error: "Failed to update submission" },
      { status: 500 }
    );
  }
}

interface EditHistoryEntry {
  field: string;
  from: string | null;
  to: string | null;
  at: string;
  ip: string;
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userIp = await getClientIp();
    const numericId = Number(id);
    if (Number.isNaN(numericId)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const deleted = await getDb()
      .delete(submissions)
      .where(and(eq(submissions.id, numericId), eq(submissions.userIp, userIp)))
      .returning({ id: submissions.id });

    if (deleted.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete submission" },
      { status: 500 }
    );
  }
}