import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { getPost } from "~/server/fns/posts/get";
import { PostView } from "~/views/post";

const pathParametersSchema = z.object({
  postId: z.coerce.number(),
});

export const Route = createFileRoute("/posts/$postId/")({
  component: RouteComponent,
  params: {
    parse: pathParametersSchema.parse,
  },
  loader: async ({ context, params: { postId } }) => {
    await context.queryClient.ensureQueryData(getPost.queryOptions({ postId }));
  },
});

function RouteComponent() {
  const { postId } = Route.useParams();
  const { data } = useSuspenseQuery(getPost.queryOptions({ postId }));

  return (
    <div className="flex grow flex-col">
      <div
        className="mx-auto flex min-h-0 w-full max-w-xl grow flex-col gap-4 px-4 py-6"
        id="main-content"
      >
        <PostView
          initialData={{
            messages: [],
            post: data,
          }}
          postId={postId}
        />
      </div>
    </div>
  );
}
