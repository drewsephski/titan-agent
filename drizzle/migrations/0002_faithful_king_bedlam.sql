ALTER TABLE "user" ADD COLUMN "email_notifications" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "notify_purchases" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "notify_certification" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "notify_reviews" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "notify_marketing" boolean DEFAULT false NOT NULL;