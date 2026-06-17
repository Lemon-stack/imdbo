"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { UploadFormContent } from "./upload-form-content";
import { useMediaQuery } from "@/hooks/use-media-query";

interface UploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UploadModal({ open, onOpenChange }: UploadModalProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  // Avoid hydration mismatch: render nothing until the client has hydrated.
  // Using a lazy initializer (not an effect) so we don't trigger set-state-in-effect.
  const [hydrated] = useState(() => typeof window !== "undefined");

  if (!hydrated) return null;

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Upload Product Images</DialogTitle>
            <DialogDescription>
              Upload front and optionally back image to extract product data
            </DialogDescription>
          </DialogHeader>
          <UploadFormContent closeDialog={() => onOpenChange(false)} />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Upload Product Images</DrawerTitle>
          <DrawerDescription>
            Upload front and optionally back image
          </DrawerDescription>
        </DrawerHeader>
        <div className="px-4 pb-8">
          <UploadFormContent closeDialog={() => onOpenChange(false)} />
        </div>
      </DrawerContent>
    </Drawer>
  );
}
