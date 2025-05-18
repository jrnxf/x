import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { USER_FOLLOWS_KEY } from "~/lib/keys";
import { useSessionUser } from "~/lib/session";
import { createFollow } from "~/server/fns/users/follows/create";
import { deleteFollow } from "~/server/fns/users/follows/delete";
import { getFollows } from "~/server/fns/users/follows/get";

export function useFollows({ userId }: { userId: number }) {
  const { data } = useSuspenseQuery(getFollows.queryOptions({ userId }));

  const qc = useQueryClient();

  const { isPending: isFollowing, mutate: follow } = useMutation({
    mutationFn: createFollow.serverFn,
    onMutate: () => {
      qc.cancelQueries({
        queryKey: [USER_FOLLOWS_KEY(userId)],
      });

      const prev = qc.getQueryData([USER_FOLLOWS_KEY(userId)]);

      qc.setQueryData([USER_FOLLOWS_KEY(userId)], (previous) => {
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

      return { previousData: prev };
    },
    onError: (error, _variables, context) => {
      console.error(error);
      if (context) {
        qc.setQueryData([USER_FOLLOWS_KEY(userId)], context.previousData);
        toast.error("Failed to follow user");
      }
    },
    onSettled: () => {
      qc.invalidateQueries({
        queryKey: [USER_FOLLOWS_KEY(userId)],
      });
    },
  });

  const { isPending: isUnfollowing, mutate: unfollow } = useMutation({
    mutationFn: deleteFollow.serverFn,
    onMutate: () => {
      qc.cancelQueries({
        queryKey: [USER_FOLLOWS_KEY(userId)],
      });

      const previousData = qc.getQueryData([USER_FOLLOWS_KEY(userId)]);

      qc.setQueryData([USER_FOLLOWS_KEY(userId)], (previous) => {
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
    onError: (error, _variables, context) => {
      console.error(error);
      if (context) {
        qc.setQueryData([USER_FOLLOWS_KEY(userId)], context.previousData);
        toast.error("Failed to unfollow user");
      }
    },
    onSettled: () => {
      qc.invalidateQueries({
        queryKey: [USER_FOLLOWS_KEY(userId)],
      });
    },
  });

  const sessionUser = useSessionUser();

  const authUserFollowsUser = data.followers.users.some(
    (user) => user.id === sessionUser?.id,
  );

  const action = authUserFollowsUser ? unfollow : follow;
  const isPending = authUserFollowsUser ? isUnfollowing : isFollowing;

  return { action, authUserFollowsUser, data, isPending };
}
