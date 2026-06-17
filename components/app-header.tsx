"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { UploadModal } from "./upload-modal";

export function AppHeader() {
  const [uploadOpen, setUploadOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <header className="py-4">
        <div className="mx-auto border rounded-full max-w-2xl p-1 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 px-4">
            <h1 className="text-xl font-bold text-black">Imdbo</h1>
          </Link>

          <nav className="flex items-center gap-1">
            {pathname !== "/" && (
              <Link
                href="/"
                className="px-3 py-1.5 text-sm text-gray-600 hover:text-black rounded-full hover:bg-gray-100"
              >
                Home
              </Link>
            )}
            {pathname !== "/dashboard" && (
              <Link
                href="/dashboard"
                className="px-3 py-1.5 text-sm text-gray-600 hover:text-black rounded-full hover:bg-gray-100"
              >
                Submissions
              </Link>
            )}
            <Button onClick={() => setUploadOpen(true)} className="gap-2" size="sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Upload
            </Button>
          </nav>
        </div>
      </header>

      <UploadModal open={uploadOpen} onOpenChange={setUploadOpen} />
    </>
  );
}
