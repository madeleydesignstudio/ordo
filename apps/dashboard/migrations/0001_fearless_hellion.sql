ALTER TABLE "todos_table" RENAME TO "posts_table";--> statement-breakpoint
ALTER TABLE "posts_table" DROP CONSTRAINT "todos_table_user_id_users_table_id_fk";
--> statement-breakpoint
ALTER TABLE "posts_table" ADD COLUMN "content" text NOT NULL;--> statement-breakpoint
ALTER TABLE "users_table" ADD COLUMN "age" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "posts_table" ADD CONSTRAINT "posts_table_user_id_users_table_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users_table"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts_table" DROP COLUMN "description";--> statement-breakpoint
ALTER TABLE "posts_table" DROP COLUMN "completed";--> statement-breakpoint
ALTER TABLE "posts_table" DROP COLUMN "priority";--> statement-breakpoint
ALTER TABLE "posts_table" DROP COLUMN "due_date";