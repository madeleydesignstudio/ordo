ALTER TABLE "todos" ADD COLUMN "content" text NOT NULL;--> statement-breakpoint
ALTER TABLE "todos" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "todos" DROP COLUMN "title";