// import { TRPCError } from '@trpc/server'
import type { TRPCRouterRecord } from "@trpc/server";
// import { z } from 'zod'

import { createTRPCRouter, publicProcedure } from "./init";
import { authRouter } from "~/integrations/trpc/routers/auth";
import { gamesRouter } from "~/integrations/trpc/routers/games";
import { googleMapsRouter } from "~/integrations/trpc/routers/google-maps";
import { messagesRouter } from "~/integrations/trpc/routers/messages";
import { postRouter } from "~/integrations/trpc/routers/post";
import { reactionRouter } from "~/integrations/trpc/routers/reaction";
import { userRouter } from "~/integrations/trpc/routers/user";

export const trpcRouter = createTRPCRouter({
  auth: authRouter,
  games: gamesRouter,
  googleMaps: googleMapsRouter,
  messages: messagesRouter,
  post: postRouter,
  reaction: reactionRouter,
  user: userRouter,
});
export type TRPCRouter = typeof trpcRouter;
