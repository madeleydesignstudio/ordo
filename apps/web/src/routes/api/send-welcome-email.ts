import { json } from "@tanstack/react-start";
import { createServerFileRoute } from "@tanstack/react-start/server";
import { sendEmail, WelcomeEmail, render } from "@ordo/emails";

interface SendWelcomeEmailRequest {
  email: string;
  name?: string;
  verificationUrl?: string;
  dashboardUrl?: string;
}

export const ServerRoute = createServerFileRoute(
  "/api/send-welcome-email",
).methods({
  POST: async ({ request }) => {
    try {
      const body = (await request.json()) as SendWelcomeEmailRequest;
      const { email, name = "there", verificationUrl, dashboardUrl } = body;

      // Validate required fields
      if (!email) {
        return json({ error: "Email is required" }, { status: 400 });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return json({ error: "Invalid email format" }, { status: 400 });
      }

      // Set default URLs for development
      const finalVerificationUrl =
        verificationUrl ||
        `http://localhost:3001/auth/verify?email=${encodeURIComponent(email)}`;
      const finalDashboardUrl =
        dashboardUrl || "http://localhost:3001/dashboard";

      // Generate the email HTML content
      const html = await render(
        WelcomeEmail({
          name,
          email,
          verificationUrl: finalVerificationUrl,
          dashboardUrl: finalDashboardUrl,
        }),
      );

      // Send the email
      await sendEmail({
        to: email,
        subject: `Welcome to Ordo, ${name}!`,
        html,
        from: "Ordo <daniel@madeleydesignstudio.com>",
        replyTo: "daniel@madeleydesignstudio.com",
      });

      console.log(`Welcome email sent successfully to ${email}`);

      return json({
        success: true,
        message: "Welcome email sent successfully",
      });
    } catch (error) {
      console.error("Failed to send welcome email:", error);

      return json(
        {
          error: "Failed to send welcome email",
          details: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 },
      );
    }
  },
});
