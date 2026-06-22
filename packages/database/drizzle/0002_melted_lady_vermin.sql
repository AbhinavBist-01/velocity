ALTER TABLE "users" ADD COLUMN "role" varchar(20) DEFAULT 'creator' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "salt" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "password" text;