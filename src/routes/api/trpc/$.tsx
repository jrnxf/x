import { createAPIFileRoute } from "@tanstack/react-start/api";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { createTRPCContext } from "~/integrations/trpc/init";
import { trpcRouter } from "~/integrations/trpc/router";

function handler({ request }: { request: Request }) {
  return fetchRequestHandler({
    req: request,
    router: trpcRouter,
    endpoint: "/api/trpc",
    onError({ error }) {
      if (error.code === "INTERNAL_SERVER_ERROR") {
        // TODO send to sentry
      }
    },
    createContext: async ({ req }) => {
      return createTRPCContext({
        headers: req.headers,
      });
    },
  });
}

export const APIRoute = createAPIFileRoute("/api/trpc/$")({
  GET: handler,
  POST: handler,
});
