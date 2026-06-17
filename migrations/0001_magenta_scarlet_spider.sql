ALTER TABLE "submissions" ADD COLUMN "manually_edited" jsonb;--> statement-breakpoint
ALTER TABLE "submissions" ADD COLUMN "edit_history" jsonb;