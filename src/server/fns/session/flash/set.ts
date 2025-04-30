import { createServerFn } from "@tanstack/react-start";

import { z } from "zod";
import { useAppSession } from "~/server/session";

const schema = z.string();

const serverFn = createServerFn({
  method: "POST",
})
  .validator(schema)
  .handler(async ({ data: message }) => {
    const session = await useAppSession();
    await session.update({ flash: message });
  });

export const setFlash = {
  schema,
  serverFn,
};
