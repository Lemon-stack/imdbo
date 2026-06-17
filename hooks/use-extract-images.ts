import { useMutation, useQueryClient } from "@tanstack/react-query";

interface ExtractPayload {
  front: File;
  back: File | null;
}

export function useExtractImages() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: ExtractPayload) => {
      const formData = new FormData();
      formData.append("front", payload.front);
      if (payload.back) {
        formData.append("back", payload.back);
      }

      const res = await fetch("/api/submissions", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to extract");
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["submissions"] });
    },
  });
}
