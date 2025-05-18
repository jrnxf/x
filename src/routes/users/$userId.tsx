import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { getFollows } from "~/server/fns/users/follows/get";

import { getUser } from "~/server/fns/users/get";
import { UserView } from "~/views/user";

export const Route = createFileRoute("/users/$userId")({
  component: RouteComponent,
  params: {
    parse: getUser.schema.parse,
  },
  loader: async ({ context, params: { userId } }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(getUser.queryOptions({ userId })),
      context.queryClient.ensureQueryData(getFollows.queryOptions({ userId })),
    ]);
  },
});

function RouteComponent() {
  const { userId } = Route.useParams();
  const { data } = useSuspenseQuery(getUser.queryOptions({ userId }));

  return <UserView user={data} />;
}
