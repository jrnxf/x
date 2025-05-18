import { asc, eq } from "drizzle-orm";

import { chatMessages, postMessages } from "~/db/schema";
import { baseMessageSchema, createEditMessageSchema } from "~/models/messages";
import {
  authProcedure,
  createTRPCRouter,
  publicProcedure,
} from "~/integrations/trpc/init";

export const messagesRouter = createTRPCRouter({
  create: authProcedure
    .input(createEditMessageSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;

      const { content, recordId, type } = input;

      if (type === "post") {
        await ctx.db
          .insert(postMessages)
          .values({
            content,
            postId: recordId,
            userId,
          })
          .returning();
      }

      if (type === "chat") {
        await ctx.db
          .insert(chatMessages)
          .values({
            content,
            userId,
          })
          .returning();
      }
    }),

  delete: authProcedure
    .input(baseMessageSchema)
    .mutation(async ({ ctx, input }) => {
      const { recordId, type } = input;

      if (type === "post") {
        await ctx.db
          .delete(postMessages)
          .where(eq(postMessages.id, recordId))
          .returning();
      }

      if (type === "chat") {
        await ctx.db
          .delete(chatMessages)
          .where(eq(chatMessages.id, recordId))
          .returning();
      }
    }),

  list: publicProcedure
    .input(baseMessageSchema)
    .query(async ({ ctx, input }) => {
      if (input.type === "chat") {
        return await ctx.db.query.chatMessages.findMany({
          orderBy: asc(chatMessages.createdAt),
          with: {
            likes: {
              columns: {
                chatMessageId: false,
                userId: false,
              },
              with: {
                user: {
                  columns: {
                    avatarUrl: true,
                    id: true,
                    name: true,
                  },
                },
              },
            },
            user: {
              columns: {
                avatarUrl: true,
                id: true,
                name: true,
              },
            },
          },
        });
      }

      if (input.type === "post") {
        return await ctx.db.query.postMessages.findMany({
          orderBy: asc(postMessages.createdAt),
          where: eq(postMessages.postId, input.recordId),
          with: {
            likes: {
              columns: {
                postMessageId: false,
                userId: false,
              },
              with: {
                user: {
                  columns: {
                    avatarUrl: true,
                    id: true,
                    name: true,
                  },
                },
              },
            },
            user: {
              columns: {
                avatarUrl: true,
                id: true,
                name: true,
              },
            },
          },
        });
      }

      return [];
    }),

  update: authProcedure
    .input(createEditMessageSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;

      const { content, recordId, type } = input;

      if (type === "post") {
        return await ctx.db
          .update(postMessages)
          .set({ content, userId })
          .where(eq(postMessages.id, recordId))
          .returning();
      }

      if (type === "chat") {
        return await ctx.db
          .update(chatMessages)
          .set({ content, userId })
          .where(eq(chatMessages.id, recordId))
          .returning();
      }
    }),
});
