import { getHeaders, useSession } from "@tanstack/react-start/server";
import { env } from "~/lib/env";
import { type HausSession } from "~/lib/session";

export async function useServerSession() {
  const session = await useSession<HausSession>({
    name: "haus-session",
    password: env.SESSION_SECRET,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    },
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  const heads = getHeaders();
  console.log({
    sessionId: session.id,
    sessionData: session.data,
    heads,
  });

  return session;
}
