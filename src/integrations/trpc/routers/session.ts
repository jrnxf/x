import { createTRPCRouter, publicProcedure } from "~/integrations/trpc/init";
import { useServerSession } from "~/server/session";

export const sessionRouter = createTRPCRouter({
  get: publicProcedure.query(async () => {
    const session = await useServerSession();

    console.log("session in router", session.data);
    return session.data;
  }),
});
