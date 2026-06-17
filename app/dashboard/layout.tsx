import type { ReactNode } from "react";
import { DashboardSidebar } from "@/components/dashboard-sidebar";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen p-3 sm:p-4">
      <div
        className="dashboard-shell mx-auto min-h-[calc(100vh-2rem)] w-full max-w-[1600px]"
        style={{
          display: "grid",
          gridTemplateColumns: "240px minmax(0, 1fr)",
          gap: "12px",
        }}
      >
        <DashboardSidebar />
        <section className="min-w-0 rounded-2xl border border-border bg-background/90 p-3 backdrop-blur sm:p-5">
          {children}
        </section>
      </div>
    </main>
  );
}
