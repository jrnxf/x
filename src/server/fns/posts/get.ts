import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "~/db";
import { posts } from "~/db/schema";
import { type ServerFnData } from "~/server/types";

const schema = z.object({
  postId: z.number(),
});

const serverFn = createServerFn({
  method: "GET",
})
  .validator(schema)
  .handler(async ({ data }) => {
    const post = await db.query.posts.findFirst({
      where: eq(posts.id, data.postId),
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
      throw new Error("Post not found");
    }

    return post;
  });

export const getPost = {
  queryOptions: (data: ServerFnData<typeof serverFn>) =>
    queryOptions({
      queryFn: () => {
        return serverFn({ data });
      },
      queryKey: ["posts", data.postId],
    }),
  schema,
  serverFn,
};
