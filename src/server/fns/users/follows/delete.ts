import { createServerFn } from "@tanstack/react-start";
import { and, eq } from "drizzle-orm";
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
      .delete(userFollows)
      .where(
        and(
          eq(userFollows.followedByUserId, context.user.id),
          eq(userFollows.followedUserId, data.userId),
        ),
      )
      .returning();

    return follow;
  });

export const deleteFollow = {
  schema,
  serverFn,
};
