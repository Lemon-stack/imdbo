"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { UploadModal } from "./upload-modal";

export function UploadCard() {
  const [uploadOpen, setUploadOpen] = useState(false);

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-black">Add More Data</h3>
          <p className="text-sm text-gray-600">
            Upload product images to extract and save more data
          </p>
        </div>

        <Button
          onClick={() => setUploadOpen(true)}
          className="w-full gap-2"
        >
          <svg
            className="w-4 h-4"
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
          Upload Images
        </Button>

        <div className="text-xs text-gray-500 space-y-1 pt-2 border-t">
          <p>✓ Front & back images supported</p>
          <p>✓ Extracts 10 data fields</p>
          <p>✓ Instant processing</p>
        </div>
      </div>

      <UploadModal open={uploadOpen} onOpenChange={setUploadOpen} />
    </>
  );
}
