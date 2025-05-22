import { type TRPCRouterRecord } from "@trpc/server";
import { publicProcedure } from "~/integrations/trpc/init";
import { decrypt } from "~/lib/session";
import cookie from "cookie";

export const sessionRouter = {
  get: publicProcedure.query(async ({ ctx }) => {
    const cookieHeader = ctx.req.headers.get("cookie");
    const cookies = cookie.parse(cookieHeader ?? "");
    const session = await decrypt(cookies.haus);

    return (
      session ?? {
        user: undefined,
      }
    );
  }),
} satisfies TRPCRouterRecord;
