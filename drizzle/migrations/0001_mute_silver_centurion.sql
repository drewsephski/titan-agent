CREATE TYPE "public"."certification_badge" AS ENUM('none', 'bronze', 'silver', 'gold');--> statement-breakpoint
CREATE TYPE "public"."certification_status" AS ENUM('pending', 'testing', 'certified', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."complexity" AS ENUM('beginner', 'intermediate', 'advanced');--> statement-breakpoint
CREATE TYPE "public"."pricing_model" AS ENUM('one_time', 'subscription');--> statement-breakpoint
CREATE TYPE "public"."purchase_status" AS ENUM('active', 'refunded', 'disputed');--> statement-breakpoint
CREATE TYPE "public"."template_category" AS ENUM('support', 'sales', 'marketing', 'operations', 'development');--> statement-breakpoint
CREATE TYPE "public"."template_status" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('buyer', 'creator', 'admin');--> statement-breakpoint
CREATE TABLE "certification_tests" (
	"id" text PRIMARY KEY NOT NULL,
	"template_id" text NOT NULL,
	"test_cases" jsonb DEFAULT '[]' NOT NULL,
	"test_results" jsonb DEFAULT '[]' NOT NULL,
	"overall_status" "certification_status" DEFAULT 'pending' NOT NULL,
	"security_scan_results" jsonb,
	"performance_metrics" jsonb,
	"reviewed_by" text,
	"review_notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "purchases" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"template_id" text NOT NULL,
	"price_paid" integer NOT NULL,
	"stripe_payment_intent_id" text,
	"license_key" text NOT NULL,
	"status" "purchase_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "purchases_license_key_unique" UNIQUE("license_key")
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"template_id" text NOT NULL,
	"purchase_id" text NOT NULL,
	"rating" integer NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"verified_purchase" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "templates" (
	"id" text PRIMARY KEY NOT NULL,
	"creator_id" text NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"description" text NOT NULL,
	"category" "template_category" NOT NULL,
	"tags" text[] DEFAULT '{}' NOT NULL,
	"price" integer DEFAULT 0 NOT NULL,
	"pricing_model" "pricing_model" DEFAULT 'one_time' NOT NULL,
	"workflow_json" jsonb NOT NULL,
	"documentation" text DEFAULT '' NOT NULL,
	"preview_images" text[] DEFAULT '{}' NOT NULL,
	"integrations" text[] DEFAULT '{}' NOT NULL,
	"complexity" "complexity" DEFAULT 'beginner' NOT NULL,
	"certification_status" "certification_status" DEFAULT 'pending' NOT NULL,
	"certification_badge" "certification_badge" DEFAULT 'none' NOT NULL,
	"certification_notes" text,
	"rating" integer DEFAULT 0 NOT NULL,
	"review_count" integer DEFAULT 0 NOT NULL,
	"purchase_count" integer DEFAULT 0 NOT NULL,
	"status" "template_status" DEFAULT 'draft' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "templates_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "role" "user_role" DEFAULT 'buyer' NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "stripe_customer_id" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "stripe_connect_id" text;--> statement-breakpoint
ALTER TABLE "certification_tests" ADD CONSTRAINT "certification_tests_template_id_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."templates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "certification_tests" ADD CONSTRAINT "certification_tests_reviewed_by_user_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_template_id_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."templates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_template_id_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."templates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_purchase_id_purchases_id_fk" FOREIGN KEY ("purchase_id") REFERENCES "public"."purchases"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "templates" ADD CONSTRAINT "templates_creator_id_user_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;