import { createAPIFileRoute } from "@tanstack/react-start/api";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { createTRPCContext } from "~/integrations/trpc/init";
import { trpcRouter } from "~/integrations/trpc/router";

function handler({ request }: { request: Request }) {
  const heads = new Headers(request.headers);
  heads.set("x-trpc-source", "ssr");

  return fetchRequestHandler({
    req: request,
    router: trpcRouter,
    endpoint: "/api/trpc",
    createContext: () => createTRPCContext({ headers: heads }),
  });
}

export const APIRoute = createAPIFileRoute("/api/trpc/$")({
  GET: handler,
  POST: handler,
});
