import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { getUser } from "~/server/fns/users/get";
import { UserView } from "~/views/user";

export const Route = createFileRoute("/users/$userId")({
  component: RouteComponent,
  params: {
    parse: getUser.schema.parse,
  },
  loader: async ({ context, params: { userId } }) => {
    await context.queryClient.ensureQueryData(getUser.queryOptions({ userId }));
  },
});

function RouteComponent() {
  const { userId } = Route.useParams();
  const { data } = useSuspenseQuery(getUser.queryOptions({ userId }));

  return <UserView user={data} />;
}
