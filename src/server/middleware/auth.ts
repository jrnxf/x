import { redirect } from "@tanstack/react-router";
import { createMiddleware } from "@tanstack/react-start";

import { useServerSession } from "~/lib/session";

export const authMiddleware = createMiddleware().server(async ({ next }) => {
  const session = await useServerSession();

  if (!session.data.user) {
    throw redirect({ to: "/auth/login" });
  }

  return next({
    context: {
      user: session.data.user,
    },
  });
});

export const authOptionalMiddleware = createMiddleware().server(
  async ({ next }) => {
    const session = await useServerSession();

    return next({
      context: {
        user: session.data.user,
      },
    });
  },
);
