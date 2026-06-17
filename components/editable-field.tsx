"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useUpdateSubmission } from "@/hooks/use-update-submission";
import type { SubmissionRow } from "@/hooks/use-submissions";
import type { FieldName } from "@/lib/utils/confidence";

interface EditableFieldProps {
  field: FieldName;
  value: string | null;
  row: SubmissionRow;
}

export function EditableField({ field, value, row }: EditableFieldProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value ?? "");
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const mutation = useUpdateSubmission();

  const isEdited = row.manuallyEdited?.[field] === true;

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const startEdit = () => {
    setDraft(value ?? "");
    setEditing(true);
  };

  const cancelEdit = () => {
    setEditing(false);
    setDraft(value ?? "");
  };

  const commit = (keepHistory: boolean) => {
    const trimmed = draft.trim();
    const newValue = trimmed === "" ? null : trimmed;
    if (newValue === value) {
      setEditing(false);
      setShowSaveDialog(false);
      return;
    }
    mutation.mutate(
      { id: row.id, field, value: newValue, keepHistory },
      {
        onSuccess: () => {
          setEditing(false);
          setShowSaveDialog(false);
        },
      }
    );
  };

  if (editing) {
    return (
      <div className="space-y-2">
        <input
          ref={inputRef}
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") cancelEdit();
            if (e.key === "Enter") setShowSaveDialog(true);
          }}
          className="w-full px-2 py-1 text-sm border border-border rounded bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
        {showSaveDialog ? (
          <div className="bg-muted border border-border rounded-lg p-3 space-y-3">
            <p className="text-xs text-foreground">
              Save this change how?
            </p>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>
                <span className="font-medium text-foreground">Overwrite</span> —
                replaces the value, marks field as confirmed.
              </p>
              <p>
                <span className="font-medium text-foreground">Keep history</span> —
                same, plus stores the edit so you can roll back later.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                size="xs"
                onClick={() => commit(false)}
                disabled={mutation.isPending}
              >
                Overwrite
              </Button>
              <Button
                size="xs"
                variant="outline"
                onClick={() => commit(true)}
                disabled={mutation.isPending}
              >
                Keep history
              </Button>
              <Button
                size="xs"
                variant="ghost"
                onClick={() => setShowSaveDialog(false)}
                disabled={mutation.isPending}
              >
                Back
              </Button>
            </div>
            {mutation.isError && (
              <p className="text-xs text-destructive">
                {mutation.error?.message}
              </p>
            )}
          </div>
        ) : (
          <div className="flex gap-2">
            <Button size="xs" onClick={() => setShowSaveDialog(true)}>
              Save
            </Button>
            <Button size="xs" variant="ghost" onClick={cancelEdit}>
              Cancel
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={startEdit}
      className="group flex items-center gap-1.5 text-left min-w-0 hover:bg-muted rounded px-1 py-0.5 -mx-1 -my-0.5 transition-colors"
      title="Click to edit"
    >
      <span className="text-sm font-medium text-foreground break-words">
        {value || <span className="text-muted-foreground/60">—</span>}
      </span>
      {isEdited && (
        <span
          className="text-[9px] font-medium text-blue-700 bg-blue-100 px-1 py-0.5 rounded shrink-0"
          title="Manually edited"
        >
          edited
        </span>
      )}
      <svg
        className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
        />
      </svg>
    </button>
  );
}