import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { toast } from "sonner";

import { PostForm } from "~/components/forms/post";
import { useTRPC } from "~/integrations/trpc/react";

export const Route = createFileRoute("/posts/create")({
  component: RouteComponent,
  loader: async ({ context, location }) => {
    if (!context.session.user) {
      throw redirect({
        to: "/auth/login",
        search: {
          redirect: location.href,
        },
      });
    }
  },
});

function RouteComponent() {
  const router = useRouter();
  const trpc = useTRPC();
  const qc = useQueryClient();

  const { mutate } = useMutation(
    trpc.post.create.mutationOptions({
      onSuccess: async (data) => {
        // no need to await - fire and forget. will almost definitely finish
        // before the user can navigate there
        qc.refetchQueries({
          queryKey: trpc.post.list.queryKey(),
        });

        router.navigate({ params: { postId: data.id }, to: "/posts/$postId" });
      },
      onError: (error) => {
        console.error(error);
        toast.error("Failed to create post");
        router.navigate({ to: "/posts/create" });
      },
    }),
  );

  return (
    <div
      className="mx-auto flex min-h-0 w-full max-w-xl grow flex-col gap-4 px-4 py-6"
      id="main-content"
    >
      <PostForm onSubmit={mutate} />
    </div>
  );
}
