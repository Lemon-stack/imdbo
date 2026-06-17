CREATE TABLE "submissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_ip" varchar(45) NOT NULL,
	"barcode" text,
	"category_type" text,
	"segment_type" text,
	"manufacturer" text,
	"brand" text,
	"product_name" text,
	"weight_unit" text,
	"packaging_type" text,
	"country_of_origin" text,
	"promotional_message" text,
	"confidence" jsonb,
	"raw_extraction" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
