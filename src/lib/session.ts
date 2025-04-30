import { rootRouteId, useRouteContext } from "@tanstack/react-router";
import { useSession } from "@tanstack/react-start/server";
import { z } from "zod";

import { env } from "~/lib/env";

export const sessionSchema = z.object({
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

export type Session = z.infer<typeof sessionSchema>;

export function useAppSession() {
  return useSession<Session>({
    name: "haus-session",
    password: env.SESSION_SECRET,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    },
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
}

export function useServerSession() {
  return useSession<Session>({
    name: "haus-session",
    password: env.SESSION_SECRET,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    },
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
}

export function useSessionData() {
  const rootRouteContext = useRouteContext({ from: rootRouteId });
  return rootRouteContext.session;
}

export function useSessionFlash() {
  const session = useSessionData();
  return session.flash;
}

export function useSessionUser() {
  const session = useSessionData();
  return session.user;
}
