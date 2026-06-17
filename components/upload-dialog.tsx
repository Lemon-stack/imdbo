"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { UploadFormContent } from "./upload-form-content";

interface UploadDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function UploadDialog({ open, onOpenChange }: UploadDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Upload Product Images</DialogTitle>
          <DialogDescription>
            Upload front and optionally back image to extract product data
          </DialogDescription>
        </DialogHeader>
        <UploadFormContent closeDialog={() => onOpenChange?.(false)} />
      </DialogContent>
    </Dialog>
  );
}
