import {
  integer,
  json,
  pgEnum,
  pgTable,
  primaryKey,
  real,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm/relations";

export const RIU_STATUSES = ["archived", "active", "upcoming"] as const;
// enums
export const riuStatusEnum = pgEnum("riu_status", RIU_STATUSES);

export const USER_TYPES = ["user", "admin", "test"] as const;
export const userTypeEnum = pgEnum("user_type", USER_TYPES);

export const USER_DISCIPLINES = [
  "street",
  "flatland",
  "trials",
  "freestyle",
  "mountain",
  "distance",
] as const;

type UserDiscipline = (typeof USER_DISCIPLINES)[number];

export const POST_TAGS = [
  "flatland",
  "street",
  "trials",
  "freestyle",
  "mountain",
  "distance",
  "random",
  "memes",
  "buy",
  "sell",
  "nbds",
  "til",
  "bails",
] as const;

type PostTag = (typeof POST_TAGS)[number];

export const postTagEnum = pgEnum("post_tag", POST_TAGS);

export const users = pgTable("users", {
  avatarUrl: text("avatar_url"),
  bio: text("bio"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  disciplines: json("disciplines").$type<UserDiscipline[]>(),
  email: text("email").unique().notNull(),
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  password: text("password").notNull(),
  type: userTypeEnum("type").default("user"),
});

export const userLocations = pgTable("user_locations", {
  countryCode: text("country_code").notNull(),

  countryName: text("country_name").notNull(),
  formattedAddress: text("formatted_address").notNull(),
  lat: real("lat").notNull(),
  lng: real("lng").notNull(),
  userId: integer("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
});

export const userSocials = pgTable("user_socials", {
  facebook: text("facebook"),

  instagram: text("instagram"),
  spotify: text("spotify"),
  tiktok: text("tiktok"),
  twitter: text("twitter"),
  userId: integer("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  youtube: text("youtube"),
});

export const posts = pgTable("posts", {
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  id: serial("id").primaryKey(),
  imageUrl: text("image_url"),
  tags: json("tags").$type<PostTag[]>().default([]),

  title: text("title").notNull(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  videoUploadId: text("video_upload_id").references(() => muxVideos.uploadId, {
    onDelete: "set null",
  }),

  youtubeVideoId: text("youtube_video_id"),
});

export const chatMessages = pgTable("chat_messages", {
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),

  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
});

export const chatMessageLikes = pgTable(
  "chat_message_likes",
  {
    chatMessageId: integer("chat_message_id")
      .notNull()
      .references(() => chatMessages.id, { onDelete: "cascade" }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.chatMessageId, t.userId] }),
  }),
);

export const postMessages = pgTable("post_messages", {
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),

  id: serial("id").primaryKey(),
  postId: integer("post_id")
    .notNull()
    .references(() => posts.id, { onDelete: "cascade" }),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
});

export const postLikes = pgTable(
  "post_likes",
  {
    postId: integer("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.postId, t.userId] }),
  }),
);

export const postMessageLikes = pgTable(
  "post_message_likes",
  {
    postMessageId: integer("post_message_id")
      .notNull()
      .references(() => postMessages.id, { onDelete: "cascade" }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.postMessageId, t.userId] }),
  }),
);

export const muxVideos = pgTable("mux_videos", {
  assetId: text("asset_id").unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  playbackId: text("playback_id").unique(),
  uploadId: text("upload_id").primaryKey(),
});

export const rius = pgTable("rius", {
  createdAt: timestamp("created_at").notNull().defaultNow(),
  id: serial("id").primaryKey(),
  startedAt: timestamp("started_at"),
  status: riuStatusEnum("status").default("upcoming"),
});

export const riuSets = pgTable("riu_sets", {
  createdAt: timestamp("created_at").notNull().defaultNow(),
  description: text("description"),
  id: serial("id").primaryKey(),
  name: text("name").notNull(),

  riuId: integer("riu_id")
    .notNull()
    .references(() => rius.id, { onDelete: "cascade" }),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  videoUploadId: text("video_upload_id")
    .references(() => muxVideos.uploadId, {
      onDelete: "set null",
    })
    .notNull(),
});

export const riuSubmissions = pgTable("riu_submissions", {
  createdAt: timestamp("created_at").notNull().defaultNow(),
  id: serial("id").primaryKey(),

  riuSetId: integer("riu_set_id")
    .notNull()
    .references(() => riuSets.id, { onDelete: "cascade" }),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  videoUploadId: text("video_upload_id")
    .references(() => muxVideos.uploadId, {
      onDelete: "set null",
    })
    .notNull(),
});

export const userFollows = pgTable(
  "user_follows",
  {
    followedByUserId: integer("followed_by_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    followedUserId: integer("followed_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.followedUserId, t.followedByUserId] }),
  }),
);

/**
 * Relations
 */

export const usersRelations = relations(users, ({ many, one }) => ({
  chatMessages: many(chatMessages),
  followedByUsers: many(userFollows, { relationName: "followedByUsers" }),
  followingUsers: many(userFollows, { relationName: "followingUsers" }),
  likedPosts: many(postLikes),
  location: one(userLocations),
  posts: many(posts),
  socials: one(userSocials),
}));

export const locationsRelations = relations(userLocations, ({ one }) => ({
  user: one(users, { fields: [userLocations.userId], references: [users.id] }),
}));

export const userSocialsRelations = relations(userSocials, ({ one }) => ({
  user: one(users, { fields: [userSocials.userId], references: [users.id] }),
}));

// POSTS
export const postsRelations = relations(posts, ({ many, one }) => ({
  likes: many(postLikes),
  messages: many(postMessages),
  user: one(users, { fields: [posts.userId], references: [users.id] }),
  video: one(muxVideos, {
    fields: [posts.videoUploadId],
    references: [muxVideos.uploadId],
  }),
}));

export const riuRelations = relations(rius, ({ many }) => ({
  // likes: many(postLikes),
  sets: many(riuSets),
}));

export const riuSetsRelations = relations(riuSets, ({ many, one }) => ({
  // likes: many(postLikes),
  // messages: many(postMessages),
  riu: one(rius, { fields: [riuSets.riuId], references: [rius.id] }),
  submissions: many(riuSubmissions),
  user: one(users, { fields: [riuSets.userId], references: [users.id] }),
  video: one(muxVideos, {
    fields: [riuSets.videoUploadId],
    references: [muxVideos.uploadId],
  }),
}));

export const riuSubmissionsRelations = relations(riuSubmissions, ({ one }) => ({
  riuSet: one(riuSets, {
    fields: [riuSubmissions.riuSetId],
    references: [riuSets.id],
  }),
  user: one(users, { fields: [riuSubmissions.userId], references: [users.id] }),
  video: one(muxVideos, {
    fields: [riuSubmissions.videoUploadId],
    references: [muxVideos.uploadId],
  }),
}));

export const postLikesRelations = relations(postLikes, ({ one }) => ({
  post: one(posts, { fields: [postLikes.postId], references: [posts.id] }),
  user: one(users, { fields: [postLikes.userId], references: [users.id] }),
}));

export const postMessagesRelations = relations(
  postMessages,
  ({ many, one }) => ({
    likes: many(postMessageLikes),
    post: one(posts, { fields: [postMessages.postId], references: [posts.id] }),
    user: one(users, { fields: [postMessages.userId], references: [users.id] }),
  }),
);

export const postMessageLikesRelations = relations(
  postMessageLikes,
  ({ one }) => ({
    postMessage: one(postMessages, {
      fields: [postMessageLikes.postMessageId],
      references: [postMessages.id],
    }),
    user: one(users, {
      fields: [postMessageLikes.userId],
      references: [users.id],
    }),
  }),
);

// CHAT
export const chatMessagesRelations = relations(
  chatMessages,
  ({ many, one }) => ({
    likes: many(chatMessageLikes),
    user: one(users, { fields: [chatMessages.userId], references: [users.id] }),
  }),
);

export const chatMessageLikesRelations = relations(
  chatMessageLikes,
  ({ one }) => ({
    chatMessage: one(chatMessages, {
      fields: [chatMessageLikes.chatMessageId],
      references: [chatMessages.id],
    }),
    user: one(users, {
      fields: [chatMessageLikes.userId],
      references: [users.id],
    }),
  }),
);

export type InsertChatMessage = typeof chatMessages.$inferInsert;
export type InsertLocation = typeof userLocations.$inferInsert;

export type InsertPost = typeof posts.$inferInsert;
export type InsertUser = typeof users.$inferInsert;

export type SelectChatMessage = typeof chatMessages.$inferSelect;
export type SelectLocation = typeof userLocations.$inferSelect;

export type SelectPost = typeof posts.$inferSelect;
export type SelectUser = typeof users.$inferSelect;

// make sure to reset sequences when seeding. eg
// SELECT setval('users_id_seq', (SELECT MAX(id) FROM users), true);
