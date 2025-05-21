import { type TRPCRouterRecord } from "@trpc/server";
import { publicProcedure } from "~/integrations/trpc/init";
import { useServerSession } from "~/server/session";

export const sessionRouter = {
  get: publicProcedure.query(async () => {
    const session = await useServerSession();

    return session.data;
  }),
} satisfies TRPCRouterRecord;
