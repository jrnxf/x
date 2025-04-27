import { useAuth } from "~/components/auth-provider";
import { trpc } from "~/trpc";

export function useFollows({ userId }: { userId: number }) {
  const [data] = trpc.user.follows.useSuspenseQuery({
    userId,
  });

  const utilities = trpc.useUtils();

  const { isPending: isFollowing, mutate: follow } =
    trpc.user.follow.useMutation({
      onMutate: () => {
        utilities.user.follows.cancel();

        const previousData = utilities.user.follows.getData();

        utilities.user.follows.setData({ userId }, (previous) => {
          if (previous && sessionUser) {
            return {
              ...previous,
              followers: {
                count: previous.followers.count + 1,
                users: [
                  ...previous.followers.users,
                  {
                    avatarUrl: sessionUser.avatarUrl,
                    id: sessionUser.id,
                    name: sessionUser.name,
                  },
                ],
              },
            };
          }
        });

        return { previousData };
      },
      onSettled: () => {
        utilities.user.follows.invalidate();
      },
    });

  const { isPending: isUnfollowing, mutate: unfollow } =
    trpc.user.unfollow.useMutation({
      onMutate: () => {
        utilities.user.follows.cancel();

        const previousData = utilities.user.follows.getData();

        utilities.user.follows.setData({ userId }, (previous) => {
          if (previous && sessionUser) {
            return {
              ...previous,
              followers: {
                count: previous.followers.count - 1,
                users: previous.followers.users.filter(
                  (user) => user.id !== sessionUser.id,
                ),
              },
            };
          }
        });

        return { previousData };
      },
      onSettled: () => {
        utilities.user.follows.invalidate();
      },
    });

  const { sessionUser } = useAuth();

  const authUserFollowsUser = data.followers.users.some(
    (user) => user.id === sessionUser?.id,
  );

  const action = authUserFollowsUser ? unfollow : follow;
  const isPending = authUserFollowsUser ? isUnfollowing : isFollowing;

  return { action, authUserFollowsUser, data, isPending };
}
