# @ordo/emails

Email templates and utilities package for Ordo using React Email and Resend.

## Overview

This package provides a comprehensive email system with:
- **React Email** templates for beautiful, responsive emails
- **Resend** integration for reliable email delivery
- TypeScript support with full type safety
- Utility functions for email validation and formatting
- Development server for email preview and testing

## Features

- 📧 Pre-built email templates (Welcome, Password Reset, etc.)
- 🎨 Beautiful, responsive design with inline CSS
- 🔧 Utility functions for email operations
- ✅ Email validation and sanitization
- 🚀 Easy integration with Resend API
- 🔍 Development preview server
- 📱 Mobile-optimized templates
- 🎯 TypeScript support throughout

## Installation

This package is part of the Ordo monorepo and uses workspace dependencies:

```bash
# From the root of the monorepo
pnpm install
```

## Setup

1. **Environment Configuration**

   Copy the environment template and configure your settings:

   ```bash
   cd packages/emails
   cp .env.example .env.local
   ```

   Update `.env.local` with your Resend API key:

   ```env
   RESEND_API_KEY=re_xxxxxxxxx_xxxxxxxxxxxxxxxxxxxxxxxx
   APP_BASE_URL=https://ordo.app
   DEFAULT_FROM_EMAIL=Ordo <noreply@ordo.app>
   ```

2. **Resend API Key**

   Get your API key from [Resend Dashboard](https://resend.com/api-keys) and add it to your environment file.

## Usage

### Basic Email Sending

```typescript
import { sendEmail, WelcomeEmail } from "@ordo/emails";
import { render } from "@react-email/render";

// Render the email template
const emailHtml = render(WelcomeEmail({
  name: "John Doe",
  email: "john@example.com",
  verificationUrl: "https://ordo.app/verify?token=xyz",
  dashboardUrl: "https://ordo.app/dashboard"
}));

// Send the email
await sendEmail({
  to: "john@example.com",
  subject: "Welcome to Ordo!",
  html: emailHtml
});
```

### Using Template Registry

```typescript
import { 
  sendEmail, 
  WelcomeEmail, 
  PasswordResetEmail,
  getEmailSubject 
} from "@ordo/emails";

// Dynamic template selection
const templates = {
  welcome: WelcomeEmail,
  "password-reset": PasswordResetEmail,
};

const templateType = "welcome";
const Template = templates[templateType];

const emailHtml = render(Template({
  name: "Jane Smith",
  email: "jane@example.com"
}));

await sendEmail({
  to: "jane@example.com",
  subject: getEmailSubject(templateType, { name: "Jane Smith" }),
  html: emailHtml
});
```

### Bulk Email Sending

```typescript
import { sendBulkEmails, WelcomeEmail } from "@ordo/emails";

const users = [
  { name: "John", email: "john@example.com" },
  { name: "Jane", email: "jane@example.com" }
];

const emails = users.map(user => ({
  to: user.email,
  subject: `Welcome to Ordo, ${user.name}!`,
  html: render(WelcomeEmail({
    name: user.name,
    email: user.email
  }))
}));

await sendBulkEmails(emails);
```

### Email Validation

```typescript
import { 
  isValidEmail, 
  validateEmailList, 
  validateEmailStrict 
} from "@ordo/emails";

// Simple validation
const isValid = isValidEmail("user@example.com"); // true

// Batch validation
const result = validateEmailList([
  "user@example.com",
  "invalid-email",
  "test@domain.com"
]);
// Returns: { valid: [...], invalid: [...], duplicates: [...] }

// Strict validation with detailed errors
const validation = validateEmailStrict("user@disposable-email.com");
// Returns: { isValid: false, errors: ["Disposable email addresses are not allowed"] }
```

## Available Scripts

### Development

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start React Email development server |
| `pnpm build` | Build TypeScript to JavaScript |
| `pnpm export` | Export email templates as static HTML |
| `pnpm lint` | Run ESLint on the codebase |

### Development Workflow

1. **Start the preview server:**
   ```bash
   pnpm dev
   ```
   This opens React Email at `http://localhost:3001` where you can preview and test your templates.

2. **Create new templates:**
   Add new `.tsx` files in `src/templates/` and they'll automatically appear in the preview.

3. **Export templates:**
   ```bash
   pnpm export
   ```
   Exports all templates as static HTML files for testing or integration.

## Email Templates

### Available Templates

| Template | Purpose | Props |
|----------|---------|-------|
| `WelcomeEmail` | New user welcome | `name`, `email`, `verificationUrl`, `dashboardUrl` |
| `PasswordResetEmail` | Password reset requests | `name`, `email`, `resetUrl`, `expiresIn` |

### Template Structure

All templates follow this pattern:

```typescript
interface TemplateProps {
  name?: string;
  email?: string;
  // Template-specific props...
}

export const MyTemplate = ({
  name = "there",
  email = "user@example.com",
  // Default values for all props
}: TemplateProps) => {
  return (
    <Html>
      <Head />
      <Preview>Email preview text</Preview>
      <Body style={main}>
        {/* Email content */}
      </Body>
    </Html>
  );
};
```

### Creating New Templates

1. **Create the template file:**
   ```bash
   touch src/templates/my-template.tsx
   ```

2. **Add to template registry:**
   ```typescript
   // src/templates/index.ts
   export { MyTemplate } from "./my-template.js";
   ```

3. **Update configuration:**
   ```typescript
   // Add to EMAIL_TEMPLATES and EMAIL_TEMPLATE_CONFIGS
   ```

## Utility Functions

### Email Helpers

```typescript
import { 
  formatEmailDate,
  truncateText,
  getTimeBasedGreeting,
  formatCurrency,
  getEmailColors 
} from "@ordo/emails";

// Format dates for emails
const formattedDate = formatEmailDate(new Date(), {
  includeTime: true,
  timeZone: "America/New_York"
});

// Truncate long text
const preview = truncateText("Long email content...", 150);

// Dynamic greetings
const greeting = getTimeBasedGreeting("John", "America/New_York");
// "Good morning, John" / "Good afternoon, John" / "Good evening, John"

// Format currency
const price = formatCurrency(29.99, "USD"); // "$29.99"

// Get consistent colors
const colors = getEmailColors();
// { primary: "#000000", accent: "#0070f3", ... }
```

### Email Validation

```typescript
import { 
  normalizeEmail,
  getEmailDomain,
  isDisposableEmail 
} from "@ordo/emails";

const normalized = normalizeEmail(" User@Example.COM "); // "user@example.com"
const domain = getEmailDomain("user@example.com"); // "example.com"
const isDisposable = isDisposableEmail("user@tempmail.org"); // true
```

## Configuration

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `RESEND_API_KEY` | Resend API key | Yes | - |
| `APP_BASE_URL` | Application base URL | No | `https://ordo.app` |
| `DEFAULT_FROM_EMAIL` | Default sender address | No | `Ordo <noreply@ordo.app>` |
| `REACT_EMAIL_PORT` | Preview server port | No | `3001` |
| `EMAIL_PREVIEW_MODE` | Enable preview mode | No | `true` |

### React Email Configuration

The `.react-email/config.json` file configures the development server:

```json
{
  "dir": "src/templates",
  "port": 3001,
  "host": "localhost"
}
```

## File Structure

```
src/
├── templates/           # Email templates
│   ├── welcome.tsx     # Welcome email template
│   ├── password-reset.tsx # Password reset template
│   └── index.ts        # Template exports and registry
├── utils/              # Utility functions
│   ├── resend.ts       # Resend client and email sending
│   ├── validation.ts   # Email validation utilities
│   ├── helpers.ts      # Template helper functions
│   └── index.ts        # Utility exports
└── index.ts            # Main package exports

.react-email/
└── config.json         # React Email configuration

.env.example            # Environment template
```

## Best Practices

### Template Design

1. **Mobile-first approach**: All templates are responsive and mobile-optimized
2. **Inline CSS**: Styles are inlined for maximum email client compatibility
3. **Fallback fonts**: Use web-safe font stacks
4. **Alt text**: Always include alt text for images
5. **Clear CTAs**: Make call-to-action buttons prominent and accessible

### Code Style

1. **TypeScript**: Use proper typing for all props and functions
2. **Default props**: Always provide sensible defaults
3. **Error handling**: Wrap email operations in try-catch blocks
4. **Validation**: Validate email addresses before sending
5. **Environment checks**: Ensure required environment variables are set

### Testing

1. **Preview server**: Use `pnpm dev` to preview templates during development
2. **Export templates**: Use `pnpm export` to generate static HTML for testing
3. **Test emails**: Send test emails to different providers (Gmail, Outlook, etc.)
4. **Mobile testing**: Test on various mobile email clients

## Troubleshooting

### Common Issues

**Q: Resend API errors**
- Verify your API key is correct and active
- Check your Resend dashboard for usage limits
- Ensure sender domain is verified in Resend

**Q: Templates not rendering correctly**
- Check for syntax errors in TSX files
- Ensure all imports are correct
- Verify inline styles are properly formatted

**Q: Email delivery issues**
- Check spam folders
- Verify sender reputation
- Test with different email providers

**Q: TypeScript errors**
- Run `pnpm build` to check for compilation errors
- Ensure all imports use `.js` extensions for ES modules
- Check that all required props are provided

### Getting Help

- Check the [React Email documentation](https://react.email)
- Review [Resend documentation](https://resend.com/docs)
- Open an issue in the project repository
- Contact the development team

## Contributing

When adding new email templates:

1. Follow the existing template structure
2. Add proper TypeScript types
3. Include sensible default props
4. Update the template registry
5. Test in the preview server
6. Export and test the HTML output

## License

This package is part of the Ordo project and follows the same licensing terms.