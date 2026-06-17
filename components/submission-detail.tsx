"use client";

import { useState } from "react";
import { SubmissionRow } from "@/hooks/use-submissions";
import {
  EXTRACTED_FIELDS,
  FIELD_LABELS,
  fieldConfidence,
  confidenceColor,
  confidencePct,
  type FieldName,
} from "@/lib/utils/confidence";
import { EditableField } from "./editable-field";
import { ReextractButton } from "./reextract-button";
import { Button } from "@/components/ui/button";
import { useDeleteSubmission } from "@/hooks/use-update-submission";

interface SubmissionDetailProps {
  row: SubmissionRow;
}

export function SubmissionDetail({ row }: SubmissionDetailProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const deleteMutation = useDeleteSubmission();

  const editedCount = row.manuallyEdited
    ? Object.values(row.manuallyEdited).filter(Boolean).length
    : 0;

  return (
    <div className="bg-muted/30 border-t-0 px-4 py-5 space-y-5">
      {/* Source images */}
      {(row.frontImage || row.backImage) && (
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Source Images
          </h4>
          <div className="grid grid-cols-2 gap-3 max-w-md">
            {row.frontImage && (
              <div className="space-y-1">
                <img
                  src={row.frontImage}
                  alt="Front of product"
                  className="w-full h-32 object-contain bg-background border border-border rounded-lg"
                />
                <p className="text-[10px] text-muted-foreground text-center">Front</p>
              </div>
            )}
            {row.backImage && (
              <div className="space-y-1">
                <img
                  src={row.backImage}
                  alt="Back of product"
                  className="w-full h-32 object-contain bg-background border border-border rounded-lg"
                />
                <p className="text-[10px] text-muted-foreground text-center">Back</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* All 13 fields with per-field confidence, inline-editable */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Extracted Fields
          </h4>
          {editedCount > 0 && (
            <span className="text-[10px] text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded-full font-medium">
              {editedCount} edited
            </span>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1">
          {EXTRACTED_FIELDS.map((field) => (
            <FieldRow
              key={field}
              field={field}
              value={row[field]}
              confidence={fieldConfidence(row.confidence, field)}
              row={row}
            />
          ))}
        </div>
        <p className="text-[10px] text-muted-foreground/70 mt-2">
          Click any value to edit. Edited fields are preserved on re-extract.
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-border">
        <ReextractButton row={row} />
        {!confirmDelete ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setConfirmDelete(true)}
            className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-xs text-foreground">Delete this submission?</span>
            <Button
              size="xs"
              variant="destructive"
              onClick={() => deleteMutation.mutate({ id: row.id })}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting…" : "Yes, delete"}
            </Button>
            <Button size="xs" variant="ghost" onClick={() => setConfirmDelete(false)}>
              Cancel
            </Button>
            {deleteMutation.isError && (
              <span className="text-xs text-destructive">{deleteMutation.error?.message}</span>
            )}
          </div>
        )}
      </div>

      {/* Edit history */}
      {row.editHistory && row.editHistory.length > 0 && (
        <details className="group">
          <summary className="text-xs font-semibold text-muted-foreground uppercase tracking-wide cursor-pointer hover:text-foreground flex items-center gap-1">
            <svg className="w-3 h-3 transition-transform group-open:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            Edit History ({row.editHistory.length})
          </summary>
          <div className="mt-2 space-y-1">
            {row.editHistory.map((entry, i) => (
              <div key={i} className="text-xs text-muted-foreground bg-background border border-border rounded px-2 py-1.5">
                <span className="font-medium text-foreground">{FIELD_LABELS[entry.field as FieldName] ?? entry.field}</span>:{" "}
                <span className="line-through">{entry.from || "—"}</span> →{" "}
                <span className="text-foreground">{entry.to || "—"}</span>
                <span className="ml-2 text-muted-foreground/70">
                  {new Date(entry.at).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </details>
      )}

      {/* Raw extraction JSON */}
      {row.rawExtraction && (
        <details className="group">
          <summary className="text-xs font-semibold text-muted-foreground uppercase tracking-wide cursor-pointer hover:text-foreground flex items-center gap-1">
            <svg className="w-3 h-3 transition-transform group-open:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            Raw Extraction (JSON)
          </summary>
          <pre className="mt-2 text-xs bg-background border border-border rounded-lg p-3 overflow-x-auto text-foreground">
            {JSON.stringify(row.rawExtraction, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
}

function FieldRow({
  field,
  value,
  confidence,
  row,
}: {
  field: FieldName;
  value: string | null;
  confidence: number | null;
  row: SubmissionRow;
}) {
  const colors = confidenceColor(confidence);

  return (
    <div className="flex items-start justify-between gap-3 py-1.5 border-b border-border last:border-0">
      <div className="flex items-center gap-2 min-w-0 pt-0.5">
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${colors.dot}`}
          title={`Confidence: ${confidencePct(confidence)}`}
        />
        <span className="text-xs text-muted-foreground truncate">
          {FIELD_LABELS[field]}
        </span>
      </div>
      <div className="text-right min-w-0 flex-1">
        <EditableField field={field} value={value} row={row} />
        {confidence !== null && (
          <span className={`ml-2 text-[10px] ${colors.text} opacity-70`}>
            {confidencePct(confidence)}
          </span>
        )}
      </div>
    </div>
  );
}