"use client";

import { UploadFormContent } from "./upload-form-content";

export function InlineUploadCard() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-8">
      <div className="space-y-4">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-black">Add More Data</h3>
          <p className="text-sm text-gray-600">
            Upload product images to extract data
          </p>
        </div>

        <UploadFormContent />

        <div className="text-xs text-gray-500 space-y-1 pt-2 border-t">
          <p>✓ Front & back images supported</p>
          <p>✓ Extracts 10 data fields</p>
          <p>✓ Instant processing</p>
        </div>
      </div>
    </div>
  );
}
