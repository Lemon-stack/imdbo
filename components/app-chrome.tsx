"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { SiteFooter } from "@/components/site-footer";

export function AppChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isDocs = pathname.startsWith("/docs");
  const isDashboard = pathname.startsWith("/dashboard");

  if (isDocs || isDashboard) {
    return <>{children}</>;
  }

  return (
    <>
      <AppHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </>
  );
}
