import { type TRPCRouterRecord } from "@trpc/server";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

import { userLocations, userSocials, users } from "~/db/schema";
import { authProcedure, publicProcedure } from "~/integrations/trpc/init";
import { loginSchema } from "~/models/auth";
import { useServerSession } from "~/server/session";
import colors from "yoctocolors";

export const authRouter = {
  login: publicProcedure.input(loginSchema).mutation(async ({ ctx, input }) => {
    const start = performance.now();

    console.time("findFirst");
    const userWithPassword = await ctx.db.query.users.findFirst({
      columns: {
        avatarUrl: true,
        email: true,
        id: true,
        name: true,
        password: true,
      },
      where: eq(users.email, input.email),
    });
    console.timeEnd("findFirst");
    if (!userWithPassword) {
      return {
        errorMessage: "User not found",
        success: false,
      } as const;
    }

    const { password, ...user } = userWithPassword;

    console.time("bcrypt compare");
    const isCorrectPassword = await bcrypt.compare(
      input.password,
      password,
      undefined,
      (percent) => {
        console.log(colors.bgBlue(`bcrypt compare: ${percent}%`));
      },
    );
    console.timeEnd("bcrypt compare");

    if (!isCorrectPassword) {
      return {
        errorMessage: "Invalid credentials",
        success: false,
      } as const;
    }

    console.time("session update");
    const session = await useServerSession();

    await session.update({ user });
    console.timeEnd("session update");

    const durationMs = performance.now() - start;

    const totalTime =
      durationMs > 1000
        ? colors.red(`${(durationMs / 1000).toFixed(2)}s`)
        : durationMs > 500
          ? colors.yellow(`${Math.round(durationMs)}ms`)
          : colors.green(`${Math.round(durationMs)}ms`);

    console.log(colors.bgGreen(`Login took ${totalTime}`));
    return {
      success: true as const,
      sessionUser: user,
    };
  }),
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
