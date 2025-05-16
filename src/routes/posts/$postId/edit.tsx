import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { merge } from "lodash-es";

import { PostForm } from "~/components/forms/post";
import { POSTS_KEY } from "~/lib/keys";
import { getPost } from "~/server/fns/posts/get";
import { updatePost } from "~/server/fns/posts/update";
import { setFlash } from "~/server/fns/session/flash/set";
import { toast } from "sonner";

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
  const navigate = useNavigate();

  const qc = useQueryClient();

  const { mutate } = useMutation({
    mutationFn: updatePost.serverFn,
    onMutate: ({ data }) => {
      qc.cancelQueries({
        queryKey: [POSTS_KEY, postId],
      });

      const prev = qc.getQueryData([POSTS_KEY, postId]);

      qc.setQueryData([POSTS_KEY, postId], (prev) => merge(prev, data));

      navigate({ to: "/posts/$postId", params: { postId } });

      return {
        prev,
      };
    },
    onSuccess: async () => {
      await qc.refetchQueries({
        exact: true,
        queryKey: [POSTS_KEY, {}],
      });
    },
    onError: (error, _variables, context) => {
      console.error(error);
      if (context) {
        qc.setQueryData([POSTS_KEY, postId], context.prev);
        toast.error("Failed to update post");
        navigate({ to: "/posts/$postId/edit", params: { postId } });
      }
    },
    onSettled: () => {
      qc.invalidateQueries({
        queryKey: [POSTS_KEY, postId],
      });
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
