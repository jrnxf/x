import { infiniteQueryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { and, asc, eq, gt, ilike, sql } from "drizzle-orm";
import { z } from "zod";

import { db } from "~/db";
import {
  USER_DISCIPLINES,
  userLocations,
  users,
  userSocials,
} from "~/db/schema";
import { type ServerFnData } from "~/server/types";

export const schema = z.object({
  cursor: z.number().nullish(),
  disciplines: z.array(z.enum(USER_DISCIPLINES)).optional(),
  limit: z.number().min(25).max(50).optional(),
  search: z.string().optional(),
});

export const serverFn = createServerFn({
  method: "GET",
})
  .validator(schema)
  .handler(async ({ data }) => {
    return await db
      .select({
        avatarUrl: users.avatarUrl,
        bio: users.bio,
        disciplines: users.disciplines,
        email: users.email,
        id: users.id,
        location: {
          countryCode: userLocations.countryCode,
          formattedAddress: userLocations.formattedAddress,
          lat: userLocations.lat,
          lng: userLocations.lng,
        },
        name: users.name,
        socials: {
          facebook: userSocials.facebook,
          instagram: userSocials.instagram,
          spotify: userSocials.spotify,
          tiktok: userSocials.tiktok,
          twitter: userSocials.twitter,
          youtube: userSocials.youtube,
        },
      })
      .from(users)
      .leftJoin(userLocations, eq(userLocations.userId, users.id))
      .leftJoin(userSocials, eq(userSocials.userId, users.id))
      .where(
        and(
          data.search ? ilike(users.name, `%${data.search}%`) : undefined,
          data.disciplines && data.disciplines.length > 0
            ? sql`${users.disciplines}::jsonb @> ${sql.raw(
                `'${JSON.stringify(data.disciplines)}'`,
              )}::jsonb`
            : undefined,
          data.cursor ? gt(users.id, data.cursor) : undefined,
        ),
      )
      .orderBy(asc(users.id))
      .limit(data.limit ?? 25);
  });

export const listUsers = {
  infiniteQueryOptions: (data?: ServerFnData<typeof serverFn>) =>
    infiniteQueryOptions({
      queryKey: ["users", data],
      queryFn: ({ pageParam: cursor }) => {
        return serverFn({
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
