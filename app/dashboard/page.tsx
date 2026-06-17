"use client";

import { useSubmissions } from "@/hooks/use-submissions";
import { SubmissionsTable } from "@/components/submissions-table";
import { SiteContainer } from "@/components/site-container";
import { useUpload } from "@/components/upload-provider";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const { data, isLoading, error, refetch, isFetching } = useSubmissions();
  const { openUpload } = useUpload();

  return (
    <main className="flex-1 py-8">
      <SiteContainer>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Submissions</h1>
              {data && data.length > 0 && (
                <p className="text-sm text-muted-foreground mt-1">
                  {data.length} {data.length === 1 ? "submission" : "submissions"}
                </p>
              )}
            </div>
            {data && data.length > 0 && (
              <Button onClick={openUpload} className="gap-2" size="sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Upload
              </Button>
            )}
          </div>

          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">Loading submissions…</div>
          ) : error ? (
            <div className="text-center py-12 bg-card border border-border rounded-lg space-y-3">
              <p className="text-destructive">Failed to load submissions</p>
              <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
                {isFetching ? "Retrying…" : "Retry"}
              </Button>
            </div>
          ) : !data || data.length === 0 ? (
            <div className="text-center py-16 bg-card border border-border rounded-lg space-y-4">
              <div className="w-12 h-12 mx-auto rounded-full bg-muted flex items-center justify-center">
                <svg className="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </div>
              <p className="text-foreground font-medium">No submissions yet</p>
              <p className="text-sm text-muted-foreground">Upload your first product image to get started.</p>
              <Button onClick={openUpload} className="gap-2 mt-2">
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
      </SiteContainer>
    </main>
  );
}
