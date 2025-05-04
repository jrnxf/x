import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import invariant from "tiny-invariant";
import { useSessionUser } from "~/lib/session";
import { getUser } from "~/server/fns/users/get";
import { UserView } from "~/views/user";

export const Route = createFileRoute("/auth/me")({
  component: RouteComponent,
  loader: async ({ context, location }) => {
    console.log("location", location);
    if (!context.session.user) {
      throw redirect({
        to: "/auth/login",
        search: { redirect: location.href },
      });
    }
    await context.queryClient.ensureQueryData(
      getUser.queryOptions({ userId: context.session.user!.id }),
    );
  },
});

function RouteComponent() {
  const sessionUser = useSessionUser();

  invariant(sessionUser, "Authentication required");

  const { data } = useSuspenseQuery(
    getUser.queryOptions({ userId: sessionUser.id }),
  );

  return <UserView user={data} />;
}
