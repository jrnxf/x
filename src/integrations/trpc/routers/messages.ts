import { asc, eq } from "drizzle-orm";

import { type TRPCRouterRecord } from "@trpc/server";
import { chatMessages, postMessages } from "~/db/schema";
import { authProcedure, publicProcedure } from "~/integrations/trpc/init";
import { baseMessageSchema, createEditMessageSchema } from "~/models/messages";

export const messagesRouter = {
  create: authProcedure
    .input(createEditMessageSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

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
      const userId = ctx.session.user.id;

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
} satisfies TRPCRouterRecord;
