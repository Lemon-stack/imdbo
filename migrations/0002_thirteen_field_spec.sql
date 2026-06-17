-- Migration: 13-field spec + image storage
-- Replaces the old 10-field schema with the 13 required spec columns
-- and adds front/back image storage.

-- Drop old columns that are no longer in the spec
ALTER TABLE "submissions" DROP COLUMN IF EXISTS "category_type";--> statement-breakpoint
ALTER TABLE "submissions" DROP COLUMN IF EXISTS "segment_type";--> statement-breakpoint
ALTER TABLE "submissions" DROP COLUMN IF EXISTS "product_name";--> statement-breakpoint
ALTER TABLE "submissions" DROP COLUMN IF EXISTS "weight_unit";--> statement-breakpoint
ALTER TABLE "submissions" DROP COLUMN IF EXISTS "country_of_origin";--> statement-breakpoint
ALTER TABLE "submissions" DROP COLUMN IF EXISTS "promotional_message";--> statement-breakpoint

-- Rename old columns that map to spec fields
ALTER TABLE "submissions" RENAME COLUMN "barcode" TO "barcode";--> statement-breakpoint
ALTER TABLE "submissions" RENAME COLUMN "manufacturer" TO "manufacturer";--> statement-breakpoint
ALTER TABLE "submissions" RENAME COLUMN "brand" TO "brand";--> statement-breakpoint
ALTER TABLE "submissions" RENAME COLUMN "packaging_type" TO "packaging_type";--> statement-breakpoint

-- Add new spec columns
ALTER TABLE "submissions" ADD COLUMN "item_name" text;--> statement-breakpoint
ALTER TABLE "submissions" ADD COLUMN "weight" text;--> statement-breakpoint
ALTER TABLE "submissions" ADD COLUMN "country" text;--> statement-breakpoint
ALTER TABLE "submissions" ADD COLUMN "variant" text;--> statement-breakpoint
ALTER TABLE "submissions" ADD COLUMN "type" text;--> statement-breakpoint
ALTER TABLE "submissions" ADD COLUMN "fragrance_flavor" text;--> statement-breakpoint
ALTER TABLE "submissions" ADD COLUMN "promotion" text;--> statement-breakpoint
ALTER TABLE "submissions" ADD COLUMN "addons" text;--> statement-breakpoint
ALTER TABLE "submissions" ADD COLUMN "tagline" text;--> statement-breakpoint

-- Add image storage
ALTER TABLE "submissions" ADD COLUMN "front_image" text;--> statement-breakpoint
ALTER TABLE "submissions" ADD COLUMN "back_image" text;