CREATE TABLE IF NOT EXISTS "todos" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"number" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"user_id" text
);
