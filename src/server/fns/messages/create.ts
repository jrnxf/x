import { createServerFn } from "@tanstack/react-start";

import { db } from "~/db";
import { chatMessages, postMessages } from "~/db/schema";
import { createEditMessageSchema } from "~/server/fns/messages/shared";
import { authMiddleware } from "~/server/middleware/auth";

const schema = createEditMessageSchema;

const serverFn = createServerFn({
  method: "POST",
})
  .middleware([authMiddleware])
  .validator(schema)
  .handler(async ({ context, data }) => {
    const userId = context.user.id;

    const { content, entityId, type } = data;

    if (type === "post") {
      return await db
        .insert(postMessages)
        .values({
          content,
          postId: entityId,
          userId,
        })
        .returning();
    }

    if (type === "chat") {
      return await db
        .insert(chatMessages)
        .values({
          content,
          userId,
        })
        .returning();
    }
  });

export const createMessage = {
  schema,
  serverFn,
};
