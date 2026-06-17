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

type SortKey =
  | "itemName"
  | "barcode"
  | "brand"
  | "type"
  | "weight"
  | "country"
  | "createdAt"
  | "confidence";
type SortDir = "asc" | "desc";

function ConfidenceBadge({ score }: { score: number | null }) {
  if (score === null) {
    return <span className="text-muted-foreground text-xs">—</span>;
  }
  const pct = Math.round(score * 100);
  const colors = confidenceColor(score);
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}
    >
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
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${color}`}
    >
      {count}/{total}
    </span>
  );
}

function SortIcon({ dir }: { dir: SortDir | null }) {
  if (!dir) {
    return (
      <svg
        className="w-3 h-3 text-muted-foreground/40 inline-block ml-1"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
        />
      </svg>
    );
  }
  return (
    <svg
      className="w-3 h-3 text-foreground inline-block ml-1"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      {dir === "asc" ? (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 15l7-7 7 7"
        />
      ) : (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 9l-7 7-7-7"
        />
      )}
    </svg>
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
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const filteredData = useMemo(() => {
    let result = data;

    if (lowConfidenceOnly) {
      result = result.filter((row) => {
        const avg = averageConfidence(row.confidence);
        return avg !== null && avg < 0.5;
      });
    }

    const q = search.trim().toLowerCase();
    if (q) {
      result = result.filter((row) => {
        const haystack = [
          row.itemName,
          row.barcode,
          row.brand,
          row.manufacturer,
          row.type,
          row.country,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return haystack.includes(q);
      });
    }

    if (sortKey) {
      const dir = sortDir === "asc" ? 1 : -1;
      result = [...result].sort((a, b) => {
        let av: string | number;
        let bv: string | number;
        if (sortKey === "confidence") {
          av = averageConfidence(a.confidence) ?? -1;
          bv = averageConfidence(b.confidence) ?? -1;
        } else if (sortKey === "createdAt") {
          av = new Date(a.createdAt).getTime();
          bv = new Date(b.createdAt).getTime();
        } else {
          av = (a[sortKey] ?? "").toString().toLowerCase();
          bv = (b[sortKey] ?? "").toString().toLowerCase();
        }
        if (av < bv) return -1 * dir;
        if (av > bv) return 1 * dir;
        return 0;
      });
    }

    return result;
  }, [data, lowConfidenceOnly, search, sortKey, sortDir]);

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

  const toggleSort = (key: SortKey) => {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDir("asc");
    } else if (sortDir === "asc") {
      setSortDir("desc");
    } else {
      setSortKey(null);
      setSortDir("desc");
    }
  };

  const sortDirFor = (key: SortKey): SortDir | null =>
    sortKey === key ? sortDir : null;

  return (
    <div className="space-y-4">
      <ConfidenceSummary
        data={data}
        lowConfidenceOnly={lowConfidenceOnly}
        onToggleLowConfidence={setLowConfidenceOnly}
      />

      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-xs">
          <svg
            className="w-4 h-4 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search barcode, brand, product…"
            aria-label="Search submissions"
            className="w-full pl-8 pr-3 py-1.5 text-sm bg-card border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExportAll}
          className="gap-2"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          Export CSV
        </Button>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8"></TableHead>
              <TableHead>
                <button
                  type="button"
                  onClick={() => toggleSort("itemName")}
                  className="inline-flex items-center hover:text-foreground"
                >
                  Item Name <SortIcon dir={sortDirFor("itemName")} />
                </button>
              </TableHead>
              <TableHead>
                <button
                  type="button"
                  onClick={() => toggleSort("brand")}
                  className="inline-flex items-center hover:text-foreground"
                >
                  Brand <SortIcon dir={sortDirFor("brand")} />
                </button>
              </TableHead>
              <TableHead>
                <button
                  type="button"
                  onClick={() => toggleSort("barcode")}
                  className="inline-flex items-center hover:text-foreground"
                >
                  Barcode <SortIcon dir={sortDirFor("barcode")} />
                </button>
              </TableHead>
              <TableHead>
                <button
                  type="button"
                  onClick={() => toggleSort("type")}
                  className="inline-flex items-center hover:text-foreground"
                >
                  Type <SortIcon dir={sortDirFor("type")} />
                </button>
              </TableHead>
              <TableHead>
                <button
                  type="button"
                  onClick={() => toggleSort("weight")}
                  className="inline-flex items-center hover:text-foreground"
                >
                  Weight <SortIcon dir={sortDirFor("weight")} />
                </button>
              </TableHead>
              <TableHead>Packaging</TableHead>
              <TableHead>
                <button
                  type="button"
                  onClick={() => toggleSort("country")}
                  className="inline-flex items-center hover:text-foreground"
                >
                  Country <SortIcon dir={sortDirFor("country")} />
                </button>
              </TableHead>
              <TableHead>Fields</TableHead>
              <TableHead>
                <button
                  type="button"
                  onClick={() => toggleSort("confidence")}
                  className="inline-flex items-center hover:text-foreground"
                >
                  Confidence <SortIcon dir={sortDirFor("confidence")} />
                </button>
              </TableHead>
              <TableHead>
                <button
                  type="button"
                  onClick={() => toggleSort("createdAt")}
                  className="inline-flex items-center hover:text-foreground"
                >
                  Created <SortIcon dir={sortDirFor("createdAt")} />
                </button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedItems.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={11}
                  className="text-center text-muted-foreground py-8"
                >
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
                      className="cursor-pointer focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                      onClick={() => setExpandedId(isExpanded ? null : row.id)}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setExpandedId(isExpanded ? null : row.id);
                        }
                      }}
                      aria-expanded={isExpanded}
                    >
                      <TableCell className="w-8">
                        <svg
                          className={`w-4 h-4 text-muted-foreground transition-transform ${isExpanded ? "rotate-90" : ""}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        <ConfidentCell value={row.itemName} field="itemName" row={row} />
                      </TableCell>
                      <TableCell>
                        <ConfidentCell value={row.brand} field="brand" row={row} />
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        <ConfidentCell value={row.barcode} field="barcode" row={row} />
                      </TableCell>
                      <TableCell>
                        <ConfidentCell value={row.type} field="type" row={row} />
                      </TableCell>
                      <TableCell>
                        <ConfidentCell value={row.weight} field="weight" row={row} />
                      </TableCell>
                      <TableCell>
                        <ConfidentCell value={row.packagingType} field="packagingType" row={row} />
                      </TableCell>
                      <TableCell>
                        <ConfidentCell value={row.country} field="country" row={row} />
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
          Page {pageCount === 0 ? 0 : pageIndex + 1} of {pageCount} (
          {filteredData.length} shown, {data.length} total)
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
