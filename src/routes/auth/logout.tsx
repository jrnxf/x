import { createFileRoute } from "@tanstack/react-router";

import { logout } from "~/server/fns/auth/logout";

export const Route = createFileRoute("/auth/logout")({
  loader: () => logout.serverFn(),
  preload: false,
});
