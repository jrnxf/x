import { TRPCError, type TRPCRouterRecord } from "@trpc/server";
import { and, count, desc, eq, ilike, lt, or } from "drizzle-orm";
import { z } from "zod";

import { db } from "~/db";
import { muxVideos, postLikes, postMessages, posts, users } from "~/db/schema";
import { authProcedure, publicProcedure } from "~/integrations/trpc/init";
import { createUpdatePostSchema } from "~/models/posts";

export const postRouter = {
  create: authProcedure
    .input(createUpdatePostSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;

      if (input.videoUploadId) {
        await ctx.db
          .insert(muxVideos)
          .values({
            uploadId: input.videoUploadId,
          })
          .onConflictDoNothing(); // the webhook won – the video is already ready
      }

      const [post] = await ctx.db
        .insert(posts)
        .values({
          ...input,
          userId,
        })
        .returning();

      return post;
    }),

  delete: authProcedure
    .input(z.number())
    .mutation(async ({ ctx, input: postId }) => {
      const userId = ctx.user.id;
      const post = await ctx.db.query.posts.findFirst({
        where: eq(posts.id, postId),
      });

      if (!post) {
        throw new Error("Post not found");
      }

      if (post.userId !== userId) {
        throw new Error("Access denied");
      }

      await db.delete(posts).where(eq(posts.id, postId)).returning();
    }),
  get: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input: { id } }) => {
      const post = await ctx.db.query.posts.findFirst({
        where: eq(posts.id, id),
        with: {
          likes: {
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
          messages: {
            with: {
              likes: {
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
          },
          user: {
            columns: {
              avatarUrl: true,
              id: true,
              name: true,
            },
          },
          video: true,
        },
      });

      if (!post) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Post not found",
        });
      }

      return post;
    }),

  list: publicProcedure
    .input(
      z.object({
        cursor: z.number().nullish(),
        limit: z.number().min(25).max(50).default(25),
        search: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const data = await ctx.db
        .select({
          content: posts.content,
          counts: {
            likes: count(postLikes.postId),
            messages: count(postMessages.postId),
          },
          createdAt: posts.createdAt,
          id: posts.id,
          imageUrl: posts.imageUrl,
          tags: posts.tags,
          title: posts.title,
          user: {
            id: users.id,
            name: users.name,
          },
          video: {
            playbackId: muxVideos.playbackId,
          },
          youtubeVideoId: posts.youtubeVideoId,
        })
        .from(posts)
        .innerJoin(users, eq(posts.userId, users.id))
        .leftJoin(postLikes, eq(posts.id, postLikes.postId))
        .leftJoin(postMessages, eq(posts.id, postMessages.postId))
        .leftJoin(muxVideos, eq(posts.videoUploadId, muxVideos.uploadId))
        .groupBy(posts.id, users.id, muxVideos.uploadId)
        .where(
          and(
            or(
              input.search
                ? ilike(posts.title, `%${input.search}%`)
                : undefined,
              input.search
                ? ilike(posts.content, `%${input.search}%`)
                : undefined,
              input.search ? ilike(users.name, `%${input.search}%`) : undefined,
            ),

            input.cursor ? lt(posts.id, input.cursor) : undefined,
          ),
        )
        .orderBy(desc(posts.id))
        .limit(input.limit);

      return data;
    }),

  update: authProcedure
    .input(
      createUpdatePostSchema.extend({
        postId: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const { postId, ...data } = input;

      const [post] = await db
        .update(posts)
        .set({ ...data, userId })
        .where(eq(posts.id, postId))
        .returning();

      return post;
    }),
} satisfies TRPCRouterRecord;
