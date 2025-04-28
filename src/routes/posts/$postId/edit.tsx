import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { z } from "zod";

import { PostForm } from "~/components/forms/post";
import { getPost } from "~/server/fns/posts/get";
import { updatePost } from "~/server/fns/posts/update";
import { setFlash } from "~/server/fns/session/flash/set";

const pathParametersSchema = z.object({
  postId: z.coerce.number(),
});

export const Route = createFileRoute("/posts/$postId/edit")({
  component: RouteComponent,
  params: {
    parse: pathParametersSchema.parse,
  },
  loader: async ({ context, params: { postId } }) => {
    const post = await context.queryClient.ensureQueryData(
      getPost.queryOptions({ postId }),
    );
    if (!post) {
      await setFlash.serverFn({ data: "Post not found" });
      throw redirect({ to: "/posts" });
    }
    if (post.userId !== context.session.user?.id) {
      await setFlash.serverFn({ data: "Access denied" });
      throw redirect({ to: "/posts" });
    }
  },
});

function RouteComponent() {
  const { postId } = Route.useParams();
  const { data: post } = useSuspenseQuery(getPost.queryOptions({ postId }));
  const router = useRouter();

  const queryClient = useQueryClient();

  const { mutate } = useMutation({
    mutationFn: updatePost.serverFn,
    onSuccess: async () => {
      await Promise.all([
        queryClient.refetchQueries({
          queryKey: ["posts", postId],
        }),
        queryClient.refetchQueries({
          exact: true,
          queryKey: ["posts"],
        }),
      ]);

      router.navigate({ params: { postId }, to: "/posts/$postId" });
    },
  });
  if (!post) {
    return null;
  }

  return (
    <div
      className="mx-auto flex min-h-0 w-full max-w-xl grow flex-col gap-4 px-4 py-6"
      id="main-content"
    >
      <PostForm
        defaultValues={{
          content: post.content,
          imageUrl: post.imageUrl,
          tags: post.tags ?? [],
          title: post.title,
          videoPlaybackId: post.video?.playbackId ?? undefined,
          videoUploadId: post.video?.uploadId ?? undefined,
        }}
        onSubmit={(data) => {
          mutate({
            data: {
              ...data,
              postId,
            },
          });
        }}
      />
    </div>
  );
}
