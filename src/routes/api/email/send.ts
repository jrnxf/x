import { json } from "@tanstack/react-start";
import { createAPIFileRoute } from "@tanstack/react-start/api";
import EmailTemplate from "emails/hello";

import { Resend } from "resend";
import { env } from "~/lib/env";

const resend = new Resend(env.RESEND_API_KEY);

export const APIRoute = createAPIFileRoute("/api/email/send")({
  // TODO: make this a POST
  GET: async () => {
    const { data, error } = await resend.emails.send({
      from: "Colby Thomas <colby@jrnxf.co>",
      to: ["colby@jrnxf.co"],
      subject: "Welcome to une.haus!",
      react: EmailTemplate(),
    });

    if (error) {
      console.error("❌ Email failed to send", error);
      // TODO: Log error to Sentry
      return json({ success: false, error: error.message }, { status: 500 });
    }

    console.log("📤 Email successfully sent", data);

    return json({ success: true });
  },
});
