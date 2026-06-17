"use client";

import { SubmissionRow } from "@/hooks/use-submissions";
import {
  averageConfidence,
  countExtracted,
  EXTRACTED_FIELDS,
} from "@/lib/utils/confidence";

interface ConfidenceSummaryProps {
  data: SubmissionRow[];
  lowConfidenceOnly: boolean;
  onToggleLowConfidence: (value: boolean) => void;
}

export function ConfidenceSummary({
  data,
  lowConfidenceOnly,
  onToggleLowConfidence,
}: ConfidenceSummaryProps) {
  const total = data.length;
  const avgConfidences = data
    .map((row) => averageConfidence(row.confidence))
    .filter((v): v is number => v !== null);
  const overallAvg =
    avgConfidences.length > 0
      ? avgConfidences.reduce((a, b) => a + b, 0) / avgConfidences.length
      : null;
  const fieldsExtracted = data.reduce((acc, row) => acc + countExtracted(row), 0);
  const fieldsPossible = total * EXTRACTED_FIELDS.length;
  const lowConfidenceCount = avgConfidences.filter((v) => v < 0.5).length;

  const stats = [
    {
      label: "Submissions",
      value: total.toString(),
      sub: lowConfidenceOnly && lowConfidenceCount > 0
        ? `${lowConfidenceCount} low confidence`
        : null,
    },
    {
      label: "Avg confidence",
      value: overallAvg !== null ? `${Math.round(overallAvg * 100)}%` : "—",
    },
    {
      label: "Fields extracted",
      value: `${fieldsExtracted}/${fieldsPossible}`,
    },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex flex-wrap items-center gap-2">
        {stats.map((stat) => (
          <span
            key={stat.label}
            className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-card px-3 text-sm text-muted-foreground"
          >
            {stat.label}
            <strong className="font-semibold text-foreground">{stat.value}</strong>
            {stat.sub && <span className="text-xs text-destructive">{stat.sub}</span>}
          </span>
        ))}
      </div>

      {lowConfidenceCount > 0 && (
        <label className="inline-flex h-9 cursor-pointer select-none items-center gap-2 rounded-full border border-border bg-card px-3 text-sm text-foreground">
          <input
            type="checkbox"
            checked={lowConfidenceOnly}
            onChange={(e) => onToggleLowConfidence(e.target.checked)}
            className="h-4 w-4 rounded border-border text-primary focus:ring-ring"
          />
          Low confidence
        </label>
      )}
    </div>
  );
}
