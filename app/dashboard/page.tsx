"use client";

import { useState } from "react";
import { useSubmissions } from "@/hooks/use-submissions";
import { SubmissionsTable } from "@/components/submissions-table";
import { AppHeader } from "@/components/app-header";
import { UploadModal } from "@/components/upload-modal";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const { data, isLoading, error, refetch, isFetching } = useSubmissions();
  const [uploadOpen, setUploadOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AppHeader />

      <main className="flex-1 px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-black">Submissions</h1>
            {data && data.length > 0 && (
              <Button onClick={() => setUploadOpen(true)} className="gap-2" size="sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Upload
              </Button>
            )}
          </div>

          {isLoading ? (
            <div className="text-center py-12 text-gray-600">Loading submissions…</div>
          ) : error ? (
            <div className="text-center py-12 bg-white border rounded-lg border-gray-200 space-y-3">
              <p className="text-red-600">Failed to load submissions</p>
              <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
                {isFetching ? "Retrying…" : "Retry"}
              </Button>
            </div>
          ) : !data || data.length === 0 ? (
            <div className="text-center py-16 bg-white border rounded-lg border-gray-200 space-y-4">
              <div className="w-12 h-12 mx-auto rounded-full bg-gray-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </div>
              <p className="text-gray-700 font-medium">No submissions yet</p>
              <p className="text-sm text-gray-500">Upload your first product image to get started.</p>
              <Button onClick={() => setUploadOpen(true)} className="gap-2 mt-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Upload your first image
              </Button>
            </div>
          ) : (
            <SubmissionsTable data={data} />
          )}
        </div>
      </main>

      <UploadModal open={uploadOpen} onOpenChange={setUploadOpen} />
    </div>
  );
}
