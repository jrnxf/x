import { type QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import {
  createRootRouteWithContext,
  HeadContent,
  Link,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import { NuqsAdapter } from "nuqs/adapters/react";
import { type ReactNode } from "react";

import { AuthButton, SessionJson } from "~/components/auth-button";
import { Button } from "~/components/ui/button";
import { Toaster } from "~/components/ui/sonner";
import { getSession } from "~/server/fns/session/get";
import appCss from "~/styles.css?url";

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
  beforeLoad: async () => {
    console.log("before load enter");
    const session = await getSession.serverFn();
    console.log("before load exit", session);
    return { session };
  },
  component: RootComponent,
  head: () => ({
    links: [
      { href: appCss, rel: "stylesheet" },
      {
        as: "font",
        crossOrigin: "anonymous",
        href: "/fonts/geist-mono-variable.woff2",
        rel: "preload",
        type: "font/woff2",
      },
    ],
    meta: [
      {
        charSet: "utf8",
      },
      {
        content: "width=device-width, initial-scale=1",
        name: "viewport",
      },
      {
        title: "une.haus",
      },
    ],
  }),
});

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  );
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="dark">
        <NuqsAdapter>
          {/* <ScrollBottomProvider> */}
          <nav className="sticky top-0 z-10 flex w-full items-center gap-2 border-b bg-white px-4 py-1.5 dark:bg-[#0a0a0a]">
            <Button asChild variant="ghost">
              <Link className="[&.active]:bg-secondary" to="/chat">
                chat
              </Link>
            </Button>
            <Button asChild variant="ghost">
              <Link className="[&.active]:bg-secondary" to="/posts">
                posts
              </Link>
            </Button>
            <Button asChild variant="ghost">
              <Link className="[&.active]:bg-secondary" to="/users">
                users
              </Link>
            </Button>
            <Button asChild variant="ghost">
              <Link className="[&.active]:bg-secondary" to="/games/rius/active">
                games
              </Link>
            </Button>
            <div className="grow" />
            <AuthButton />
          </nav>
          {children}
          <Toaster />
          {/* </ScrollBottomProvider> */}
        </NuqsAdapter>
        <ReactQueryDevtools buttonPosition="bottom-left" />
        <Scripts />
      </body>
    </html>
  );
}
