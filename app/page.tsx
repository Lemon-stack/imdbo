"use client";

import { UploadForm } from "@/components/upload-form";
import { AppHeader } from "@/components/app-header";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <AppHeader />

      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="text-center space-y-12 max-w-2xl w-full">
          <div className="space-y-6">
            <div className="space-y-3">
              <h1 className="text-6xl font-bold text-black">
                Extract Product Data
              </h1>
              <p className="text-xl text-gray-600">
                Upload images of product packaging and automatically extract
                barcode, brand, weight, and 7 other IMDB fields
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
            <UploadForm />
          </div>

          <div className="grid grid-cols-3 gap-6 pt-8">
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-black">10</div>
              <p className="text-sm text-gray-600">Fields extracted</p>
            </div>
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-black">2</div>
              <p className="text-sm text-gray-600">Image angles supported</p>
            </div>
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-black">0</div>
              <p className="text-sm text-gray-600">Logins required</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
