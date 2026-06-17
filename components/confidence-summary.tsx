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
    <div className="flex flex-wrap items-center justify-between gap-4 bg-card border border-border rounded-lg px-4 py-3">
      <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-3 lg:w-auto lg:gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="min-w-0 rounded-lg border border-border/70 bg-background/50 px-3 py-2 sm:border-0 sm:bg-transparent sm:p-0">
            <span className="text-xs text-muted-foreground">{stat.label}</span>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-semibold text-foreground">
                {stat.value}
              </span>
              {stat.sub && (
                <span className="text-xs text-destructive">{stat.sub}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {lowConfidenceCount > 0 && (
        <label className="flex w-full cursor-pointer select-none items-center gap-2 text-sm text-foreground lg:w-auto">
          <input
            type="checkbox"
            checked={lowConfidenceOnly}
            onChange={(e) => onToggleLowConfidence(e.target.checked)}
            className="w-4 h-4 rounded border-border text-primary focus:ring-ring"
          />
          Low confidence only
          <span className="text-xs text-muted-foreground">(&lt;50%)</span>
        </label>
      )}
    </div>
  );
}
