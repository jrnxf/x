import { type TRPCRouterRecord } from "@trpc/server";

import MagicLinkTemplate from "emails/magic-link";
import { z } from "zod";
import { publicProcedure } from "~/integrations/trpc/init";

import { Resend } from "resend";
import { env } from "~/lib/env";
import { magicLinks } from "~/db/schema";
import { nanoid } from "nanoid";

const resend = new Resend(env.RESEND_API_KEY);

export const emailRouter = {
  sendMagicLink: publicProcedure
    .input(z.object({ email: z.string().trim().email().toLowerCase() }))
    .mutation(async ({ ctx, input }) => {
      const [token] = await ctx.db
        .insert(magicLinks)
        .values({
          email: input.email,
          id: nanoid(),
          expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
        })
        .returning();

      const { data, error } = await resend.emails.send({
        from: "Colby Thomas <colby@jrnxf.co>",
        to: [input.email],
        subject: "Welcome to une.haus!",
        react: MagicLinkTemplate({
          token: token.id,
        }),
      });

      if (error) {
        console.error("❌ Email failed to send", error);
        // TODO: Log error to Sentry
        throw new Error(error.message);
      }

      return { success: true, data };
    }),
} satisfies TRPCRouterRecord;
