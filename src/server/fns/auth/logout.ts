import { redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";

import { useAppSession } from "~/lib/session";

const serverFn = createServerFn({ method: "POST" }).handler(async () => {
  const session = await useAppSession();
  await session.clear();
  throw redirect({ to: "/auth/login" });
});

export const logout = {
  serverFn,
};
