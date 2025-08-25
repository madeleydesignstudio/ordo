import { getNameFromEmail } from "@ordo/emails";

interface SendSignupEmailOptions {
  email: string;
  name?: string;
}

interface SendPasswordResetOptions {
  email: string;
  name?: string;
  resetToken: string;
}

/**
 * Send welcome email after successful signup via API route
 */
export async function sendSignupEmail({ email, name }: SendSignupEmailOptions) {
  try {
    const userName = name || getNameFromEmail(email);

    const response = await fetch("/api/send-welcome-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        name: userName,
        verificationUrl: `http://localhost:3001/auth/verify?email=${encodeURIComponent(email)}`,
        dashboardUrl: "http://localhost:3001/dashboard",
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to send welcome email");
    }

    const result = await response.json();
    console.log(`Signup email sent to ${email}`);
    return result;
  } catch (error) {
    console.error("Failed to send signup email:", error);
    throw error;
  }
}

/**
 * Send password reset email via API route
 */
export async function sendResetEmail({
  email,
  name,
  resetToken,
}: SendPasswordResetOptions) {
  try {
    const userName = name || getNameFromEmail(email);
    const resetUrl = `http://localhost:3001/reset-password?token=${resetToken}`;

    const response = await fetch("/api/send-reset-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        name: userName,
        resetUrl,
        expiresIn: "1 hour",
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to send password reset email");
    }

    const result = await response.json();
    console.log(`Password reset email sent to ${email}`);
    return result;
  } catch (error) {
    console.error("Failed to send password reset email:", error);
    throw error;
  }
}

/**
 * Extract user metadata from auth response
 */
export function getUserEmailData(user: any) {
  return {
    email: user.email,
    name:
      user.user_metadata?.name ||
      user.user_metadata?.full_name ||
      getNameFromEmail(user.email),
  };
}
