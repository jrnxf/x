import { eq } from "drizzle-orm";
import { cache } from "react";
import { checkSession } from "src/lib/session";

import { db } from "~/db";
import { users } from "~/db/schema";

// DATA ACCESS LAYER - look up more techniques on this
// https://youtu.be/N_sUsq_y10U?t=337

// 'cache' allows us to call this in multiple components, but only one request
// will be sent when rendering a route
export const requireUser = cache(async () => {
  const sessionUser = await checkSession();

  if (!sessionUser) return null;

  try {
    const user = await db.query.users.findFirst({
      columns: {
        email: true,
        id: true,
        name: true,
      },
      where: eq(users.id, sessionUser.id),
    });

    return user;
  } catch {
    return null;
  }
});
