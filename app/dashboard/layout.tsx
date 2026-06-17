import type { ReactNode } from "react";
import { DashboardSidebar } from "@/components/dashboard-sidebar";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen p-3 sm:p-4">
      <div className="flex min-h-[calc(100vh-2rem)] flex-col gap-3 md:flex-row">
        <DashboardSidebar />
        <section className="min-w-0 flex-1 rounded-2xl border border-border bg-background/80 p-3 backdrop-blur sm:p-5">
          {children}
        </section>
      </div>
    </main>
  );
}
