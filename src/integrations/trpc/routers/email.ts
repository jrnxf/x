import { type TRPCRouterRecord } from "@trpc/server";

import MagicLinkTemplate from "emails/magic-link";
import { z } from "zod";
import { publicProcedure } from "~/integrations/trpc/init";

import { Resend } from "resend";
import { env } from "~/lib/env";
import { magicLinks, users } from "~/db/schema";
import { nanoid } from "nanoid";
import { eq } from "drizzle-orm";

const resend = new Resend(env.RESEND_API_KEY);

export const emailRouter = {
  sendMagicLink: publicProcedure
    .input(
      z.object({
        email: z.string().trim().email().toLowerCase(),
        redirect: z.string().optional().default("/auth/me"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userWithEmail = await ctx.db.query.users.findFirst({
        where: eq(users.email, input.email),
      });

      if (!userWithEmail) {
        // we don't want to give potential attackers any information about
        // whether an email exists or not
        return;
      }

      const [token] = await ctx.db
        .insert(magicLinks)
        .values({
          email: userWithEmail.email,
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
          redirect: input.redirect,
        }),
      });

      if (error) {
        console.error("❌ Email failed to send", error);
        // TODO: Log error to Sentry
        throw new Error(error.message);
      }

      if (data) {
        // log successful send to sentry
      }
    }),
} satisfies TRPCRouterRecord;
