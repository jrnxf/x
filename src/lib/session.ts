import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  useNavigate,
  useRouteContext,
  useSearch,
} from "@tanstack/react-router";
import { rootRouteId } from "@tanstack/react-router";
import { z } from "zod";
import { SESSION_KEY } from "~/lib/keys";
import { login } from "~/server/fns/auth/login";
import { logout } from "~/server/fns/auth/logout";

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
  const navigate = useNavigate();

  const qc = useQueryClient();

  const { mutate } = useMutation({
    mutationFn: logout.serverFn,
    onSuccess: async () => {
      qc.setQueryData([SESSION_KEY], (prev: HausSession): HausSession => {
        return {
          ...prev,
          user: undefined,
        };
      });

      navigate({ to: "/auth/login" });
    },
  });

  return () => {
    mutate({});
  };
}

export function useLogin() {
  const search = useSearch({ from: "/auth/login" });

  const navigate = useNavigate();

  const qc = useQueryClient();

  const loginMutation = useMutation({
    mutationFn: login.serverFn,
    onSuccess: async (data) => {
      if (data.success) {
        qc.setQueryData(
          [SESSION_KEY],
          (prev: HausSession): HausSession => ({
            ...prev,
            user: data.sessionUser,
          }),
        );

        const redirectPath = search?.redirect ?? "/auth/me";

        navigate({ to: redirectPath });
      }
    },
  });

  return loginMutation;
}
