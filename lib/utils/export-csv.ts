import { SubmissionRow } from "@/hooks/use-submissions";

export function exportToCSV(data: SubmissionRow[], filename = "submissions.csv") {
  const headers = [
    "ID",
    "Item Name",
    "Barcode",
    "Manufacturer",
    "Brand",
    "Weight",
    "Packaging Type",
    "Country",
    "Variant",
    "Type",
    "Fragrance/Flavor",
    "Promotion",
    "Add-ons",
    "Tagline",
    "Created At",
  ];

  const rows = data.map((row) => [
    row.id,
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
