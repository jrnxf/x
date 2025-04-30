import { redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";

import { useServerSession } from "~/server/session";

const serverFn = createServerFn({ method: "POST" }).handler(async () => {
  const session = await useServerSession();
  await session.clear();
  throw redirect({ to: "/auth/login" });
});

export const logout = {
  serverFn,
};
