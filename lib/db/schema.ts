import { pgTable, serial, text, jsonb, timestamp, varchar } from "drizzle-orm/pg-core";

export const submissions = pgTable("submissions", {
  id: serial("id").primaryKey(),
  userIp: varchar("user_ip", { length: 45 }).notNull(),
  itemName: text("item_name"),
  barcode: text("barcode"),
  manufacturer: text("manufacturer"),
  brand: text("brand"),
  weight: text("weight"),
  packagingType: text("packaging_type"),
  country: text("country"),
  variant: text("variant"),
  type: text("type"),
  fragranceFlavor: text("fragrance_flavor"),
  promotion: text("promotion"),
  addons: text("addons"),
  tagline: text("tagline"),
  confidence: jsonb("confidence"),
  rawExtraction: jsonb("raw_extraction"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Submission = typeof submissions.$inferSelect;
export type NewSubmission = typeof submissions.$inferInsert;
