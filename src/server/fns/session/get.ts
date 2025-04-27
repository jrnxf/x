import { createServerFn } from "@tanstack/react-start";

import { useAppSession } from "~/lib/session";

export const serverFn = createServerFn({ method: "GET" }).handler(async () => {
  const session = await useAppSession();
  return session.data;
});

export const getSession = {
  serverFn,
};
