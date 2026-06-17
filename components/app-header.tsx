"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useUpload } from "./upload-provider";
import { SiteContainer } from "./site-container";

export function AppHeader() {
  const pathname = usePathname();
  const { openUpload } = useUpload();

  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b border-border">
      <SiteContainer className="flex items-center justify-between h-14">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-lg font-bold text-foreground tracking-tight">
            Imdbo
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          {pathname !== "/" && (
            <Link
              href="/"
              className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition-colors"
            >
              Home
            </Link>
          )}
          {pathname !== "/dashboard" && (
            <Link
              href="/dashboard"
              className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition-colors"
            >
              Submissions
            </Link>
          )}
          <Button onClick={openUpload} className="gap-2" size="sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Upload
          </Button>
        </nav>
      </SiteContainer>
    </header>
  );
}
