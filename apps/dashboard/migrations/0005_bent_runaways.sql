ALTER TABLE "todos" ALTER COLUMN "completed" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "todos" DROP COLUMN "created_at";--> statement-breakpoint
ALTER TABLE "todos" DROP COLUMN "updated_at";