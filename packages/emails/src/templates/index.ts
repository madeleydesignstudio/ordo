// Export all email templates
export { WelcomeEmail, default as Welcome } from "./welcome.js";
export {
  PasswordResetEmail,
  default as PasswordReset,
} from "./password-reset.js";

// Template types for better TypeScript support
export interface BaseEmailProps {
  name?: string;
  email?: string;
}

export interface WelcomeEmailProps extends BaseEmailProps {
  verificationUrl?: string;
  dashboardUrl?: string;
}

export interface PasswordResetEmailProps extends BaseEmailProps {
  resetUrl?: string;
  expiresIn?: string;
}

// Email template registry for dynamic template selection
export const EMAIL_TEMPLATES = {
  welcome: "welcome",
  "password-reset": "password-reset",
  "email-verification": "email-verification",
  "task-reminder": "task-reminder",
  "project-invitation": "project-invitation",
  "team-invitation": "team-invitation",
  "task-assigned": "task-assigned",
  "task-completed": "task-completed",
  "project-update": "project-update",
  "weekly-digest": "weekly-digest",
  "account-deletion": "account-deletion",
  "subscription-renewal": "subscription-renewal",
  "payment-failed": "payment-failed",
  "downgrade-warning": "downgrade-warning",
} as const;

export type EmailTemplateType = keyof typeof EMAIL_TEMPLATES;

// Template metadata for configuration
export interface EmailTemplateConfig {
  name: string;
  description: string;
  category: "auth" | "notifications" | "billing" | "system";
  defaultSubject: string;
  requiredProps: string[];
  optionalProps: string[];
}

export const EMAIL_TEMPLATE_CONFIGS: Record<
  EmailTemplateType,
  EmailTemplateConfig
> = {
  welcome: {
    name: "Welcome Email",
    description: "Sent when a new user signs up",
    category: "auth",
    defaultSubject: "Welcome to Ordo!",
    requiredProps: ["name"],
    optionalProps: ["verificationUrl", "dashboardUrl"],
  },
  "password-reset": {
    name: "Password Reset",
    description: "Sent when user requests password reset",
    category: "auth",
    defaultSubject: "Reset your Ordo password",
    requiredProps: ["name", "resetUrl"],
    optionalProps: ["expiresIn"],
  },
  "email-verification": {
    name: "Email Verification",
    description: "Sent to verify email address",
    category: "auth",
    defaultSubject: "Verify your Ordo email address",
    requiredProps: ["name", "verificationUrl"],
    optionalProps: ["expiresIn"],
  },
  "task-reminder": {
    name: "Task Reminder",
    description: "Sent to remind about due tasks",
    category: "notifications",
    defaultSubject: "Task reminder",
    requiredProps: ["name", "taskTitle"],
    optionalProps: ["dueDate", "projectName"],
  },
  "project-invitation": {
    name: "Project Invitation",
    description: "Sent when user is invited to a project",
    category: "notifications",
    defaultSubject: "Project invitation",
    requiredProps: ["name", "projectName", "inviterName"],
    optionalProps: ["acceptUrl", "message"],
  },
  "team-invitation": {
    name: "Team Invitation",
    description: "Sent when user is invited to a team",
    category: "notifications",
    defaultSubject: "Team invitation",
    requiredProps: ["name", "teamName", "inviterName"],
    optionalProps: ["acceptUrl", "message"],
  },
  "task-assigned": {
    name: "Task Assigned",
    description: "Sent when a task is assigned to user",
    category: "notifications",
    defaultSubject: "New task assigned",
    requiredProps: ["name", "taskTitle", "assignerName"],
    optionalProps: ["dueDate", "projectName", "description"],
  },
  "task-completed": {
    name: "Task Completed",
    description: "Sent when a task is marked as completed",
    category: "notifications",
    defaultSubject: "Task completed",
    requiredProps: ["name", "taskTitle"],
    optionalProps: ["completedBy", "projectName"],
  },
  "project-update": {
    name: "Project Update",
    description: "Sent with project progress updates",
    category: "notifications",
    defaultSubject: "Project update",
    requiredProps: ["name", "projectName"],
    optionalProps: ["updateText", "updatedBy"],
  },
  "weekly-digest": {
    name: "Weekly Digest",
    description: "Weekly summary of activities",
    category: "notifications",
    defaultSubject: "Your weekly digest",
    requiredProps: ["name"],
    optionalProps: ["completedTasks", "upcomingTasks", "projectUpdates"],
  },
  "account-deletion": {
    name: "Account Deletion",
    description: "Confirmation of account deletion",
    category: "system",
    defaultSubject: "Account deleted",
    requiredProps: ["name"],
    optionalProps: ["deletedAt"],
  },
  "subscription-renewal": {
    name: "Subscription Renewal",
    description: "Reminder about subscription renewal",
    category: "billing",
    defaultSubject: "Subscription renewal reminder",
    requiredProps: ["name", "renewalDate"],
    optionalProps: ["planName", "amount"],
  },
  "payment-failed": {
    name: "Payment Failed",
    description: "Notification about failed payment",
    category: "billing",
    defaultSubject: "Payment failed",
    requiredProps: ["name", "amount"],
    optionalProps: ["retryUrl", "failureReason"],
  },
  "downgrade-warning": {
    name: "Downgrade Warning",
    description: "Warning about plan downgrade",
    category: "billing",
    defaultSubject: "Plan downgrade scheduled",
    requiredProps: ["name", "currentPlan", "newPlan"],
    optionalProps: ["downgradeDate", "upgradeUrl"],
  },
};
