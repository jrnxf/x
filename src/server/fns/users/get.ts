import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import invariant from "tiny-invariant";
import { z } from "zod";

import { db } from "~/db";
import { userLocations, users, userSocials } from "~/db/schema";
import { type ServerFnData } from "~/server/types";

export const schema = z.object({
  userId: z.coerce.number(),
});

export const serverFn = createServerFn({
  method: "GET",
})
  .validator(schema)
  .handler(async ({ data }) => {
    const [user] = await db
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
      .where(eq(users.id, data.userId))
      .leftJoin(userLocations, eq(userLocations.userId, users.id))
      .leftJoin(userSocials, eq(userSocials.userId, users.id))
      // .leftJoin(userDisciplines, eq(userDisciplines.userId, users.id))
      .limit(1);

    invariant(user, "User not found");

    return user;
  });

export const getUser = {
  queryOptions: (data: ServerFnData<typeof serverFn>) =>
    queryOptions({
      queryKey: ["user", data.userId],
      queryFn: async () => {
        return serverFn({ data });
      },
    }),
  schema,
  serverFn,
};
