import { createServerFn } from "@tanstack/react-start";

import { useServerSession } from "~/server/session";

const serverFn = createServerFn({ method: "POST" }).handler(async () => {
  const session = await useServerSession();
  await session.clear();
});

export const logout = {
  serverFn,
};
