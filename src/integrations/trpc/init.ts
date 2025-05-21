import { TRPCError, initTRPC } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";

import { db } from "~/db";
import { timingMiddleware } from "~/integrations/trpc/middleware";
import { type EnhancedErrorShape } from "~/integrations/trpc/types";
import { useServerSession } from "~/server/session";

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API.
 *
 * These allow you to access things when processing a request, like the database, the session, etc.
 *
 * This helper generates the "internals" for a tRPC context. The API handler and RSC clients each
 * wrap this and provides the required context.
 *
 * @see https://trpc.io/docs/server/context
 */
export const createTRPCContext = async (opts: { headers: Headers }) => {
  const session = await useServerSession();

  return {
    db,
    user: session.data.user,
    ...opts,
  };
};

/**
 *
 * This is where the tRPC API is initialized, connecting the context and transformer. We also parse
 * ZodErrors so that you get typesafety on the frontend if your procedure fails due to validation
 * errors on the backend.
 */
export const t = initTRPC.context<typeof createTRPCContext>().create({
  errorFormatter({ error, shape }) {
    const formattedError: EnhancedErrorShape = shape;

    if (error.cause instanceof ZodError) {
      formattedError.data.zodError = error.cause.flatten();
    }

    return formattedError;
  },
  transformer: superjson,
});

/**
 * Public (unauthenticated) procedure
 *
 * This is the base piece you use to build new queries and mutations on your tRPC API. It does not
 * guarantee that a user querying is authorized, but you can still access user session data if they
 * are logged in.
 */
export const publicProcedure = t.procedure.use(timingMiddleware);

/**
 * Authenticated procedure
 *
 * This procedure ensures that the user is authenticated.
 */
export const authProcedure = t.procedure
  .use(async (opts) => {
    if (!opts.ctx.user) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    return opts.next({
      ctx: { ...opts.ctx, user: opts.ctx.user },
    });
  })
  .use(timingMiddleware);
