"use client";

import { useState } from "react";
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
import {
  averageConfidence,
  countExtracted,
  confidenceColor,
  EXTRACTED_FIELDS,
} from "@/lib/utils/confidence";

interface SubmissionsTableProps {
  data: SubmissionRow[];
}

function ConfidenceBadge({ score }: { score: number | null }) {
  if (score === null) {
    return <span className="text-gray-400 text-xs">—</span>;
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

export function SubmissionsTable({ data }: SubmissionsTableProps) {
  const {
    paginatedItems,
    pageIndex,
    setPageIndex,
    pageCount,
    canPreviousPage,
    canNextPage,
  } = usePagination(data);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const handleExportAll = () => {
    exportToCSV(data, `submissions-${Date.now()}.csv`);
  };

  return (
    <div className="space-y-4">
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
            {paginatedItems.map((row) => {
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
                        className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? "rotate-90" : ""}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{row.barcode || "—"}</TableCell>
                    <TableCell>{row.brand || "—"}</TableCell>
                    <TableCell className="max-w-xs truncate">{row.productName || "—"}</TableCell>
                    <TableCell>{row.categoryType || "—"}</TableCell>
                    <TableCell>{row.weightUnit || "—"}</TableCell>
                    <TableCell>{row.packagingType || "—"}</TableCell>
                    <TableCell>{row.countryOfOrigin || "—"}</TableCell>
                    <TableCell>
                      <FieldsChip count={countExtracted(row)} />
                    </TableCell>
                    <TableCell>
                      <ConfidenceBadge score={averageConfidence(row.confidence)} />
                    </TableCell>
                    <TableCell className="text-xs text-gray-600">
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
            })}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Page {pageIndex + 1} of {pageCount} ({data.length} total)
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
