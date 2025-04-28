import { createServerFn } from "@tanstack/react-start";

import { useAppSession } from "~/lib/session";

export const serverFn = createServerFn({ method: "GET" }).handler(async () => {
  const session = await useAppSession();

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
