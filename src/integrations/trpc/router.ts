import { authRouter } from "~/integrations/trpc/routers/auth";
import { gamesRouter } from "~/integrations/trpc/routers/games";
import { googleMapsRouter } from "~/integrations/trpc/routers/google-maps";
import { messagesRouter } from "~/integrations/trpc/routers/messages";
import { postRouter } from "~/integrations/trpc/routers/post";
import { reactionRouter } from "~/integrations/trpc/routers/reaction";
import { sessionRouter } from "~/integrations/trpc/routers/session";
import { userRouter } from "~/integrations/trpc/routers/user";
import { createTRPCRouter } from "./init";

export const trpcRouter = createTRPCRouter({
  auth: authRouter,
  games: gamesRouter,
  googleMaps: googleMapsRouter,
  messages: messagesRouter,
  post: postRouter,
  reaction: reactionRouter,
  user: userRouter,
  session: sessionRouter,
});
export type TRPCRouter = typeof trpcRouter;
