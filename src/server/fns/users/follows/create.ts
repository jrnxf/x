import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { db } from "~/db";
import { userFollows } from "~/db/schema";
import { authMiddleware } from "~/server/middleware/auth";

const schema = z.object({
  userId: z.number(),
});

const serverFn = createServerFn({
  method: "POST",
})
  .validator(schema)
  .middleware([authMiddleware])
  .handler(async ({ data, context }) => {
    const [follow] = await db
      .insert(userFollows)
      .values({
        followedByUserId: context.user.id,
        followedUserId: data.userId,
      })
      .returning();

    return follow;
  });

export const createFollow = {
  schema,
  serverFn,
};
