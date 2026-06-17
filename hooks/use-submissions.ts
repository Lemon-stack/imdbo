import { useQuery } from "@tanstack/react-query";

export interface SubmissionRow {
  id: number;
  userIp: string;
  itemName: string | null;
  barcode: string | null;
  manufacturer: string | null;
  brand: string | null;
  weight: string | null;
  packagingType: string | null;
  country: string | null;
  variant: string | null;
  type: string | null;
  fragranceFlavor: string | null;
  promotion: string | null;
  addons: string | null;
  tagline: string | null;
  confidence: Record<string, number> | null;
  rawExtraction: Record<string, any> | null;
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
    refetchInterval: 5000,
  });
}
