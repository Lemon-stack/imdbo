"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { DashboardSidebar } from "@/components/dashboard-sidebar";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const sidebarWidth = sidebarCollapsed ? "72px" : "240px";

  return (
    <main className="min-h-screen p-3 sm:p-4">
      <div
        className="dashboard-shell min-h-[calc(100vh-2rem)] w-full"
        style={{
          display: "grid",
          gridTemplateColumns: `${sidebarWidth} minmax(0, 1fr)`,
          gap: "12px",
        }}
      >
        <DashboardSidebar
          collapsed={sidebarCollapsed}
          onToggleCollapsed={() => setSidebarCollapsed((value) => !value)}
        />
        <section className="min-w-0 rounded-2xl border border-border bg-background/90 p-3 backdrop-blur sm:p-5">
          {children}
        </section>
      </div>
    </main>
  );
}
