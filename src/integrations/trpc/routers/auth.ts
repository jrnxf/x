import { TRPCError, type TRPCRouterRecord } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { magicLinks, userLocations, userSocials, users } from "~/db/schema";
import { authProcedure, publicProcedure } from "~/integrations/trpc/init";
import { createSession, deleteSession } from "~/lib/session";

export const authRouter = {
  verifyMagicLink: publicProcedure
    .input(z.object({ token: z.string() }))
    .mutation(async ({ ctx, input: { token } }) => {
      const [magicLink] = await ctx.db
        .select({
          id: magicLinks.id,
          user: {
            id: users.id,
            email: users.email,
            name: users.name,
            avatarUrl: users.avatarUrl,
            bio: users.bio,
            disciplines: users.disciplines,
          },
        })
        .from(magicLinks)
        .where(eq(magicLinks.id, token))
        .leftJoin(users, eq(users.email, magicLinks.email))
        .limit(1);

      if (!magicLink) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Magic link not found: ${token}`,
        });
      }

      const { user } = magicLink;

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `User not found for magic link: ${token}`,
        });
      }

      await createSession(
        {
          user,
        },
        ctx.res,
      );

      return magicLink;
    }),
  logout: publicProcedure.mutation(async ({ ctx }) => {
    await deleteSession(ctx.res);
  }),
  getAuthUser: authProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
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
