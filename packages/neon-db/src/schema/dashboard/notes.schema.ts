import { relations } from "drizzle-orm";
import { 
  pgTable, 
  text, 
  timestamp, 
  boolean, 
  jsonb, 
  integer,
  uuid,
  index,
  uniqueIndex
} from "drizzle-orm/pg-core";
import { user } from "./auth.schema";

// Folders for organizing notes
export const folder = pgTable("folder", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  color: text("color").default("#6366f1"), // Default indigo color
  parentFolderId: uuid("parent_folder_id"), // For nested folders
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  userIdIdx: index("folder_user_id_idx").on(table.userId),
  parentFolderIdIdx: index("folder_parent_folder_id_idx").on(table.parentFolderId),
  nameUserIdx: uniqueIndex("folder_name_user_idx").on(table.name, table.userId),
}));

// Self-referencing relation for nested folders
export const folderRelations = relations(folder, ({ one, many }) => ({
  user: one(user, {
    fields: [folder.userId],
    references: [user.id],
  }),
  parentFolder: one(folder, {
    fields: [folder.parentFolderId],
    references: [folder.id],
    relationName: "parentFolder",
  }),
  childFolders: many(folder, {
    relationName: "parentFolder",
  }),
  notes: many(note),
}));

// Tags for labeling and categorizing notes
export const tag = pgTable("tag", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  color: text("color").default("#10b981"), // Default emerald color
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  userIdIdx: index("tag_user_id_idx").on(table.userId),
  nameUserIdx: uniqueIndex("tag_name_user_idx").on(table.name, table.userId),
}));

export const tagRelations = relations(tag, ({ one, many }) => ({
  user: one(user, {
    fields: [tag.userId],
    references: [user.id],
  }),
  noteTags: many(noteTag),
}));

// Main notes table
export const note = pgTable("note", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  content: jsonb("content").$type<any>().notNull(), // Tiptap JSON content
  htmlContent: text("html_content"), // HTML representation for search/display
  plainTextContent: text("plain_text_content"), // Plain text for full-text search
  
  // Metadata
  isPublic: boolean("is_public").notNull().default(false),
  isPinned: boolean("is_pinned").notNull().default(false),
  isFavorite: boolean("is_favorite").notNull().default(false),
  isArchived: boolean("is_archived").notNull().default(false),
  
  // Organization
  folderId: uuid("folder_id").references(() => folder.id, { onDelete: "set null" }),
  
  // Ownership
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  
  // Timestamps
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  lastViewedAt: timestamp("last_viewed_at"),
  
  // Version control
  version: integer("version").notNull().default(1),
}, (table) => ({
  userIdIdx: index("note_user_id_idx").on(table.userId),
  folderIdIdx: index("note_folder_id_idx").on(table.folderId),
  createdAtIdx: index("note_created_at_idx").on(table.createdAt),
  updatedAtIdx: index("note_updated_at_idx").on(table.updatedAt),
  isPinnedIdx: index("note_is_pinned_idx").on(table.isPinned),
  isFavoriteIdx: index("note_is_favorite_idx").on(table.isFavorite),
  isArchivedIdx: index("note_is_archived_idx").on(table.isArchived),
  // Full-text search index on plain text content
  plainTextContentIdx: index("note_plain_text_content_idx").using("gin", table.plainTextContent),
}));

export const noteRelations = relations(note, ({ one, many }) => ({
  user: one(user, {
    fields: [note.userId],
    references: [user.id],
  }),
  folder: one(folder, {
    fields: [note.folderId],
    references: [folder.id],
  }),
  noteTags: many(noteTag),
  noteVersions: many(noteVersion),
  noteAttachments: many(noteAttachment),
}));

// Junction table for many-to-many relationship between notes and tags
export const noteTag = pgTable("note_tag", {
  id: uuid("id").primaryKey().defaultRandom(),
  noteId: uuid("note_id")
    .notNull()
    .references(() => note.id, { onDelete: "cascade" }),
  tagId: uuid("tag_id")
    .notNull()
    .references(() => tag.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  noteIdIdx: index("note_tag_note_id_idx").on(table.noteId),
  tagIdIdx: index("note_tag_tag_id_idx").on(table.tagId),
  noteTagIdx: uniqueIndex("note_tag_note_tag_idx").on(table.noteId, table.tagId),
}));

export const noteTagRelations = relations(noteTag, ({ one }) => ({
  note: one(note, {
    fields: [noteTag.noteId],
    references: [note.id],
  }),
  tag: one(tag, {
    fields: [noteTag.tagId],
    references: [tag.id],
  }),
}));

// Version history for notes
export const noteVersion = pgTable("note_version", {
  id: uuid("id").primaryKey().defaultRandom(),
  noteId: uuid("note_id")
    .notNull()
    .references(() => note.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  content: jsonb("content").$type<any>().notNull(),
  htmlContent: text("html_content"),
  version: integer("version").notNull(),
  changeDescription: text("change_description"), // Optional description of changes
  createdAt: timestamp("created_at").notNull().defaultNow(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
}, (table) => ({
  noteIdIdx: index("note_version_note_id_idx").on(table.noteId),
  versionIdx: index("note_version_version_idx").on(table.version),
  createdAtIdx: index("note_version_created_at_idx").on(table.createdAt),
  noteVersionIdx: uniqueIndex("note_version_note_version_idx").on(table.noteId, table.version),
}));

export const noteVersionRelations = relations(noteVersion, ({ one }) => ({
  note: one(note, {
    fields: [noteVersion.noteId],
    references: [note.id],
  }),
  user: one(user, {
    fields: [noteVersion.userId],
    references: [user.id],
  }),
}));

// Attachments stored in R2 bucket
export const noteAttachment = pgTable("note_attachment", {
  id: uuid("id").primaryKey().defaultRandom(),
  noteId: uuid("note_id")
    .notNull()
    .references(() => note.id, { onDelete: "cascade" }),
  
  // File metadata
  fileName: text("file_name").notNull(),
  originalFileName: text("original_file_name").notNull(),
  mimeType: text("mime_type").notNull(),
  fileSize: integer("file_size").notNull(), // Size in bytes
  
  // R2 storage info
  r2Key: text("r2_key").notNull(), // Key in R2 bucket
  r2Bucket: text("r2_bucket").notNull().default("ordo-attachments"),
  publicUrl: text("public_url"), // Public URL if file is public
  
  // Metadata
  isImage: boolean("is_image").notNull().default(false),
  width: integer("width"), // For images
  height: integer("height"), // For images
  alt: text("alt"), // Alt text for images
  
  // Organization
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  noteIdIdx: index("note_attachment_note_id_idx").on(table.noteId),
  userIdIdx: index("note_attachment_user_id_idx").on(table.userId),
  r2KeyIdx: uniqueIndex("note_attachment_r2_key_idx").on(table.r2Key),
  mimeTypeIdx: index("note_attachment_mime_type_idx").on(table.mimeType),
  isImageIdx: index("note_attachment_is_image_idx").on(table.isImage),
}));

export const noteAttachmentRelations = relations(noteAttachment, ({ one }) => ({
  note: one(note, {
    fields: [noteAttachment.noteId],
    references: [note.id],
  }),
  user: one(user, {
    fields: [noteAttachment.userId],
    references: [user.id],
  }),
}));