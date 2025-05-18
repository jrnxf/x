import { useSessionUser } from "~/lib/session";
import { api } from "~/trpc/react";

export function useLikeUnlikePost(postId: number) {
  const sessionUser = useSessionUser();

  const utilities = api.useUtils();

  const likeUnlike = api.reaction.react.useMutation<{
    previousData: ReturnType<typeof utilities.post.get.getData>;
  }>({
    onError: (_error, _newLikeUnlike, context) => {
      if (context) {
        utilities.post.get.setData(postId, context.previousData);
      }
    },
    onMutate: (data) => {
      utilities.post.get.cancel(postId);

      const previousData = utilities.post.get.getData(postId);

      utilities.post.get.setData(postId, (post) => {
        if (sessionUser && post) {
          if (data.action === "like") {
            return {
              ...post,
              likes: [
                ...post.likes,
                {
                  postId,
                  user: sessionUser,
                  userId: sessionUser.id,
                },
              ],
            };
          } else if (data.action === "unlike") {
            return {
              ...post,
              likes: post.likes.filter(
                (like) => like.userId !== sessionUser.id,
              ),
            };
          }
        }
      });

      return { previousData };
    },
    onSettled: () => {
      utilities.post.get.invalidate(postId);
    },
  });

  return likeUnlike;
}
