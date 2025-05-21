import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  rootRouteId,
  useNavigate,
  useRouteContext,
  useRouter,
  useSearch,
} from "@tanstack/react-router";
import { toast } from "sonner";
import { z } from "zod";
import { useTRPC } from "~/integrations/trpc/react";

export const hausSessionSchema = z.object({
  flash: z.string().optional(),
  user: z
    .object({
      avatarUrl: z.string().nullable(),
      email: z.string().email(),
      id: z.number(),
      name: z.string(),
    })
    .optional(),
});

export type HausSession = z.infer<typeof hausSessionSchema>;

export function useSessionUser() {
  const { session } = useRouteContext({ from: rootRouteId });
  return session.user;
}

export function useSessionFlash() {
  const { session } = useRouteContext({ from: rootRouteId });
  return session.flash;
}

export function useLogout() {
  const trpc = useTRPC();
  const router = useRouter();
  const navigate = useNavigate();

  const qc = useQueryClient();

  const { mutate } = useMutation(
    trpc.auth.logout.mutationOptions({
      onMutate: async () => {
        qc.cancelQueries({ queryKey: trpc.session.get.queryKey() });
      },
      onSuccess: async () => {
        qc.setQueryData(trpc.session.get.queryKey(), (prev) => ({
          ...prev,
          user: undefined,
        }));

        await router.invalidate();

        navigate({ to: "/auth/login" });
      },
      onSettled: () => {
        qc.invalidateQueries({ queryKey: trpc.session.get.queryKey() });
      },
    }),
  );

  return mutate;
}

export function useSendMagicLink() {
  const trpc = useTRPC();
  const search = useSearch({ from: "/auth/login" });

  const navigate = useNavigate();

  // const qc = useQueryClient();

  const sendMagicLinkMutation = useMutation(
    trpc.email.sendMagicLink.mutationOptions({
      onSuccess: async (data) => {
        toast.success("Magic link sent");
        navigate({ to: "/" });
        // if (data.success) {
        //   qc.setQueryData(trpc.session.get.queryKey(), (prev) => ({
        //     ...prev,
        //     user: data.sessionUser,
        //   }));

        //   const redirectPath = search?.redirect ?? "/";

        //   navigate({ to: redirectPath });
        // }
      },
    }),
  );

  return sendMagicLinkMutation;
}
