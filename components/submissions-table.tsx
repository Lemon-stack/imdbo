"use client";

import { useMemo, useState } from "react";
import { SubmissionRow } from "@/hooks/use-submissions";
import { usePagination } from "@/hooks/use-pagination";
import { exportToCSV } from "@/lib/utils/export-csv";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { SubmissionDetail } from "./submission-detail";
import { ConfidenceSummary } from "./confidence-summary";
import {
  averageConfidence,
  countExtracted,
  confidenceColor,
  fieldConfidence,
  EXTRACTED_FIELDS,
  type FieldName,
} from "@/lib/utils/confidence";

interface SubmissionsTableProps {
  data: SubmissionRow[];
}

function ConfidenceBadge({ score }: { score: number | null }) {
  if (score === null) {
    return <span className="text-muted-foreground text-xs">—</span>;
  }
  const pct = Math.round(score * 100);
  const colors = confidenceColor(score);
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}>
      {pct}%
    </span>
  );
}

function FieldsChip({ count }: { count: number }) {
  const total = EXTRACTED_FIELDS.length;
  const color =
    count >= 9
      ? "bg-green-100 text-green-700"
      : count >= 5
      ? "bg-blue-100 text-blue-700"
      : "bg-gray-100 text-gray-600";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${color}`}>
      {count}/{total}
    </span>
  );
}

function ConfidentCell({
  value,
  field,
  row,
}: {
  value: string | null;
  field: FieldName;
  row: SubmissionRow;
}) {
  const hasValue = value != null && String(value).trim() !== "";
  if (!hasValue) return <span className="text-muted-foreground/60">—</span>;
  const score = fieldConfidence(row.confidence, field);
  const colors = confidenceColor(score);
  return <span className={colors.text}>{value}</span>;
}

export function SubmissionsTable({ data }: SubmissionsTableProps) {
  const [lowConfidenceOnly, setLowConfidenceOnly] = useState(false);

  const filteredData = useMemo(() => {
    if (!lowConfidenceOnly) return data;
    return data.filter((row) => {
      const avg = averageConfidence(row.confidence);
      return avg !== null && avg < 0.5;
    });
  }, [data, lowConfidenceOnly]);

  const {
    paginatedItems,
    pageIndex,
    setPageIndex,
    pageCount,
    canPreviousPage,
    canNextPage,
  } = usePagination(filteredData);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const handleExportAll = () => {
    exportToCSV(data, `submissions-${Date.now()}.csv`);
  };

  return (
    <div className="space-y-4">
      <ConfidenceSummary
        data={data}
        lowConfidenceOnly={lowConfidenceOnly}
        onToggleLowConfidence={setLowConfidenceOnly}
      />

      <div className="flex items-center justify-end">
        <Button variant="outline" size="sm" onClick={handleExportAll} className="gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export CSV
        </Button>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8"></TableHead>
              <TableHead>Barcode</TableHead>
              <TableHead>Brand</TableHead>
              <TableHead>Product Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Weight</TableHead>
              <TableHead>Packaging</TableHead>
              <TableHead>Country</TableHead>
              <TableHead>Fields</TableHead>
              <TableHead>Confidence</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} className="text-center text-muted-foreground py-8">
                  No submissions match this filter.
                </TableCell>
              </TableRow>
            ) : (
              paginatedItems.map((row) => {
                const isExpanded = expandedId === row.id;
                return (
                  <>
                    <TableRow
                      key={row.id}
                      className="cursor-pointer"
                      onClick={() => setExpandedId(isExpanded ? null : row.id)}
                    >
                      <TableCell className="w-8">
                        <svg
                          className={`w-4 h-4 text-muted-foreground transition-transform ${isExpanded ? "rotate-90" : ""}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        <ConfidentCell value={row.barcode} field="barcode" row={row} />
                      </TableCell>
                      <TableCell>
                        <ConfidentCell value={row.brand} field="brand" row={row} />
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        <ConfidentCell value={row.productName} field="productName" row={row} />
                      </TableCell>
                      <TableCell>
                        <ConfidentCell value={row.categoryType} field="categoryType" row={row} />
                      </TableCell>
                      <TableCell>
                        <ConfidentCell value={row.weightUnit} field="weightUnit" row={row} />
                      </TableCell>
                      <TableCell>
                        <ConfidentCell value={row.packagingType} field="packagingType" row={row} />
                      </TableCell>
                      <TableCell>
                        <ConfidentCell value={row.countryOfOrigin} field="countryOfOrigin" row={row} />
                      </TableCell>
                      <TableCell>
                        <FieldsChip count={countExtracted(row)} />
                      </TableCell>
                      <TableCell>
                        <ConfidenceBadge score={averageConfidence(row.confidence)} />
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(row.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                    {isExpanded && (
                      <TableRow key={`${row.id}-detail`}>
                        <TableCell colSpan={11} className="p-0">
                          <SubmissionDetail row={row} />
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Page {pageCount === 0 ? 0 : pageIndex + 1} of {pageCount} ({filteredData.length} shown, {data.length} total)
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPageIndex((p) => Math.max(0, p - 1))}
            disabled={!canPreviousPage}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPageIndex((p) => p + 1)}
            disabled={!canNextPage}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
