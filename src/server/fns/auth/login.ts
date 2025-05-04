import { createServerFn } from "@tanstack/react-start";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "~/db";
import { users } from "~/db/schema";
import { useServerSession } from "~/server/session";
import { baseAuthSchema } from "~/server/fns/auth/shared";

export const schema = baseAuthSchema.extend({
  redirect: z.string().optional().default("/auth/me"),
});

export const serverFn = createServerFn({ method: "POST" })
  .validator(schema)
  .handler(async ({ data }) => {
    const userWithPassword = await db.query.users.findFirst({
      columns: {
        avatarUrl: true,
        email: true,
        id: true,
        name: true,
        password: true,
      },
      where: eq(users.email, data.email),
    });

    if (!userWithPassword) {
      return {
        errorMessage: "User not found",
        success: false,
      } as const;
    }

    const { password, ...user } = userWithPassword;

    const isCorrectPassword = await bcrypt.compare(data.password, password);

    if (!isCorrectPassword) {
      return {
        errorMessage: "Invalid credentials",
        success: false,
      } as const;
    }

    // Create a session
    const session = await useServerSession();

    await session.update({ user });

    return {
      success: true as const,
      sessionUser: user,
    };
  });

export const login = {
  schema,
  serverFn,
};
