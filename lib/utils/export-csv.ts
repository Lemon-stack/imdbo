import { SubmissionRow } from "@/hooks/use-submissions";

export function exportToCSV(data: SubmissionRow[], filename = "submissions.csv") {
  const headers = [
    "ID",
    "Barcode",
    "Brand",
    "Product Name",
    "Category Type",
    "Segment Type",
    "Manufacturer",
    "Weight Unit",
    "Packaging Type",
    "Country of Origin",
    "Promotional Message",
    "Created At",
  ];

  const rows = data.map((row) => [
    row.id,
    row.barcode || "",
    row.brand || "",
    row.productName || "",
    row.categoryType || "",
    row.segmentType || "",
    row.manufacturer || "",
    row.weightUnit || "",
    row.packagingType || "",
    row.countryOfOrigin || "",
    row.promotionalMessage || "",
    new Date(row.createdAt).toISOString(),
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
