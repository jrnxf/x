"use server";

import { checkSession } from "~/lib/session";

/**
 * This component should always be wrapped in a Suspense boundary so as much as
 * the page that calls it can be statically rendered as possible
 */
export async function AdminOnlySuspended({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Suspended>{children}</Suspended>;
}

async function Suspended({ children }: { children: React.ReactNode }) {
  const sessionUser = await checkSession();

  return sessionUser && sessionUser.id === 1 ? <>{children}</> : null;
}
