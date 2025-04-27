import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";

import { PostForm } from "~/components/forms/post";
import { createPost } from "~/server/fns/posts/create";

export const Route = createFileRoute("/posts/create")({
  component: RouteComponent,
  loader: async ({ context }) => {
    if (!context.session.user) {
      throw redirect({
        search: { redirect: "/posts/create" },
        to: "/auth/login",
      });
    }
  },
});

function RouteComponent() {
  const router = useRouter();

  const queryClient = useQueryClient();

  const { mutate } = useMutation({
    mutationFn: createPost.serverFn,
    onSuccess: async (data) => {
      await queryClient.refetchQueries({
        exact: true,
        queryKey: ["posts"],
      });

      router.navigate({ params: { postId: data.id }, to: "/posts/$postId" });
    },
  });

  return (
    <div
      className="mx-auto flex min-h-0 w-full max-w-xl grow flex-col gap-4 px-4 py-6"
      id="main-content"
    >
      <PostForm
        onSubmit={(data) => {
          mutate({ data });
        }}
      />
    </div>
  );
}
