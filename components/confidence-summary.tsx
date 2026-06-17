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
    <div className="flex flex-wrap items-center justify-between gap-4 bg-white border border-gray-200 rounded-lg px-4 py-3">
      <div className="flex items-center gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="flex flex-col">
            <span className="text-xs text-gray-500">{stat.label}</span>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-semibold text-black">
                {stat.value}
              </span>
              {stat.sub && (
                <span className="text-xs text-red-600">{stat.sub}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {lowConfidenceCount > 0 && (
        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={lowConfidenceOnly}
            onChange={(e) => onToggleLowConfidence(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
          />
          Low confidence only
          <span className="text-xs text-gray-400">(&lt;50%)</span>
        </label>
      )}
    </div>
  );
}