"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { UploadModal } from "@/components/upload-modal";

interface UploadContextValue {
  openUpload: () => void;
  closeUpload: () => void;
}

const UploadContext = createContext<UploadContextValue | null>(null);

export function useUpload() {
  const ctx = useContext(UploadContext);
  if (!ctx) throw new Error("useUpload must be used within UploadProvider");
  return ctx;
}

export function UploadProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <UploadContext.Provider
      value={{ openUpload: () => setOpen(true), closeUpload: () => setOpen(false) }}
    >
      {children}
      <UploadModal open={open} onOpenChange={setOpen} />
    </UploadContext.Provider>
  );
}