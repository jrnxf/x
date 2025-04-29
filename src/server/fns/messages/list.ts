import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { asc, eq } from "drizzle-orm";

import { db } from "~/db";
import { chatMessages, postMessages } from "~/db/schema";
import { baseMessageSchema } from "~/server/fns/messages/shared";
import { type ServerFnReturn, type ServerFnData } from "~/server/types";

const schema = baseMessageSchema;

const serverFn = createServerFn({
  method: "GET",
})
  .validator(schema)
  .handler(async ({ data: data }) => {
    if (data.type === "chat") {
      return await db.query.chatMessages.findMany({
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

    if (data.type === "post") {
      return await db.query.postMessages.findMany({
        orderBy: asc(postMessages.createdAt),
        where: eq(postMessages.postId, data.recordId),
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
  });

export const listMessages = {
  queryOptions: (data: ServerFnData<typeof serverFn>) =>
    queryOptions({
      queryKey: ["messages", data.type, data.recordId],
      queryFn: () => serverFn({ data }),
      refetchInterval: 10_000,
    }),
  schema,
  serverFn,
};

export type Message = ServerFnReturn<typeof serverFn>[number];
