import { pgTable, serial, text, jsonb, timestamp, varchar, index } from "drizzle-orm/pg-core";

export const submissions = pgTable(
  "submissions",
  {
  id: serial("id").primaryKey(),
  userIp: varchar("user_ip", { length: 45 }).notNull(),
  // The 13 spec fields
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
  // Source images (base64 data URLs) so users can verify against the original
  frontImage: text("front_image"),
  backImage: text("back_image"),
  // SHA-256 hashes of the raw image bytes — stored for traceability so the
  // UI can show "you've uploaded this image before". Recursive uploads of
  // the same image each create their own row so the user can compare
  // extraction results across runs.
  frontImageHash: varchar("front_image_hash", { length: 64 }).notNull(),
  backImageHash: varchar("back_image_hash", { length: 64 }),
  // Meta
  confidence: jsonb("confidence"),
  rawExtraction: jsonb("raw_extraction"),
  manuallyEdited: jsonb("manually_edited"),
  editHistory: jsonb("edit_history"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    // Non-unique index for fast lookup of "have I seen this image before?"
    frontHashIdx: index("submissions_front_hash_idx").on(table.frontImageHash),
  })
);

export type Submission = typeof submissions.$inferSelect;
export type NewSubmission = typeof submissions.$inferInsert;
