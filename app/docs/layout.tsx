import { source } from "@/lib/source";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import Link from "next/link";
import type { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="docs-shell min-h-screen bg-background">
      <Link
        href="/"
        aria-label="Back to site"
        target="_blank"
        rel="noreferrer"
        className="fixed right-4 top-4 z-50 inline-flex h-10 items-center justify-center rounded-full border border-border bg-background px-4 text-sm font-semibold tracking-[-0.5px] text-foreground shadow-[0_10px_30px_rgba(0,34,89,0.12)] transition-colors hover:bg-muted"
      >
        Back
      </Link>
      <DocsLayout
        tree={source.getPageTree()}
        nav={{ enabled: false }}
      >
        {children}
      </DocsLayout>
    </div>
  );
}
