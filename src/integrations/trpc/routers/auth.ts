import { type TRPCRouterRecord } from "@trpc/server";
import { eq } from "drizzle-orm";

import { userLocations, userSocials, users } from "~/db/schema";
import { authProcedure, publicProcedure } from "~/integrations/trpc/init";
import { useServerSession } from "~/server/session";

export const authRouter = {
  logout: publicProcedure.mutation(async () => {
    const session = await useServerSession();
    await session.clear();
  }),
  getAuthUser: authProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;
    const [user] = await ctx.db
      .select({
        avatarUrl: users.avatarUrl,
        bio: users.bio,
        disciplines: users.disciplines,
        email: users.email,
        id: users.id,
        location: {
          countryCode: userLocations.countryCode,
          countryName: userLocations.countryName,
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
      .where(eq(users.id, userId))
      .leftJoin(userLocations, eq(userLocations.userId, users.id))
      .leftJoin(userSocials, eq(userSocials.userId, users.id));

    if (!user) {
      throw new Error(`User with id ${userId} not found`);
    }
    return user;
  }),
} satisfies TRPCRouterRecord;
