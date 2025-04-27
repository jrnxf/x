"use server";

import { checkSession, type SessionUser } from "~/lib/session";

type SessionUserSuspendedProperties = {
  children: (sessionUser: SessionUser | undefined) => React.ReactNode;
};

/**
 * This component should always be wrapped in a Suspense boundary so as much as
 * the page that calls it can be statically rendered as possible
 */
export async function SessionUserProvider({
  children,
}: SessionUserSuspendedProperties) {
  const sessionUser = await checkSession();

  return <>{children(sessionUser)}</>;
}
