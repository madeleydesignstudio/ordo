import { json } from "@tanstack/react-start";
import { createServerFileRoute } from "@tanstack/react-start/server";
import { sendEmail, PasswordResetEmail, render } from "@ordo/emails";

interface SendResetEmailRequest {
  email: string;
  name?: string;
  resetUrl: string;
  expiresIn?: string;
}

export const ServerRoute = createServerFileRoute(
  "/api/send-reset-email",
).methods({
  POST: async ({ request }) => {
    try {
      const body = (await request.json()) as SendResetEmailRequest;
      const { email, name = "there", resetUrl, expiresIn = "1 hour" } = body;

      // Validate required fields
      if (!email) {
        return json({ error: "Email is required" }, { status: 400 });
      }

      if (!resetUrl) {
        return json({ error: "Reset URL is required" }, { status: 400 });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return json({ error: "Invalid email format" }, { status: 400 });
      }

      // Validate reset URL format
      try {
        new URL(resetUrl);
      } catch {
        return json({ error: "Invalid reset URL format" }, { status: 400 });
      }

      // Generate the email HTML content
      const html = await render(
        PasswordResetEmail({
          name,
          email,
          resetUrl,
          expiresIn,
        }),
      );

      // Send the email
      await sendEmail({
        to: email,
        subject: "Reset your Ordo password",
        html,
        from: "Ordo <daniel@madeleydesignstudio.com>",
        replyTo: "daniel@madeleydesignstudio.com",
      });

      console.log(`Password reset email sent successfully to ${email}`);

      return json({
        success: true,
        message: "Password reset email sent successfully",
      });
    } catch (error) {
      console.error("Failed to send password reset email:", error);

      return json(
        {
          error: "Failed to send password reset email",
          details: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 },
      );
    }
  },
});
