import { createServerFn } from "@tanstack/react-start";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "~/db";
import { users } from "~/db/schema";
import { useAppSession } from "~/lib/session";
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
        message: "User not found",
        success: false,
      };
    }

    const { password, ...user } = userWithPassword;

    const isCorrectPassword = await bcrypt.compare(data.password, password);

    if (!isCorrectPassword) {
      return {
        message: "Invalid credentials",
        success: false,
      };
    }

    // Create a session
    const session = await useAppSession();

    await session.update({ user });

    return {
      success: true,
    };
  });

export const login = {
  schema,
  serverFn,
};
