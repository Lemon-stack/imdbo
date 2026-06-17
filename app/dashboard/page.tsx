"use client";

import { useEffect } from "react";
import { useSubmissions } from "@/hooks/use-submissions";
import { SubmissionsTable } from "@/components/submissions-table";
import { useUpload } from "@/components/upload-provider";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const { data, isLoading, error, refetch, isFetching } = useSubmissions();
  const { openUpload } = useUpload();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("upload") !== "1") return;

    openUpload();
    window.history.replaceState(null, "", "/dashboard");
  }, [openUpload]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3">
        <div>
          <h1 className="text-3xl font-bold tracking-[-0.5px] text-foreground">Submissions</h1>
          {data && data.length > 0 && (
            <p className="text-sm text-muted-foreground mt-1">
              {data.length} {data.length === 1 ? "submission" : "submissions"}
            </p>
          )}
        </div>
        <Button
          onClick={openUpload}
          className="h-11 rounded-2xl border border-[#0042AB] px-5 text-sm font-semibold tracking-[-0.5px] text-white"
          style={{ backgroundImage: "var(--cta-gradient)" }}
        >
          Upload images
        </Button>
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
      ) : !data ? (
        <SubmissionsTable data={[]} />
      ) : (
        <SubmissionsTable data={data} />
      )}
    </div>
  );
}
