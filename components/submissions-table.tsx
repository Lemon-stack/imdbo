"use client";

import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
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
  | "manufacturer"
  | "brand"
  | "type"
  | "variant"
  | "weight"
  | "packagingType"
  | "country"
  | "fragranceFlavor"
  | "promotion"
  | "addons"
  | "tagline"
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

function SortHead({
  label,
  sortKey,
  current,
  dir,
  onClick,
}: {
  label: string;
  sortKey: SortKey;
  current: SortKey | null;
  dir: SortDir;
  onClick: (key: SortKey) => void;
}) {
  return (
    <TableHead>
      <button
        type="button"
        onClick={() => onClick(sortKey)}
        className="inline-flex items-center hover:text-foreground whitespace-nowrap"
      >
        {label} <SortIcon dir={current === sortKey ? dir : null} />
      </button>
    </TableHead>
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
          row.variant,
          row.country,
          row.fragranceFlavor,
          row.promotion,
          row.addons,
          row.tagline,
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

  const handleExportAll = useCallback(() => {
    exportToCSV(data, `submissions-${Date.now()}.csv`);
  }, [data]);

  useEffect(() => {
    const onSidebarExport = () => {
      handleExportAll();
    };

    window.addEventListener("dashboard-export-csv", onSidebarExport);
    return () => window.removeEventListener("dashboard-export-csv", onSidebarExport);
  }, [handleExportAll]);

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

  return (
    <div className="space-y-4">
      <ConfidenceSummary
        data={data}
        lowConfidenceOnly={lowConfidenceOnly}
        onToggleLowConfidence={setLowConfidenceOnly}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
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
            className="w-full pl-8 pr-3 py-2 text-sm bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExportAll}
          className="gap-2 rounded-2xl"
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

      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8 sticky left-0 bg-card z-10"></TableHead>
              <SortHead label="Item Name" sortKey="itemName" current={sortKey} dir={sortDir} onClick={toggleSort} />
              <SortHead label="Barcode" sortKey="barcode" current={sortKey} dir={sortDir} onClick={toggleSort} />
              <SortHead label="Manufacturer" sortKey="manufacturer" current={sortKey} dir={sortDir} onClick={toggleSort} />
              <SortHead label="Brand" sortKey="brand" current={sortKey} dir={sortDir} onClick={toggleSort} />
              <SortHead label="Type" sortKey="type" current={sortKey} dir={sortDir} onClick={toggleSort} />
              <SortHead label="Variant" sortKey="variant" current={sortKey} dir={sortDir} onClick={toggleSort} />
              <SortHead label="Weight" sortKey="weight" current={sortKey} dir={sortDir} onClick={toggleSort} />
              <SortHead label="Packaging" sortKey="packagingType" current={sortKey} dir={sortDir} onClick={toggleSort} />
              <SortHead label="Country" sortKey="country" current={sortKey} dir={sortDir} onClick={toggleSort} />
              <SortHead label="Fragrance" sortKey="fragranceFlavor" current={sortKey} dir={sortDir} onClick={toggleSort} />
              <SortHead label="Promotion" sortKey="promotion" current={sortKey} dir={sortDir} onClick={toggleSort} />
              <SortHead label="Addons" sortKey="addons" current={sortKey} dir={sortDir} onClick={toggleSort} />
              <SortHead label="Tagline" sortKey="tagline" current={sortKey} dir={sortDir} onClick={toggleSort} />
              <TableHead>Fields</TableHead>
              <SortHead label="Conf" sortKey="confidence" current={sortKey} dir={sortDir} onClick={toggleSort} />
              <SortHead label="Created" sortKey="createdAt" current={sortKey} dir={sortDir} onClick={toggleSort} />
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedItems.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={18}
                  className="text-center text-muted-foreground py-8"
                >
                  No submissions match this filter.
                </TableCell>
              </TableRow>
            ) : (
              paginatedItems.map((row) => {
                const isExpanded = expandedId === row.id;
                return (
                  <Fragment key={row.id}>
                    <TableRow
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
                      <TableCell className="w-8 sticky left-0 bg-card">
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
                      <TableCell className="max-w-[180px] truncate">
                        <ConfidentCell value={row.itemName} field="itemName" row={row} />
                      </TableCell>
                      <TableCell className="font-mono text-xs max-w-[120px] truncate">
                        <ConfidentCell value={row.barcode} field="barcode" row={row} />
                      </TableCell>
                      <TableCell className="max-w-[140px] truncate">
                        <ConfidentCell value={row.manufacturer} field="manufacturer" row={row} />
                      </TableCell>
                      <TableCell className="max-w-[120px] truncate">
                        <ConfidentCell value={row.brand} field="brand" row={row} />
                      </TableCell>
                      <TableCell className="max-w-[100px] truncate">
                        <ConfidentCell value={row.type} field="type" row={row} />
                      </TableCell>
                      <TableCell className="max-w-[100px] truncate">
                        <ConfidentCell value={row.variant} field="variant" row={row} />
                      </TableCell>
                      <TableCell className="max-w-[80px] truncate">
                        <ConfidentCell value={row.weight} field="weight" row={row} />
                      </TableCell>
                      <TableCell className="max-w-[100px] truncate">
                        <ConfidentCell value={row.packagingType} field="packagingType" row={row} />
                      </TableCell>
                      <TableCell className="max-w-[100px] truncate">
                        <ConfidentCell value={row.country} field="country" row={row} />
                      </TableCell>
                      <TableCell className="max-w-[100px] truncate">
                        <ConfidentCell value={row.fragranceFlavor} field="fragranceFlavor" row={row} />
                      </TableCell>
                      <TableCell className="max-w-[120px] truncate">
                        <ConfidentCell value={row.promotion} field="promotion" row={row} />
                      </TableCell>
                      <TableCell className="max-w-[100px] truncate">
                        <ConfidentCell value={row.addons} field="addons" row={row} />
                      </TableCell>
                      <TableCell className="max-w-[140px] truncate">
                        <ConfidentCell value={row.tagline} field="tagline" row={row} />
                      </TableCell>
                      <TableCell>
                        <FieldsChip count={countExtracted(row)} />
                      </TableCell>
                      <TableCell>
                        <ConfidenceBadge score={averageConfidence(row.confidence)} />
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(row.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                    {isExpanded && (
                      <TableRow key={`${row.id}-detail`}>
                        <TableCell colSpan={18} className="p-0">
                          <SubmissionDetail row={row} />
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
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
