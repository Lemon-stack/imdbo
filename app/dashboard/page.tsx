"use client";

import { useSubmissions } from "@/hooks/use-submissions";
import { SubmissionsTable } from "@/components/submissions-table";
import { InlineUploadCard } from "@/components/inline-upload-card";
import { AppHeader } from "@/components/app-header";

export default function Dashboard() {
  const { data, isLoading, error } = useSubmissions();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <AppHeader />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-600">Loading submissions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <AppHeader />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-red-600">Failed to load submissions</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AppHeader />

      <main className="flex-1 px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-black mb-8">Submissions</h1>

          {!data || data.length === 0 ? (
            <div className="text-center py-12 bg-white border rounded-lg border-gray-200">
              <p className="text-gray-600 mb-6">No submissions yet</p>
              <p className="text-sm text-gray-500">
                Upload your first product image to get started
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Sidebar - Inline Upload */}
              <div className="lg:col-span-1">
                <InlineUploadCard />
              </div>

              {/* Main - Table */}
              <div className="lg:col-span-2">
                <SubmissionsTable data={data} />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
