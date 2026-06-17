"use client";

import { useRef, useState } from "react";
import { useExtractImages } from "@/hooks/use-extract-images";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface UploadFormContentProps {
  closeDialog?: () => void;
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

function UploadSlot({
  id,
  label,
  hint,
  preview,
  inputRef,
  onFileChange,
  onClear,
  isDragging,
  onDragEnter,
  onDragOver,
  onDragLeave,
  onDrop,
}: {
  id: string;
  label: string;
  hint: string;
  preview: string | null;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
  isDragging: boolean;
  onDragEnter: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
}) {
  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={onFileChange}
        className="hidden"
        id={id}
      />
      <label
        htmlFor={id}
        onDragEnter={onDragEnter}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer transition ${
          isDragging ? "border-primary bg-primary/5" : "border-border hover:bg-muted"
        }`}
      >
        {preview ? (
          <img src={preview} alt={`${label} preview`} className="w-full h-full object-cover rounded-lg" />
        ) : (
          <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4 text-center">
            <svg className="w-8 h-8 text-muted-foreground mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            <p className="text-xs font-medium text-foreground">{label}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{hint}</p>
            <p className="text-[10px] text-muted-foreground/70 mt-1">Click or drag a file</p>
          </div>
        )}
      </label>

      {preview && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            onClear();
          }}
          className="absolute top-2 right-2 bg-foreground/70 hover:bg-foreground text-background rounded-full w-6 h-6 flex items-center justify-center text-xs"
          aria-label={`Remove ${label} image`}
        >
          ×
        </button>
      )}
    </div>
  );
}

export function UploadFormContent({ closeDialog }: UploadFormContentProps) {
  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);
  const [frontPreview, setFrontPreview] = useState<string | null>(null);
  const [backPreview, setBackPreview] = useState<string | null>(null);
  const [frontDragging, setFrontDragging] = useState(false);
  const [backDragging, setBackDragging] = useState(false);
  const [inlineError, setInlineError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const mutation = useExtractImages();
  const router = useRouter();

  const validateFile = (file: File): string | null => {
    if (!file.type.startsWith("image/")) return "Please upload an image file.";
    if (file.size > 15 * 1024 * 1024) return "Image must be under 15MB.";
    return null;
  };

  const loadPreview = (file: File, setSide: (preview: string) => void) => {
    const reader = new FileReader();
    reader.onload = (event) => setSide(event.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setSide: (preview: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setInlineError(null);
    const err = validateFile(file);
    if (err) {
      setInlineError(err);
      return;
    }
    loadPreview(file, setSide);
  };

  const handleDrop = (
    e: React.DragEvent,
    inputRef: React.RefObject<HTMLInputElement | null>,
    setSide: (preview: string) => void
  ) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    setInlineError(null);
    const err = validateFile(file);
    if (err) {
      setInlineError(err);
      return;
    }
    const dt = new DataTransfer();
    dt.items.add(file);
    if (inputRef.current) {
      inputRef.current.files = dt.files;
    }
    loadPreview(file, setSide);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const frontFile = frontInputRef.current?.files?.[0];
    const backFile = backInputRef.current?.files?.[0];

    if (!frontFile) {
      setInlineError("Front image is required.");
      return;
    }

    setInlineError(null);
    try {
      await mutation.mutateAsync({ front: frontFile, back: backFile || null });
      setSuccess(true);
      setTimeout(() => {
        closeDialog?.();
        if (!closeDialog) {
          router.push("/dashboard");
        }
      }, 900);
    } catch {
      // error surfaced via mutation.error below
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-base font-semibold text-foreground">Data extracted</p>
        <p className="text-sm text-muted-foreground">Redirecting to your submissions…</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <UploadSlot
          id="front-input"
          label="Front"
          hint="(required)"
          preview={frontPreview}
          inputRef={frontInputRef}
          onFileChange={(e) => handleFileChange(e, setFrontPreview)}
          onClear={() => {
            setFrontPreview(null);
            if (frontInputRef.current) frontInputRef.current.value = "";
          }}
          isDragging={frontDragging}
          onDragEnter={() => setFrontDragging(true)}
          onDragOver={(e) => e.preventDefault()}
          onDragLeave={() => setFrontDragging(false)}
          onDrop={(e) => {
            setFrontDragging(false);
            handleDrop(e, frontInputRef, setFrontPreview);
          }}
        />
        <UploadSlot
          id="back-input"
          label="Back"
          hint="(optional)"
          preview={backPreview}
          inputRef={backInputRef}
          onFileChange={(e) => handleFileChange(e, setBackPreview)}
          onClear={() => {
            setBackPreview(null);
            if (backInputRef.current) backInputRef.current.value = "";
          }}
          isDragging={backDragging}
          onDragEnter={() => setBackDragging(true)}
          onDragOver={(e) => e.preventDefault()}
          onDragLeave={() => setBackDragging(false)}
          onDrop={(e) => {
            setBackDragging(false);
            handleDrop(e, backInputRef, setBackPreview);
          }}
        />
      </div>

      {inlineError && (
        <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-sm">
          {inlineError}
        </div>
      )}

      {mutation.isError && !inlineError && (
        <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-sm">
          {mutation.error?.message || "Extraction failed. Please try again."}
        </div>
      )}

      <Button type="submit" disabled={!frontPreview || mutation.isPending} className="w-full gap-2">
        {mutation.isPending && <Spinner className="w-4 h-4" />}
        {mutation.isPending ? "Extracting data…" : "Extract Data"}
      </Button>
      {mutation.isPending && (
        <p className="text-xs text-center text-muted-foreground">This usually takes 5–15 seconds.</p>
      )}
    </form>
  );
}
