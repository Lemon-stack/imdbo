"use client";

import Link from "next/link";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/toast-provider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

function IconButton({
  children,
  label,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-sidebar-border bg-sidebar text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
    >
      {children}
    </button>
  );
}

export function DashboardSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const clearSubmissions = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/submissions", { method: "DELETE" });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to clear submissions");
      }
      return (await res.json()) as { ok: boolean; deleted: number };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["submissions"] });
      setConfirmOpen(false);
      toast({
        title: "Submissions cleared",
        description: `${result.deleted} ${result.deleted === 1 ? "row" : "rows"} deleted.`,
        tone: "success",
      });
    },
    onError: (error) => {
      toast({
        title: "Clear failed",
        description: error instanceof Error ? error.message : "Could not clear submissions.",
        tone: "error",
      });
    },
  });

  const exportCsv = () => {
    window.dispatchEvent(new CustomEvent("dashboard-export-csv"));
  };

  const clearAll = () => {
    setConfirmOpen(true);
  };

  const linkClass =
    "flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold tracking-[-0.5px] text-sidebar-foreground/75 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground";
  const activeClass =
    "flex items-center gap-2 rounded-full bg-sidebar-accent px-3 py-2 text-sm font-semibold tracking-[-0.5px] text-sidebar-accent-foreground";
  const iconClass = "h-4 w-4 shrink-0";
  const dangerClass =
    "flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold tracking-[-0.5px] text-red-600 transition-colors hover:bg-red-500/10 hover:text-red-700 disabled:pointer-events-none disabled:opacity-60";

  return (
    <>
      <aside
        data-collapsed={collapsed}
        className={`flex shrink-0 flex-col overflow-hidden rounded-2xl border border-sidebar-border bg-sidebar p-3 text-sidebar-foreground shadow-[rgba(255,255,255,0.75)_-4px_-4px_6px_inset,rgba(255,255,255,0.75)_4px_4px_6px_inset] transition-[width] duration-200 md:min-h-[calc(100vh-2rem)] ${
          collapsed ? "w-full md:w-[72px]" : "w-full md:w-64"
        }`}
      >
        <div className="mb-5 flex items-center justify-between gap-2">
          {!collapsed && (
            <Link href="/" className="flex min-w-0 items-center gap-2 px-2 py-1">
              <span className="truncate font-serif text-2xl tracking-normal text-sidebar-foreground">Imdbo</span>
            </Link>
          )}
          <IconButton
            label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            onClick={() => setCollapsed((value) => !value)}
          >
            <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={collapsed ? "M13 5l7 7-7 7M5 5l7 7-7 7" : "M11 19l-7-7 7-7M19 19l-7-7 7-7"}
              />
            </svg>
          </IconButton>
        </div>

        <nav className="grid grid-cols-2 gap-1 md:block md:space-y-1">
          <Link href="/dashboard" className={activeClass} title="Submissions">
            <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7h16M4 12h16M4 17h16" />
            </svg>
            {!collapsed && <span>Submissions</span>}
          </Link>
          <button type="button" onClick={exportCsv} className={linkClass} title="Export CSV">
            <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-1m-4-4-4 4m0 0-4-4m4 4V4" />
            </svg>
            {!collapsed && <span>Export CSV</span>}
          </button>
          <button
            type="button"
            onClick={clearAll}
            disabled={clearSubmissions.isPending}
            className={dangerClass}
            title="Clear all submissions"
          >
            <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 7h12m-9 0V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m2 0-.7 12.1A2 2 0 0 1 14.3 21H9.7a2 2 0 0 1-2-1.9L7 7m3 4v6m4-6v6" />
            </svg>
            {!collapsed && <span>{clearSubmissions.isPending ? "Clearing..." : "Clear all"}</span>}
          </button>
          <Link href="/docs/setup" target="_blank" rel="noreferrer" className={linkClass} title="Setup docs">
            <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.5A3.5 3.5 0 0 0 8.5 10H6a6 6 0 0 1 12 0c0 2.5-1.5 3.7-3.1 4.8-1.2.8-1.9 1.4-1.9 2.7h-2.5c0-2.5 1.4-3.6 3-4.7 1.3-.9 2-1.5 2-2.8A3.5 3.5 0 0 0 12 6.5ZM10.75 20h2.5v-2.5h-2.5V20Z" />
            </svg>
            {!collapsed && <span>Setup docs</span>}
          </Link>
          <Link href="/" className={linkClass} title="Back to site">
            <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0 7-7m-7 7h18" />
            </svg>
            {!collapsed && <span>Back to site</span>}
          </Link>
        </nav>
      </aside>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent showCloseButton={!clearSubmissions.isPending}>
          <DialogHeader>
            <DialogTitle>Clear all submissions?</DialogTitle>
            <DialogDescription>
              This deletes every submission in this dashboard for the current browser/IP. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setConfirmOpen(false)}
              disabled={clearSubmissions.isPending}
            >
              No
            </Button>
            <Button
              type="button"
              onClick={() => clearSubmissions.mutate()}
              disabled={clearSubmissions.isPending}
              className="border border-red-600 bg-red-600 text-white hover:bg-red-700"
            >
              {clearSubmissions.isPending ? "Clearing..." : "Yes, clear"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
