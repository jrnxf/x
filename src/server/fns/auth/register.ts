import { redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "~/db";
import { users } from "~/db/schema";
import { baseAuthSchema } from "~/server/fns/auth/shared";

export const schema = baseAuthSchema.extend({
  bio: z.string().trim(),
  name: z.string().trim().min(1, { message: "Required" }),
});

const serverFn = createServerFn({ method: "POST" })
  .validator(schema)
  .handler(async ({ data }) => {
    const { password, ...args } = data;
    const user = await db.query.users.findFirst({
      where: eq(users.email, args.email),
    });

    if (user) {
      return {
        message: "Email taken",
        success: false as const,
      };
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await db.insert(users).values({
      ...args,
      password: hashedPassword,
    });

    throw redirect({ to: "/auth/login" });
  });

export const register = {
  schema,
  serverFn,
};
