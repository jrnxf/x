import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import superjson from "superjson";
import { routerWithQueryClient } from "@tanstack/react-router-with-query";

import { CatchBoundary } from "./components/catch-boundary";
import { NotFound } from "./components/not-found";
import { routeTree } from "./routeTree.gen";
import { QueryClient } from "@tanstack/react-query";
import { createIsomorphicFn } from "@tanstack/react-start";
import { getHeaders } from "@tanstack/react-start/server";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { type TRPCRouter } from "~/integrations/trpc/router";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import { TRPCProvider } from "~/integrations/trpc/react";

const getUrl = () => {
  const base = (() => {
    if (typeof globalThis.window !== "undefined") return "";
    return `http://localhost:${process.env.PORT ?? 3000}`;
  })();
  return `${base}/api/trpc`;
};

const getIncomingHeaders = createIsomorphicFn()
  .client(() => ({}))
  .server(() => getHeaders());

export function createRouter() {
  const queryClient = new QueryClient({
    defaultOptions: {
      dehydrate: { serializeData: superjson.serialize },
      hydrate: { deserializeData: superjson.deserialize },
    },
  });

  const trpcClient = createTRPCClient<TRPCRouter>({
    links: [
      httpBatchLink({
        // https://discord-questions.trpc.io/m/1354258180456321135
        headers: () => {
          console.log("headers");
          const headers = getIncomingHeaders();
          return headers;
        },
        transformer: superjson,
        url: getUrl(),
      }),
    ],
  });

  const serverHelpers = createTRPCOptionsProxy({
    client: trpcClient,
    queryClient: queryClient,
  });

  const router = routerWithQueryClient(
    createTanStackRouter({
      routeTree,
      context: {
        trpc: serverHelpers,
        queryClient,
        session: {},
      },
      defaultPreload: "intent",
      // react-query will handle data fetching & caching
      // https://tanstack.com/router/latest/docs/framework/react/guide/data-loading#passing-all-loader-events-to-an-external-cache
      defaultPreloadStaleTime: 0,

      scrollRestoration: true,
      // scroll to top of main tag in addition to window
      scrollToTopSelectors: ["main"],

      defaultErrorComponent: CatchBoundary,
      defaultNotFoundComponent: () => <NotFound />,

      defaultStructuralSharing: true,
      Wrap: (props: { children: React.ReactNode }) => {
        return (
          <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
            {props.children}
          </TRPCProvider>
        );
      },
    }),
    queryClient,
  );

  return router;
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof createRouter>;
  }
}
