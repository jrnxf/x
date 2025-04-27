import { QueryClient } from "@tanstack/react-query";
import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { routerWithQueryClient } from "@tanstack/react-router-with-query";

import { CatchBoundary } from "./components/catch-boundary";
import { NotFound } from "./components/not-found";
import { routeTree } from "./routeTree.gen";

// NOTE: Most of the integration code found here is experimental and will
// definitely end up in a more streamlined API in the future. This is just
// to show what's possible with the current APIs.

export function createRouter() {
  const queryClient = new QueryClient();

  return routerWithQueryClient(
    createTanStackRouter({
      context: { queryClient },
      defaultErrorComponent: CatchBoundary,
      defaultNotFoundComponent: () => <NotFound />,
      defaultPreload: "intent",
      routeTree,
      scrollRestoration: true,
    }),
    queryClient,
  );
}

declare module "@tanstack/react-router" {
  type Register = {
    router: ReturnType<typeof createRouter>;
  };
}
