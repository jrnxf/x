import { and, eq } from "drizzle-orm";

import { chatMessageLikes, postLikes, postMessageLikes } from "~/db/schema";
import { likeUnlikeSchema } from "~/models/likes";
import { authProcedure, createTRPCRouter } from "~/integrations/trpc/init";

export const reactionRouter = createTRPCRouter({
  react: authProcedure
    .input(likeUnlikeSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;

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
});
