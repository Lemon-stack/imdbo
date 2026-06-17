import { SubmissionRow } from "@/hooks/use-submissions";

export function exportToCSV(data: SubmissionRow[], filename = "submissions.csv") {
  // Exact spec column order + names
  const headers = [
    "ITEM_NAME",
    "BARCODE",
    "MANUFACTURER",
    "BRAND",
    "WEIGHT",
    "PACKAGING TYPE",
    "COUNTRY",
    "VARIANT",
    "TYPE",
    "FRAGRANCE_FLAVOR",
    "PROMOTION",
    "ADDONS",
    "TAGLINE",
  ];

  const rows = data.map((row) => [
    row.itemName || "",
    row.barcode || "",
    row.manufacturer || "",
    row.brand || "",
    row.weight || "",
    row.packagingType || "",
    row.country || "",
    row.variant || "",
    row.type || "",
    row.fragranceFlavor || "",
    row.promotion || "",
    row.addons || "",
    row.tagline || "",
  ]);

  const csv = [headers, ...rows].map((row) =>
    row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
  );

  const blob = new Blob([csv.join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
