import { useQueryClient } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import type { ProcedureOptions } from "~/server/api/root";

import { useAuth } from "~/components/auth-provider";
import { api } from "~/trpc/react";

export function useCreateSet() {
  const router = useRouter();
  const utilities = api.useUtils();

  const qc = useQueryClient();

  return api.games.createRiuSet.useMutation({
    onMutate: () => {
      utilities.games.listUpcomingRiuRoster.cancel();
    },
    onSuccess: () => {
      toast.success("Set created");

      // https://tanstack.com/query/latest/docs/framework/react/guides/migrating-to-v5#hydration-api-changes
      // https://github.com/TanStack/query/discussions/3169#discussioncomment-12437333
      // to avoid flashing stale data due to hydration now happening in an
      // effect, removing the query before redirecting means the prefetched
      // value in the RSC will be used immediately
      qc.removeQueries({
        queryKey: getQueryKey(api.games.listUpcomingRiuRoster),
      });

      router.push("/games/rius/upcoming");
    },
  });
}

export function useCreateSubmission() {
  const queryClient = useQueryClient();

  return api.games.createRiuSubmission.useMutation({
    onError: (error) => {
      toast.error("Failed to create submission");
      console.error(error);
    },
    onSuccess: () => {
      toast.success("Submission created");
      queryClient.refetchQueries({
        queryKey: getQueryKey(api.games.listRiuSets, "active"),
      });
    },
  });
}

export function useDeleteSet(
  setId: number,
  arguments_: Pick<ProcedureOptions["games"]["deleteRiuSet"], "onSuccess">,
) {
  const utilities = api.useUtils();

  const { sessionUser } = useAuth();

  return api.games.deleteRiuSet.useMutation({
    onMutate: () => {
      utilities.games.listUpcomingRiuRoster.cancel();

      const previousData = utilities.games.listUpcomingRiuRoster.getData();

      utilities.games.listUpcomingRiuRoster.setData(undefined, (previous) => {
        const nextAuthUserSets =
          previous?.authUserSets?.filter((set) => set.id !== setId) ?? [];

        const nextRoster = { ...previous?.roster };
        if (sessionUser && nextAuthUserSets.length === 0) {
          delete nextRoster[sessionUser!.id];
        }

        return {
          authUserSets: nextAuthUserSets,
          roster: nextRoster,
        };
      });

      return { previousData };
    },
    onSettled: () => utilities.games.listUpcomingRiuRoster.invalidate(),
    onSuccess: (data, variables, context) => {
      toast.success("Set deleted");
      arguments_.onSuccess?.(data, variables, context);
    },
  });
}

export function useEditSet() {
  const router = useRouter();
  const utilities = api.useUtils();

  const qc = useQueryClient();

  return api.games.editRiuSet.useMutation({
    onMutate: () => {
      utilities.games.listUpcomingRiuRoster.cancel();
    },
    onSuccess: () => {
      toast.success("Set updated");
      // https://tanstack.com/query/latest/docs/framework/react/guides/migrating-to-v5#hydration-api-changes
      // https://github.com/TanStack/query/discussions/3169#discussioncomment-12437333
      // to avoid flashing stale data due to hydration now happening in an
      // effect, removing the query before redirecting means the prefetched
      // value in the RSC will be used immediately
      qc.removeQueries({
        queryKey: getQueryKey(api.games.listUpcomingRiuRoster),
      });
      router.push("/games/rius/upcoming");
    },
  });
}
