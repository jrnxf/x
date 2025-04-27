-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TYPE "public"."riu_status" AS ENUM('archived', 'active', 'upcoming');--> statement-breakpoint
CREATE TYPE "public"."user_type" AS ENUM('general', 'admin', 'test');--> statement-breakpoint
CREATE TABLE "chat_messages" (
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mux_videos" (
	"upload_id" text PRIMARY KEY NOT NULL,
	"playback_id" text,
	"asset_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "mux_videos_playback_id_unique" UNIQUE("playback_id"),
	CONSTRAINT "mux_videos_asset_id_unique" UNIQUE("asset_id")
);
--> statement-breakpoint
CREATE TABLE "user_socials" (
	"user_id" integer NOT NULL,
	"facebook" text,
	"twitter" text,
	"spotify" text,
	"tiktok" text,
	"instagram" text,
	"youtube" text,
	CONSTRAINT "user_socials_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" "user_type" DEFAULT 'general',
	"name" text NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"avatar_url" text,
	"bio" text,
	"disciplines" json,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"video_upload_id" text,
	"youtube_video_id" text,
	"image_url" text,
	"user_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "post_messages" (
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"id" serial PRIMARY KEY NOT NULL,
	"post_id" integer NOT NULL,
	"user_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "riu_sets" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"video_upload_id" text,
	"riu_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rius" (
	"id" serial PRIMARY KEY NOT NULL,
	"status" "riu_status" DEFAULT 'upcoming',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"started_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "user_locations" (
	"user_id" integer NOT NULL,
	"country_code" text NOT NULL,
	"country_name" text NOT NULL,
	"formatted_address" text NOT NULL,
	"lat" real NOT NULL,
	"lng" real NOT NULL,
	CONSTRAINT "user_locations_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "post_likes" (
	"post_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	CONSTRAINT "post_likes_post_id_user_id_pk" PRIMARY KEY("post_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "post_message_likes" (
	"post_message_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	CONSTRAINT "post_message_likes_post_message_id_user_id_pk" PRIMARY KEY("post_message_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "chat_message_likes" (
	"chat_message_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	CONSTRAINT "chat_message_likes_chat_message_id_user_id_pk" PRIMARY KEY("chat_message_id","user_id")
);
--> statement-breakpoint
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_socials" ADD CONSTRAINT "user_socials_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_video_upload_id_mux_videos_upload_id_fk" FOREIGN KEY ("video_upload_id") REFERENCES "public"."mux_videos"("upload_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_messages" ADD CONSTRAINT "post_messages_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_messages" ADD CONSTRAINT "post_messages_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "riu_sets" ADD CONSTRAINT "riu_sets_video_upload_id_mux_videos_upload_id_fk" FOREIGN KEY ("video_upload_id") REFERENCES "public"."mux_videos"("upload_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "riu_sets" ADD CONSTRAINT "riu_sets_riu_id_rius_id_fk" FOREIGN KEY ("riu_id") REFERENCES "public"."rius"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "riu_sets" ADD CONSTRAINT "riu_sets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_locations" ADD CONSTRAINT "user_locations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_likes" ADD CONSTRAINT "post_likes_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_likes" ADD CONSTRAINT "post_likes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_message_likes" ADD CONSTRAINT "post_message_likes_post_message_id_post_messages_id_fk" FOREIGN KEY ("post_message_id") REFERENCES "public"."post_messages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_message_likes" ADD CONSTRAINT "post_message_likes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_message_likes" ADD CONSTRAINT "chat_message_likes_chat_message_id_chat_messages_id_fk" FOREIGN KEY ("chat_message_id") REFERENCES "public"."chat_messages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_message_likes" ADD CONSTRAINT "chat_message_likes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
*/