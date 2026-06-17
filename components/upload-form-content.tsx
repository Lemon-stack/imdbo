"use client";

import { useRef, useState } from "react";
import { useExtractImages } from "@/hooks/use-extract-images";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface UploadFormContentProps {
  closeDialog?: () => void;
}

export function UploadFormContent({ closeDialog }: UploadFormContentProps) {
  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);
  const [frontPreview, setFrontPreview] = useState<string | null>(null);
  const [backPreview, setBackPreview] = useState<string | null>(null);
  const mutation = useExtractImages();
  const router = useRouter();

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setSide: (preview: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setSide(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const frontFile = frontInputRef.current?.files?.[0];
    const backFile = backInputRef.current?.files?.[0];

    if (!frontFile) {
      alert("Front image required");
      return;
    }

    await mutation.mutateAsync({ front: frontFile, back: backFile || null });

    closeDialog?.();

    setTimeout(() => {
      if (!closeDialog) {
        router.push("/dashboard");
      }
    }, 500);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        {/* Front */}
        <div className="relative">
          <input
            ref={frontInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => handleFileChange(e, setFrontPreview)}
            className="hidden"
            id="front-input"
          />
          <label
            htmlFor="front-input"
            className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition"
          >
            {frontPreview ? (
              <img
                src={frontPreview}
                alt="Front preview"
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg
                  className="w-8 h-8 text-gray-400 mb-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <p className="text-xs text-gray-600 text-center">
                  Front
                  <br />
                  (required)
                </p>
              </div>
            )}
          </label>
        </div>

        {/* Back */}
        <div className="relative">
          <input
            ref={backInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => handleFileChange(e, setBackPreview)}
            className="hidden"
            id="back-input"
          />
          <label
            htmlFor="back-input"
            className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition"
          >
            {backPreview ? (
              <img
                src={backPreview}
                alt="Back preview"
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg
                  className="w-8 h-8 text-gray-400 mb-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <p className="text-xs text-gray-600 text-center">
                  Back
                  <br />
                  (optional)
                </p>
              </div>
            )}
          </label>
        </div>
      </div>

      <Button
        type="submit"
        disabled={!frontPreview || mutation.isPending}
        className="w-full"
      >
        {mutation.isPending ? "Processing..." : "Extract Data"}
      </Button>

      {mutation.isError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {mutation.error?.message}
        </div>
      )}
    </form>
  );
}
