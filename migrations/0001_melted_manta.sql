ALTER TABLE "submissions" ADD COLUMN "item_name" text;--> statement-breakpoint
ALTER TABLE "submissions" ADD COLUMN "weight" text;--> statement-breakpoint
ALTER TABLE "submissions" ADD COLUMN "country" text;--> statement-breakpoint
ALTER TABLE "submissions" ADD COLUMN "variant" text;--> statement-breakpoint
ALTER TABLE "submissions" ADD COLUMN "type" text;--> statement-breakpoint
ALTER TABLE "submissions" ADD COLUMN "fragrance_flavor" text;--> statement-breakpoint
ALTER TABLE "submissions" ADD COLUMN "promotion" text;--> statement-breakpoint
ALTER TABLE "submissions" ADD COLUMN "addons" text;--> statement-breakpoint
ALTER TABLE "submissions" ADD COLUMN "tagline" text;--> statement-breakpoint
ALTER TABLE "submissions" DROP COLUMN "category_type";--> statement-breakpoint
ALTER TABLE "submissions" DROP COLUMN "segment_type";--> statement-breakpoint
ALTER TABLE "submissions" DROP COLUMN "product_name";--> statement-breakpoint
ALTER TABLE "submissions" DROP COLUMN "weight_unit";--> statement-breakpoint
ALTER TABLE "submissions" DROP COLUMN "country_of_origin";--> statement-breakpoint
ALTER TABLE "submissions" DROP COLUMN "promotional_message";