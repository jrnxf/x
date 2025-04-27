import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "~/db";
import { posts } from "~/db/schema";
import { basePostSchema } from "~/server/fns/posts/shared";

const schema = basePostSchema.extend({
  postId: z.number(),
});

const serverFn = createServerFn({
  method: "POST",
})
  .validator(schema)
  .handler(async ({ data }) => {
    await db.update(posts).set(data).where(eq(posts.id, data.postId));
  });

export const updatePost = {
  schema,
  serverFn,
};
