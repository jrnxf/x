import { redirect } from "@tanstack/react-router";
import { createMiddleware } from "@tanstack/react-start";

import { useAppSession } from "~/server/session";

export const authMiddleware = createMiddleware().server(async ({ next }) => {
  const session = await useAppSession();

  if (!session.data?.user) {
    throw redirect({ to: "/auth/login" });
  }

  return next({
    context: {
      user: session.data.user,
    },
  });
});
