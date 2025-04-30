import { createServerFn } from "@tanstack/react-start";

import { useServerSession } from "~/lib/session";

export const serverFn = createServerFn({ method: "GET" }).handler(async () => {
  const session = await useServerSession();

  // capture the flash
  const flash = session.data.flash;

  if (flash) {
    await session.update({ flash: undefined });
  }

  return {
    ...session.data,
    // return the flash
    flash,
  };
});

export const getSession = {
  serverFn,
};
