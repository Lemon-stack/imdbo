"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useReextractSubmission } from "@/hooks/use-reextract";
import type { SubmissionRow } from "@/hooks/use-submissions";

interface ReextractButtonProps {
  row: SubmissionRow;
}

function Spinner({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
      <path
        d="M22 12a10 10 0 0 1-10 10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        className="animate-spin"
        style={{ transformOrigin: "center" }}
      />
    </svg>
  );
}

export function ReextractButton({ row }: ReextractButtonProps) {
  const [showWarning, setShowWarning] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [frontPreview, setFrontPreview] = useState<string | null>(null);
  const [backPreview, setBackPreview] = useState<string | null>(null);
  const frontRef = useRef<HTMLInputElement>(null);
  const backRef = useRef<HTMLInputElement>(null);
  const mutation = useReextractSubmission();

  const editedCount = row.manuallyEdited
    ? Object.values(row.manuallyEdited).filter(Boolean).length
    : 0;

  const reset = () => {
    setShowWarning(false);
    setShowPicker(false);
    setFrontPreview(null);
    setBackPreview(null);
    if (frontRef.current) frontRef.current.value = "";
    if (backRef.current) backRef.current.value = "";
  };

  const loadPreview = (file: File, setSide: (s: string) => void) => {
    const reader = new FileReader();
    reader.onload = (e) => setSide(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleReextract = async () => {
    const frontFile = frontRef.current?.files?.[0];
    const backFile = backRef.current?.files?.[0] ?? null;
    if (!frontFile) return;

    try {
      await mutation.mutateAsync({ id: row.id, front: frontFile, back: backFile });
      reset();
    } catch {
      // error shown via mutation.error
    }
  };

  if (mutation.isPending) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Spinner className="w-4 h-4" />
        Re-extracting…
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowWarning(true)}
        className="gap-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0H15m-11 0a8.003 8.003 0 007.919 6" />
        </svg>
        Re-extract
      </Button>

      {showWarning && !showPicker && (
        <div className="bg-muted border border-border rounded-lg p-4 space-y-3">
          <p className="text-sm font-medium text-foreground">Re-extract data?</p>
          <p className="text-xs text-muted-foreground">
            This re-runs AI extraction on new images. Estimated cost:{" "}
            <span className="font-medium text-foreground">~$0.02</span> (GPT-4o vision).
          </p>
          {editedCount > 0 && (
            <p className="text-xs text-foreground bg-blue-50 border border-blue-200 rounded px-2 py-1.5">
              ⚠️ {editedCount} manually-edited {editedCount === 1 ? "field" : "fields"} will be preserved.
            </p>
          )}
          <div className="flex gap-2">
            <Button size="xs" onClick={() => setShowPicker(true)}>
              Continue
            </Button>
            <Button size="xs" variant="ghost" onClick={reset}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {showPicker && (
        <div className="bg-muted border border-border rounded-lg p-4 space-y-3">
          <p className="text-sm font-medium text-foreground">Upload new images</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="relative">
              <input
                ref={frontRef}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) loadPreview(f, setFrontPreview);
                }}
                className="hidden"
                id="reextract-front"
              />
              <label
                htmlFor="reextract-front"
                className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/60"
              >
                {frontPreview ? (
                  <img src={frontPreview} alt="Front" className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <span className="text-xs text-muted-foreground">Front (required)</span>
                )}
              </label>
            </div>
            <div className="relative">
              <input
                ref={backRef}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) loadPreview(f, setBackPreview);
                }}
                className="hidden"
                id="reextract-back"
              />
              <label
                htmlFor="reextract-back"
                className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/60"
              >
                {backPreview ? (
                  <img src={backPreview} alt="Back" className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <span className="text-xs text-muted-foreground">Back (optional)</span>
                )}
              </label>
            </div>
          </div>
          {mutation.isError && (
            <p className="text-xs text-destructive">{mutation.error?.message}</p>
          )}
          <div className="flex gap-2">
            <Button size="xs" onClick={handleReextract} disabled={!frontPreview}>
              Re-extract
            </Button>
            <Button size="xs" variant="ghost" onClick={reset}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}