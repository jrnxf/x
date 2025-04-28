import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";

import { db } from "~/db";
import { chatMessages, postMessages } from "~/db/schema";
import {
  createUpdateMessageSchema,
  getTableByType,
} from "~/server/fns/messages/shared";
import { authMiddleware } from "~/server/middleware/auth";

const schema = createUpdateMessageSchema;

const serverFn = createServerFn({
  method: "POST",
})
  .middleware([authMiddleware])
  .validator(schema)
  .handler(async ({ context, data }) => {
    const userId = context.user.id;

    const { content, entityId, type } = data;

    const table = getTableByType(type);

    const [messageToUpdate] = await db
      .select({ userId: table.userId })
      .from(table)
      .where(eq(table.id, entityId));

    if (!messageToUpdate) {
      throw new Error("Message not found");
    }

    if (messageToUpdate.userId !== userId) {
      throw new Error("Access denied");
    }

    return await db
      .update(table)
      .set({ content, userId })
      .where(eq(table.id, entityId))
      .returning();
  });

export const editMessage = {
  schema,
  serverFn,
};
