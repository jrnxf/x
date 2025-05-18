import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { useTRPC } from "~/integrations/trpc/react";

import { UserView } from "~/views/user";

export const Route = createFileRoute("/users/$userId")({
  component: RouteComponent,
  params: {
    parse: z.object({
      userId: z.coerce.number(),
    }).parse,
  },
  loader: async ({ context, params: { userId } }) => {
    await context.queryClient.ensureQueryData(
      context.trpc.user.get.queryOptions({
        userId,
      }),
    );
  },
});

function RouteComponent() {
  const trpc = useTRPC();

  const { userId } = Route.useParams();
  const { data } = useSuspenseQuery(trpc.user.get.queryOptions({ userId }));

  return <UserView user={data} />;
}
