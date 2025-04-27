import { useSuspenseQuery } from "@tanstack/react-query";
import {
  createFileRoute,
  redirect,
  useRouteContext,
} from "@tanstack/react-router";

import { getUser } from "~/server/fns/users/get";
import { UserView } from "~/views/user";

export const Route = createFileRoute("/auth/me")({
  component: RouteComponent,
  loader: async ({ context }) => {
    if (!context.session.user) {
      throw redirect({ to: "/auth/login", search: { redirect: "/auth/me" } });
    }
    await context.queryClient.ensureQueryData(
      getUser.queryOptions({ userId: context.session.user!.id }),
    );
  },
});

function RouteComponent() {
  const {
    session: { user },
  } = useRouteContext({ from: "__root__" });
  const { data } = useSuspenseQuery(getUser.queryOptions({ userId: user!.id }));

  return <UserView user={data} />;
}
