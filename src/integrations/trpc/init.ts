import { TRPCError, initTRPC } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";

import { db } from "~/db";
import { useServerSession } from "~/server/session";
// import { checkSession } from "~/lib/session";

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
 * 2. INITIALIZATION
 *
 * This is where the tRPC API is initialized, connecting the context and transformer. We also parse
 * ZodErrors so that you get typesafety on the frontend if your procedure fails due to validation
 * errors on the backend.
 */
const t = initTRPC.context<typeof createTRPCContext>().create({
  errorFormatter({ error, shape }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
  transformer: superjson,
});

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your tRPC API. You should import these a lot in the
 * "/src/server/api/routers" directory.
 */

/**
 * This is how you create new routers and sub-routers in your tRPC API.
 *
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router;

/**
 * 4. PROCEDURES
 *
 * These are the procedures that you use to build your tRPC API. You should import these a lot in the
 * "/src/server/api/routers" directory.
 */

/**
 * Public (unauthenticated) procedure
 *
 * This is the base piece you use to build new queries and mutations on your tRPC API. It does not
 * guarantee that a user querying is authorized, but you can still access user session data if they
 * are logged in.
 */
export const publicProcedure = t.procedure.use(loggingMiddleware);

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
  .use(loggingMiddleware);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function loggingMiddleware(opts: any) {
  const start = Date.now();

  const result = await opts.next();

  const durationMs = Date.now() - start;

  const time = durationMs > 1000 ? `${durationMs / 1000}s` : `${durationMs}ms`;

  const source = opts.ctx?.headers?.get?.("x-trpc-source");

  const message = `${source ?? "unknown"}>${opts.type}>${opts.path}: ${time}`;

  console.log(result.ok ? "✅" : "❌", message);

  return result;
}
