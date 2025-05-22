import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { SESSION_KEY } from "~/lib/keys";
import { type HausSession } from "~/lib/session";

import { useServerSession } from "~/lib/session";

export const serverFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<HausSession> => {
    const session = await useServerSession();

    // capture the flash
    const flash = session.data.flash;

    if (flash) {
      await session.update({ flash: undefined });
    }

    const sessionData = {
      ...session.data,
      // return the flash
      flash,
    };

    return sessionData;
  },
);

export const getSession = {
  queryOptions: () => {
    return queryOptions({
      queryKey: [SESSION_KEY],
      queryFn: serverFn,
    });
  },
  serverFn,
};
