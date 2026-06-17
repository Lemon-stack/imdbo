"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UploadModal } from "./upload-modal";

export function AppHeader() {
  const [uploadOpen, setUploadOpen] = useState(false);
  const pathname =
    typeof window !== "undefined" ? window.location.pathname : "/";

  return (
    <>
      <header className="py-4">
        <div className="mx-auto border rounded-full max-w-2xl p-1 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 px-4">
            <h1 className="text-xl font-bold text-black hidden sm:block">
              IMDB0
            </h1>
          </Link>

          {pathname == "/" && (
            <Button onClick={() => setUploadOpen(true)} className="gap-2">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Upload
            </Button>
          )}
        </div>
      </header>

      <UploadModal open={uploadOpen} onOpenChange={setUploadOpen} />
    </>
  );
}
