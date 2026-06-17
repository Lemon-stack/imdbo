"use client";

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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SubmissionsTableProps {
  data: SubmissionRow[];
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

  const handleExportAll = () => {
    exportToCSV(data, `submissions-${Date.now()}.csv`);
  };

  const handleExportCurrent = () => {
    exportToCSV(paginatedItems, `submissions-page-${pageIndex + 1}.csv`);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item Name</TableHead>
              <TableHead>Barcode</TableHead>
              <TableHead>Brand</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Weight</TableHead>
              <TableHead>Packaging</TableHead>
              <TableHead>Country</TableHead>
              <TableHead>Variant</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedItems.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="max-w-xs truncate">
                  {row.itemName || "—"}
                </TableCell>
                <TableCell className="font-mono text-xs">
                  {row.barcode || "—"}
                </TableCell>
                <TableCell>{row.brand || "—"}</TableCell>
                <TableCell>{row.type || "—"}</TableCell>
                <TableCell>{row.weight || "—"}</TableCell>
                <TableCell>{row.packagingType || "—"}</TableCell>
                <TableCell>{row.country || "—"}</TableCell>
                <TableCell className="text-sm text-gray-600">
                  {row.variant || "—"}
                </TableCell>
                <TableCell className="text-xs text-gray-600">
                  {new Date(row.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <svg
                          className="h-4 w-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <circle cx="12" cy="5" r="1" />
                          <circle cx="12" cy="12" r="1" />
                          <circle cx="12" cy="19" r="1" />
                        </svg>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={handleExportCurrent}>
                        Export this page
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleExportAll}>
                        Export all
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
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
