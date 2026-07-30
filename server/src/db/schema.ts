import { pgTable, text, timestamp, uuid, varchar, jsonb } from 'drizzle-orm/pg-core';

/**
 * Certificates table — the ONLY persistent table.
 * 
 * Stores the absolute minimum required for QR verification to work.
 * No Excel data, no template data, no job history.
 * See Section 10: Data Minimization.
 */
export const certificates = pgTable('certificates', {
  // Internal primary key
  id: uuid('id').defaultRandom().primaryKey(),
  
  // Short ID used in verification URLs (e.g. /verify/a1b2c3d4e5f6)
  certificateId: varchar('certificate_id', { length: 16 }).unique().notNull(),
  
  // The primary field bound to QR verification (e.g. "Name" → "John Doe")
  boundColumnName: varchar('bound_column_name', { length: 255 }).notNull(),
  boundColumnValue: text('bound_column_value').notNull(),
  
  // Optional additional fields the user chose to display on the verify page
  // Stored as JSONB: { "Course": "React Masterclass", "Date": "2024-01-15" }
  extraDisplayFields: jsonb('extra_display_fields').default('{}'),
  
  // Reference to which template was used (name only, not stored file)
  templateName: varchar('template_name', { length: 255 }),
  
  // Timestamp
  generatedAt: timestamp('generated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Type exports for use throughout the app
export type Certificate = typeof certificates.$inferSelect;
export type NewCertificate = typeof certificates.$inferInsert;
