CREATE TYPE "public"."entry_theme_source" AS ENUM('USER', 'AI');--> statement-breakpoint
CREATE TYPE "public"."media_type" AS ENUM('BOOK', 'PODCAST', 'ARTICLE', 'MOVIE', 'SHOW', 'MUSIC', 'VIDEO', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."reading_entry_status" AS ENUM('DRAFT', 'COMPLETE');--> statement-breakpoint
CREATE TYPE "public"."recommendation_status" AS ENUM('SUGGESTED', 'SAVED', 'KNOWN', 'DISMISSED');--> statement-breakpoint
ALTER TYPE "public"."content_type" ADD VALUE 'READING_ENTRY';--> statement-breakpoint
CREATE TABLE "ai_reflections" (
	"entry_id" text PRIMARY KEY NOT NULL,
	"body_text" text NOT NULL,
	"model" text NOT NULL,
	"generated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "entry_themes" (
	"entry_id" text NOT NULL,
	"theme_id" text NOT NULL,
	"source" "entry_theme_source" DEFAULT 'AI' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "entry_themes_entry_id_theme_id_pk" PRIMARY KEY("entry_id","theme_id")
);
--> statement-breakpoint
CREATE TABLE "reading_entries" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"work_id" text NOT NULL,
	"title" text,
	"entry_date" date NOT NULL,
	"body_json" jsonb,
	"body_plain_text" text DEFAULT '' NOT NULL,
	"takeaways" text[] DEFAULT '{}' NOT NULL,
	"questions" text[] DEFAULT '{}' NOT NULL,
	"practical_application" text,
	"visibility" "visibility" DEFAULT 'PRIVATE' NOT NULL,
	"status" "reading_entry_status" DEFAULT 'DRAFT' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recommendations" (
	"id" text PRIMARY KEY NOT NULL,
	"entry_id" text NOT NULL,
	"title" text NOT NULL,
	"creator" text,
	"media_type" "media_type" DEFAULT 'OTHER' NOT NULL,
	"url" text,
	"why_it_connects" text NOT NULL,
	"length_note" text,
	"status" "recommendation_status" DEFAULT 'SUGGESTED' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "themes" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "themes_user_id_name_unique" UNIQUE("user_id","name")
);
--> statement-breakpoint
CREATE TABLE "works" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"creator" text,
	"media_type" "media_type" DEFAULT 'OTHER' NOT NULL,
	"url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ai_reflections" ADD CONSTRAINT "ai_reflections_entry_id_reading_entries_id_fk" FOREIGN KEY ("entry_id") REFERENCES "public"."reading_entries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entry_themes" ADD CONSTRAINT "entry_themes_entry_id_reading_entries_id_fk" FOREIGN KEY ("entry_id") REFERENCES "public"."reading_entries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entry_themes" ADD CONSTRAINT "entry_themes_theme_id_themes_id_fk" FOREIGN KEY ("theme_id") REFERENCES "public"."themes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reading_entries" ADD CONSTRAINT "reading_entries_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reading_entries" ADD CONSTRAINT "reading_entries_work_id_works_id_fk" FOREIGN KEY ("work_id") REFERENCES "public"."works"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_entry_id_reading_entries_id_fk" FOREIGN KEY ("entry_id") REFERENCES "public"."reading_entries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "themes" ADD CONSTRAINT "themes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "works" ADD CONSTRAINT "works_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;