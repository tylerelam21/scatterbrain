CREATE TYPE "public"."content_type" AS ENUM('BRAIN_ITEM', 'JOURNAL_ENTRY', 'PROJECT', 'PHOTO', 'CALENDAR_EVENT');--> statement-breakpoint
CREATE TYPE "public"."visibility" AS ENUM('PRIVATE', 'UNLISTED', 'PUBLIC');--> statement-breakpoint
CREATE TYPE "public"."brain_item_type" AS ENUM('THOUGHT', 'IDEA', 'QUESTION', 'QUOTE', 'PLACE', 'RECOMMENDATION', 'PROJECT_IDEA', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."calendar_connection_status" AS ENUM('CONNECTED', 'EXPIRED', 'ERROR', 'DISCONNECTED');--> statement-breakpoint
CREATE TYPE "public"."journal_status" AS ENUM('DRAFT', 'COMPLETE', 'ARCHIVED');--> statement-breakpoint
CREATE TYPE "public"."relationship_type" AS ENUM('EXPANDED_FROM', 'RELATED_TO', 'REFERENCES');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('OWNER');--> statement-breakpoint
CREATE TYPE "public"."project_status" AS ENUM('LIVE', 'IN_PROGRESS', 'EXPERIMENT', 'ARCHIVED');--> statement-breakpoint
CREATE TABLE "brain_item_tags" (
	"brain_item_id" text NOT NULL,
	"tag_id" text NOT NULL,
	CONSTRAINT "brain_item_tags_brain_item_id_tag_id_pk" PRIMARY KEY("brain_item_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "brain_items" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"title" text,
	"content" text NOT NULL,
	"type" "brain_item_type" DEFAULT 'THOUGHT' NOT NULL,
	"visibility" "visibility" DEFAULT 'PRIVATE' NOT NULL,
	"pinned" boolean DEFAULT false NOT NULL,
	"archived" boolean DEFAULT false NOT NULL,
	"source_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "calendar_connections" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"provider" text DEFAULT 'google' NOT NULL,
	"provider_account_id" text NOT NULL,
	"email" text NOT NULL,
	"encrypted_access_token" text,
	"encrypted_refresh_token" text,
	"expires_at" timestamp with time zone,
	"scopes" text[] DEFAULT '{}' NOT NULL,
	"sync_token" text,
	"last_synced_at" timestamp with time zone,
	"status" "calendar_connection_status" DEFAULT 'CONNECTED' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "calendar_events" (
	"id" text PRIMARY KEY NOT NULL,
	"calendar_id" text NOT NULL,
	"provider_event_id" text NOT NULL,
	"recurring_event_id" text,
	"title" text NOT NULL,
	"description" text,
	"location" text,
	"start" timestamp with time zone NOT NULL,
	"end" timestamp with time zone NOT NULL,
	"all_day" boolean DEFAULT false NOT NULL,
	"status" text DEFAULT 'confirmed' NOT NULL,
	"organizer" text,
	"attendees_json" jsonb,
	"html_link" text,
	"etag" text,
	"provider_updated_at" timestamp with time zone,
	"last_synced_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "calendar_events_calendar_id_provider_event_id_unique" UNIQUE("calendar_id","provider_event_id")
);
--> statement-breakpoint
CREATE TABLE "calendars" (
	"id" text PRIMARY KEY NOT NULL,
	"connection_id" text NOT NULL,
	"provider_calendar_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"provider_color" text,
	"custom_color" text,
	"time_zone" text,
	"access_role" text NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "journal_entries" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"title" text,
	"content_json" jsonb,
	"plain_text" text DEFAULT '' NOT NULL,
	"journal_date" date NOT NULL,
	"visibility" "visibility" DEFAULT 'PRIVATE' NOT NULL,
	"status" "journal_status" DEFAULT 'DRAFT' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "journal_entry_tags" (
	"journal_entry_id" text NOT NULL,
	"tag_id" text NOT NULL,
	CONSTRAINT "journal_entry_tags_journal_entry_id_tag_id_pk" PRIMARY KEY("journal_entry_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "photo_collection_items" (
	"id" text PRIMARY KEY NOT NULL,
	"collection_id" text NOT NULL,
	"photo_id" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "photo_collections" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"cover_photo_id" text,
	"visibility" "visibility" DEFAULT 'PRIVATE' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "photo_collections_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "photos" (
	"id" text PRIMARY KEY NOT NULL,
	"storage_key" text NOT NULL,
	"thumbnail_key" text,
	"original_filename" text,
	"width" integer NOT NULL,
	"height" integer NOT NULL,
	"title" text,
	"caption" text,
	"alt_text" text,
	"date_taken" timestamp with time zone,
	"location_label" text,
	"camera" text,
	"lens" text,
	"visibility" "visibility" DEFAULT 'PRIVATE' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "content_relationships" (
	"id" text PRIMARY KEY NOT NULL,
	"source_type" "content_type" NOT NULL,
	"source_id" text NOT NULL,
	"target_type" "content_type" NOT NULL,
	"target_id" text NOT NULL,
	"relationship_type" "relationship_type" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "search_documents" (
	"content_type" "content_type" NOT NULL,
	"content_id" text NOT NULL,
	"title" text,
	"body" text DEFAULT '' NOT NULL,
	"visibility" "visibility" DEFAULT 'PRIVATE' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "search_documents_content_type_content_id_pk" PRIMARY KEY("content_type","content_id")
);
--> statement-breakpoint
CREATE TABLE "app_settings" (
	"user_id" text NOT NULL,
	"key" text NOT NULL,
	"value" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "app_settings_user_id_key_pk" PRIMARY KEY("user_id","key")
);
--> statement-breakpoint
CREATE TABLE "oauth_connections" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"provider" text NOT NULL,
	"provider_account_id" text NOT NULL,
	"email" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"image" text,
	"role" "user_role" DEFAULT 'OWNER' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "project_media" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"photo_id" text NOT NULL,
	"caption" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_technologies" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"name" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"tagline" text,
	"summary" text,
	"content_json" jsonb,
	"plain_text" text,
	"status" "project_status" DEFAULT 'IN_PROGRESS' NOT NULL,
	"visibility" "visibility" DEFAULT 'PRIVATE' NOT NULL,
	"is_lab" boolean DEFAULT false NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"hero_image_id" text,
	"repository_url" text,
	"live_url" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "projects_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "brain_item_tags" ADD CONSTRAINT "brain_item_tags_brain_item_id_brain_items_id_fk" FOREIGN KEY ("brain_item_id") REFERENCES "public"."brain_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brain_item_tags" ADD CONSTRAINT "brain_item_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brain_items" ADD CONSTRAINT "brain_items_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tags" ADD CONSTRAINT "tags_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calendar_connections" ADD CONSTRAINT "calendar_connections_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_calendar_id_calendars_id_fk" FOREIGN KEY ("calendar_id") REFERENCES "public"."calendars"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calendars" ADD CONSTRAINT "calendars_connection_id_calendar_connections_id_fk" FOREIGN KEY ("connection_id") REFERENCES "public"."calendar_connections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "journal_entries" ADD CONSTRAINT "journal_entries_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "journal_entry_tags" ADD CONSTRAINT "journal_entry_tags_journal_entry_id_journal_entries_id_fk" FOREIGN KEY ("journal_entry_id") REFERENCES "public"."journal_entries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "journal_entry_tags" ADD CONSTRAINT "journal_entry_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "photo_collection_items" ADD CONSTRAINT "photo_collection_items_collection_id_photo_collections_id_fk" FOREIGN KEY ("collection_id") REFERENCES "public"."photo_collections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "photo_collection_items" ADD CONSTRAINT "photo_collection_items_photo_id_photos_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."photos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "photo_collections" ADD CONSTRAINT "photo_collections_cover_photo_id_photos_id_fk" FOREIGN KEY ("cover_photo_id") REFERENCES "public"."photos"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_settings" ADD CONSTRAINT "app_settings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "oauth_connections" ADD CONSTRAINT "oauth_connections_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_media" ADD CONSTRAINT "project_media_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_media" ADD CONSTRAINT "project_media_photo_id_photos_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."photos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_technologies" ADD CONSTRAINT "project_technologies_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_hero_image_id_photos_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."photos"("id") ON DELETE set null ON UPDATE no action;