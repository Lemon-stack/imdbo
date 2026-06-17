import { useMutation, useQueryClient } from "@tanstack/react-query";

interface ReextractPayload {
  id: number;
  front: File;
  back: File | null;
}

export function useReextractSubmission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: ReextractPayload) => {
      const formData = new FormData();
      formData.append("front", payload.front);
      if (payload.back) {
        formData.append("back", payload.back);
      }

      const res = await fetch(`/api/submissions/${payload.id}/reextract`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to re-extract");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["submissions"] });
    },
  });
}