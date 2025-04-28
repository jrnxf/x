import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";

import { db } from "~/db";
import { chatMessages, postMessages } from "~/db/schema";
import {
  baseMessageSchema,
  createUpdateMessageSchema,
  getTableByType,
} from "~/server/fns/messages/shared";
import { authMiddleware } from "~/server/middleware/auth";

const schema = baseMessageSchema;

const serverFn = createServerFn({
  method: "POST",
})
  .middleware([authMiddleware])
  .validator(schema)
  .handler(async ({ context, data }) => {
    const userId = context.user.id;

    const { entityId, type } = data;

    const table = getTableByType(type);

    const [messageToDelete] = await db
      .select({ userId: table.userId })
      .from(table)
      .where(eq(table.id, entityId));

    if (!messageToDelete) {
      throw new Error("Message not found");
    }

    if (messageToDelete.userId !== userId) {
      throw new Error("Access denied");
    }

    return await db.delete(table).where(eq(table.id, entityId)).returning();
  });

export const editMessage = {
  schema,
  serverFn,
};
