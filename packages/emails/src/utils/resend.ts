import { Resend } from "resend";

// Get API key from environment
const RESEND_API_KEY = process.env.RESEND_API_KEY;

if (!RESEND_API_KEY) {
  console.warn(
    "RESEND_API_KEY is not set. Email functionality will be disabled.",
  );
}

// Initialize Resend client with proper error handling
export const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

// Email sending utility with error handling
export async function sendEmail(options: {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
  text?: string;
}) {
  const {
    to,
    subject,
    html,
    from = "Ordo <daniel@madeleydesignstudio.com>",
    replyTo,
    text,
  } = options;

  try {
    if (!resend) {
      console.warn("Email sending skipped: RESEND_API_KEY not configured");
      return {
        id: "mock-email-id",
        message: "Email sending disabled - missing API key",
      };
    }

    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      html,
      text,
      replyTo,
    });

    if (error) {
      console.error("Resend error:", error);
      throw new Error(`Failed to send email: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error("Email sending failed:", error);
    throw error;
  }
}

// Bulk email sending utility
export async function sendBulkEmails(
  emails: Array<{
    to: string;
    subject: string;
    html: string;
    from?: string;
    replyTo?: string;
    text?: string;
  }>,
) {
  try {
    if (!resend) {
      console.warn("Bulk email sending skipped: RESEND_API_KEY not configured");
      return emails.map(() => ({
        id: "mock-email-id",
        message: "Email sending disabled - missing API key",
      }));
    }

    const { data, error } = await resend.batch.send(
      emails.map((email) => ({
        from: email.from || "Ordo <daniel@madeleydesignstudio.com>",
        to: email.to,
        subject: email.subject,
        html: email.html,
        text: email.text,
        replyTo: email.replyTo,
      })),
    );

    if (error) {
      console.error("Resend bulk error:", error);
      throw new Error(`Failed to send bulk emails: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error("Bulk email sending failed:", error);
    throw error;
  }
}
