"use client";

import { SubmissionRow } from "@/hooks/use-submissions";
import {
  EXTRACTED_FIELDS,
  FIELD_LABELS,
  fieldConfidence,
  confidenceColor,
  confidencePct,
  type FieldName,
} from "@/lib/utils/confidence";

interface SubmissionDetailProps {
  row: SubmissionRow;
}

export function SubmissionDetail({ row }: SubmissionDetailProps) {
  return (
    <div className="bg-muted/30 border-t-0 px-4 py-5 space-y-5">
      {/* All 10 fields with per-field confidence */}
      <div>
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          Extracted Fields
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
          {EXTRACTED_FIELDS.map((field) => (
            <FieldRow
              key={field}
              field={field}
              value={row[field]}
              confidence={fieldConfidence(row.confidence, field)}
            />
          ))}
        </div>
      </div>

      {/* Raw extraction JSON */}
      {row.rawExtraction && (
        <details className="group">
          <summary className="text-xs font-semibold text-muted-foreground uppercase tracking-wide cursor-pointer hover:text-foreground flex items-center gap-1">
            <svg
              className="w-3 h-3 transition-transform group-open:rotate-90"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
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
}: {
  field: FieldName;
  value: string | null;
  confidence: number | null;
}) {
  const colors = confidenceColor(confidence);
  const hasValue = value != null && String(value).trim() !== "";

  return (
    <div className="flex items-start justify-between gap-3 py-1.5 border-b border-border last:border-0">
      <div className="flex items-center gap-2 min-w-0">
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${colors.dot}`}
          title={`Confidence: ${confidencePct(confidence)}`}
        />
        <span className="text-xs text-muted-foreground truncate">
          {FIELD_LABELS[field]}
        </span>
      </div>
      <div className="text-right min-w-0 flex-1">
        {hasValue ? (
          <span className={`text-sm font-medium ${colors.text} break-words`}>
            {value}
          </span>
        ) : (
          <span className="text-sm text-muted-foreground/60">—</span>
        )}
        {hasValue && confidence !== null && (
          <span className={`ml-2 text-[10px] ${colors.text} opacity-70`}>
            {confidencePct(confidence)}
          </span>
        )}
      </div>
    </div>
  );
}