import type { SubmissionRow } from "@/hooks/use-submissions";

export const EXTRACTED_FIELDS = [
  "barcode",
  "categoryType",
  "segmentType",
  "manufacturer",
  "brand",
  "productName",
  "weightUnit",
  "packagingType",
  "countryOfOrigin",
  "promotionalMessage",
] as const;

export type FieldName = (typeof EXTRACTED_FIELDS)[number];

export const FIELD_LABELS: Record<FieldName, string> = {
  barcode: "Barcode",
  categoryType: "Category",
  segmentType: "Segment",
  manufacturer: "Manufacturer",
  brand: "Brand",
  productName: "Product Name",
  weightUnit: "Weight",
  packagingType: "Packaging",
  countryOfOrigin: "Country of Origin",
  promotionalMessage: "Promotional Message",
};

export function averageConfidence(
  conf: SubmissionRow["confidence"]
): number | null {
  if (!conf || typeof conf !== "object") return null;
  const values = Object.values(conf).filter(
    (v): v is number => typeof v === "number" && !Number.isNaN(v)
  );
  if (values.length === 0) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export function fieldConfidence(
  conf: SubmissionRow["confidence"],
  field: FieldName
): number | null {
  if (!conf || typeof conf !== "object") return null;
  const v = conf[field];
  return typeof v === "number" && !Number.isNaN(v) ? v : null;
}

export function countExtracted(row: SubmissionRow): number {
  return EXTRACTED_FIELDS.reduce((acc, field) => {
    const val = row[field];
    return acc + (val != null && String(val).trim() !== "" ? 1 : 0);
  }, 0);
}

export function confidenceColor(score: number | null): {
  text: string;
  bg: string;
  dot: string;
} {
  if (score === null) {
    return { text: "text-gray-400", bg: "bg-gray-100", dot: "bg-gray-300" };
  }
  if (score >= 0.8) {
    return { text: "text-green-700", bg: "bg-green-100", dot: "bg-green-500" };
  }
  if (score >= 0.5) {
    return {
      text: "text-yellow-700",
      bg: "bg-yellow-100",
      dot: "bg-yellow-500",
    };
  }
  return { text: "text-red-700", bg: "bg-red-100", dot: "bg-red-500" };
}

export function confidencePct(score: number | null): string {
  if (score === null) return "—";
  return `${Math.round(score * 100)}%`;
}