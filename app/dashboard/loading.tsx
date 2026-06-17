import { SiteContainer } from "@/components/site-container";

export function SubmissionsTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-card border border-border rounded-lg px-4 py-3">
        <div className="flex items-center gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-1.5">
              <div className="h-3 w-16 bg-muted rounded animate-pulse" />
              <div className="h-4 w-12 bg-muted rounded animate-pulse" />
            </div>
          ))}
        </div>
        <div className="h-5 w-32 bg-muted rounded animate-pulse" />
      </div>

      <div className="flex justify-end">
        <div className="h-8 w-24 bg-muted rounded animate-pulse" />
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <div className="bg-muted/50 border-b border-border">
          <div className="grid grid-cols-11 gap-2 px-3 py-2.5">
            {Array.from({ length: 11 }).map((_, i) => (
              <div key={i} className="h-3 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </div>
        {Array.from({ length: 8 }).map((_, row) => (
          <div
            key={row}
            className="grid grid-cols-11 gap-2 px-3 py-3 border-b border-border last:border-0"
          >
            {Array.from({ length: 11 }).map((_, cell) => (
              <div
                key={cell}
                className="h-3 bg-muted rounded animate-pulse"
                style={{ width: `${60 + Math.random() * 40}%` }}
              />
            ))}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <div className="h-4 w-40 bg-muted rounded animate-pulse" />
        <div className="flex gap-2">
          <div className="h-8 w-20 bg-muted rounded animate-pulse" />
          <div className="h-8 w-20 bg-muted rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export default function DashboardLoading() {
  return (
    <main className="flex-1 py-8">
      <SiteContainer>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="h-8 w-40 bg-muted rounded animate-pulse" />
          </div>
          <SubmissionsTableSkeleton />
        </div>
      </SiteContainer>
    </main>
  );
}