import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { db } from "~/db";
import { POST_TAGS, posts } from "~/db/schema";
import { authMiddleware } from "~/server/middleware/auth";

const createUpdatePostSchema = z.object({
  content: z.string().min(1, { message: "Required" }),
  imageUrl: z.string().url().optional().nullable(),
  tags: z
    .array(z.enum(POST_TAGS))
    .min(1, { message: "Required" })
    .max(3, { message: "No more than three tags allowed" }),
  title: z
    .string()
    .min(1, { message: "Required" })
    .max(60, { message: "Title must be less than 60 characters" }),
  videoUploadId: z.string().optional().nullable(),
  youtubeVideoId: z.string().min(11).optional().nullable(), // youtube ids are 11 characters
});

const schema = createUpdatePostSchema;

const serverFn = createServerFn({
  method: "POST",
})
  .middleware([authMiddleware])
  .validator(schema)
  .handler(async ({ context, data }) => {
    const [post] = await db
      .insert(posts)
      .values({
        ...data,
        userId: context.user.id,
      })
      .returning();

    return post;
  });

export const createPost = {
  schema,
  serverFn,
};
