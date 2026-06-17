import { useQuery } from "@tanstack/react-query";

export interface EditHistoryEntry {
  field: string;
  from: string | null;
  to: string | null;
  at: string;
  ip: string;
}

export interface SubmissionRow {
  id: number;
  userIp: string;
  barcode: string | null;
  categoryType: string | null;
  segmentType: string | null;
  manufacturer: string | null;
  brand: string | null;
  productName: string | null;
  weightUnit: string | null;
  packagingType: string | null;
  countryOfOrigin: string | null;
  promotionalMessage: string | null;
  confidence: Record<string, number> | null;
  rawExtraction: Record<string, unknown> | null;
  manuallyEdited: Record<string, boolean> | null;
  editHistory: EditHistoryEntry[] | null;
  createdAt: string;
}

export function useSubmissions() {
  return useQuery<SubmissionRow[]>({
    queryKey: ["submissions"],
    queryFn: async () => {
      const res = await fetch("/api/submissions");
      if (!res.ok) {
        throw new Error("Failed to fetch submissions");
      }
      return res.json();
    },
  });
}
