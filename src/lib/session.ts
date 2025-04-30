import { rootRouteId } from "@tanstack/react-router";

import { useRouteContext } from "@tanstack/react-router";

export function useSessionData() {
  const rootRouteContext = useRouteContext({ from: rootRouteId });
  return rootRouteContext.session;
}

export function useSessionFlash() {
  const session = useSessionData();
  return session.flash;
}

export function useSessionUser() {
  const session = useSessionData();
  return session.user;
}
