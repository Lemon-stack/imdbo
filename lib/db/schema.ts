import { pgTable, serial, text, jsonb, timestamp, varchar } from "drizzle-orm/pg-core";

export const submissions = pgTable("submissions", {
  id: serial("id").primaryKey(),
  userIp: varchar("user_ip", { length: 45 }).notNull(),
  barcode: text("barcode"),
  categoryType: text("category_type"),
  segmentType: text("segment_type"),
  manufacturer: text("manufacturer"),
  brand: text("brand"),
  productName: text("product_name"),
  weightUnit: text("weight_unit"),
  packagingType: text("packaging_type"),
  countryOfOrigin: text("country_of_origin"),
  promotionalMessage: text("promotional_message"),
  confidence: jsonb("confidence"),
  rawExtraction: jsonb("raw_extraction"),
  manuallyEdited: jsonb("manually_edited"),
  editHistory: jsonb("edit_history"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Submission = typeof submissions.$inferSelect;
export type NewSubmission = typeof submissions.$inferInsert;
