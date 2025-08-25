import { render } from "@react-email/render";
import { sendEmail } from "./resend.js";
import { WelcomeEmail } from "../templates/welcome.js";
import { PasswordResetEmail } from "../templates/password-reset.js";

interface SendWelcomeEmailOptions {
  email: string;
  name?: string;
  verificationUrl?: string;
  dashboardUrl?: string;
}

interface SendPasswordResetEmailOptions {
  email: string;
  name?: string;
  resetUrl: string;
  expiresIn?: string;
}

/**
 * Send welcome email to new user after signup
 */
export async function sendWelcomeEmail({
  email,
  name = "there",
  verificationUrl = "http://localhost:3001/auth/verify",
  dashboardUrl = "http://localhost:3001/dashboard",
}: SendWelcomeEmailOptions) {
  try {
    const html = await render(
      WelcomeEmail({
        name,
        email,
        verificationUrl,
        dashboardUrl,
      }),
    );

    await sendEmail({
      to: email,
      subject: `Welcome to Ordo, ${name}!`,
      html,
      from: "Ordo <daniel@madeleydesignstudio.com>",
      replyTo: "daniel@madeleydesignstudio.com",
    });

    console.log(`Welcome email sent to ${email}`);
  } catch (error) {
    console.error("Failed to send welcome email:", error);
    throw error;
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail({
  email,
  name = "there",
  resetUrl,
  expiresIn = "1 hour",
}: SendPasswordResetEmailOptions) {
  try {
    const html = await render(
      PasswordResetEmail({
        name,
        email,
        resetUrl,
        expiresIn,
      }),
    );

    await sendEmail({
      to: email,
      subject: "Reset your Ordo password",
      html,
      from: "Ordo <daniel@madeleydesignstudio.com>",
      replyTo: "daniel@madeleydesignstudio.com",
    });

    console.log(`Password reset email sent to ${email}`);
  } catch (error) {
    console.error("Failed to send password reset email:", error);
    throw error;
  }
}

/**
 * Extract name from email address (fallback)
 */
export function getNameFromEmail(email: string): string {
  const username = email.split("@")[0];
  if (!username) return "User";
  return username
    .split(/[._-]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
