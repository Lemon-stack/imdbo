-- Migration: image hash columns + lookup index
-- Stores SHA-256 hashes of the raw image bytes so the API can detect when
-- the same image has been uploaded before and return the existing row
-- instead of creating a duplicate.

ALTER TABLE "submissions" ADD COLUMN "front_image_hash" varchar(64) NOT NULL DEFAULT '';--> statement-breakpoint
ALTER TABLE "submissions" ADD COLUMN "back_image_hash" varchar(64);--> statement-breakpoint

-- Non-unique index for fast lookup of "have I seen this image before?"
CREATE INDEX IF NOT EXISTS "submissions_front_hash_idx"
  ON "submissions" ("front_image_hash");
