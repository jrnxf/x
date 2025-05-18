import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { routerWithQueryClient } from "@tanstack/react-router-with-query";

import { CatchBoundary } from "./components/catch-boundary";
import { NotFound } from "./components/not-found";
import { routeTree } from "./routeTree.gen";
import * as TanstackQuery from "./integrations/tanstack-query/root-provider";

export function createRouter() {
  const router = routerWithQueryClient(
    createTanStackRouter({
      routeTree,
      context: {
        ...TanstackQuery.getContext(),
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
          <TanstackQuery.Provider>{props.children}</TanstackQuery.Provider>
        );
      },
    }),
    TanstackQuery.getContext().queryClient,
  );

  return router;
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof createRouter>;
  }
}
