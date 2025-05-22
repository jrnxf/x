import { and, eq } from "drizzle-orm";

import { type TRPCRouterRecord } from "@trpc/server";
import { chatMessageLikes, postLikes, postMessageLikes } from "~/db/schema";
import { authProcedure } from "~/integrations/trpc/init";
import { likeUnlikeSchema } from "~/models/likes";

export const reactionRouter = {
  react: authProcedure
    .input(likeUnlikeSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const { action, recordId, type } = input;

      if (type === "post") {
        if (action === "like") {
          await ctx.db.insert(postLikes).values({
            postId: recordId,
            userId,
          });
        } else {
          await ctx.db
            .delete(postLikes)
            .where(
              and(eq(postLikes.postId, recordId), eq(postLikes.userId, userId)),
            );
        }
      }

      if (type === "postMessage") {
        if (action === "like") {
          await ctx.db.insert(postMessageLikes).values({
            postMessageId: recordId,
            userId,
          });
        } else {
          await ctx.db
            .delete(postMessageLikes)
            .where(
              and(
                eq(postMessageLikes.postMessageId, recordId),
                eq(postMessageLikes.userId, userId),
              ),
            );
        }
      }

      if (type === "chatMessage") {
        if (action === "like") {
          await ctx.db.insert(chatMessageLikes).values({
            chatMessageId: recordId,
            userId,
          });
        } else {
          await ctx.db
            .delete(chatMessageLikes)
            .where(
              and(
                eq(chatMessageLikes.chatMessageId, recordId),
                eq(chatMessageLikes.userId, userId),
              ),
            );
        }
      }
    }),
} satisfies TRPCRouterRecord;
