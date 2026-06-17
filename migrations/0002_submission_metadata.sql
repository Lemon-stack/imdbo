ALTER TABLE "submissions" ADD COLUMN IF NOT EXISTS "front_image" text;--> statement-breakpoint
ALTER TABLE "submissions" ADD COLUMN IF NOT EXISTS "back_image" text;--> statement-breakpoint
ALTER TABLE "submissions" ADD COLUMN IF NOT EXISTS "front_image_hash" varchar(64) NOT NULL DEFAULT '';--> statement-breakpoint
ALTER TABLE "submissions" ADD COLUMN IF NOT EXISTS "back_image_hash" varchar(64);--> statement-breakpoint
ALTER TABLE "submissions" ADD COLUMN IF NOT EXISTS "manually_edited" jsonb;--> statement-breakpoint
ALTER TABLE "submissions" ADD COLUMN IF NOT EXISTS "edit_history" jsonb;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "submissions_front_hash_idx" ON "submissions" ("front_image_hash");
