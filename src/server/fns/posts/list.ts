import { infiniteQueryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { and, count, desc, eq, ilike, lt, or } from "drizzle-orm";
import { z } from "zod";

import { db } from "~/db";
import { muxVideos, postLikes, postMessages, posts, users } from "~/db/schema";
import { type ServerFnData } from "~/server/types";

const schema = z.object({
  cursor: z.number().nullish(),
  limit: z.number().min(25).max(50).optional(),
  q: z.string().optional(),
});

const serverFn = createServerFn({
  method: "GET",
})
  .validator(schema)
  .handler(async ({ data }) => {
    const results = await db
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
            data.q ? ilike(posts.title, `%${data.q}%`) : undefined,
            data.q ? ilike(posts.content, `%${data.q}%`) : undefined,
            data.q ? ilike(users.name, `%${data.q}%`) : undefined,
          ),

          data.cursor ? lt(posts.id, data.cursor) : undefined,
        ),
      )
      .orderBy(desc(posts.id))
      .limit(data.limit ?? 25);

    return results;
  });

export const listPosts = {
  infiniteQueryOptions: (data: ServerFnData<typeof serverFn>) =>
    infiniteQueryOptions({
      queryKey: ["posts", data],
      queryFn: async ({ pageParam: cursor }) => {
        return await serverFn({
          data: {
            ...data,
            cursor,
          },
        });
      },
      initialPageParam: 0,
      getNextPageParam: (lastPage) => {
        if (lastPage.length < 25) {
          // the last page returned less than the requested limit, so we
          // know there is no more results for this filter set
          return;
        }

        return lastPage.at(-1)?.id;
      },
    }),
  schema,
  serverFn,
};
