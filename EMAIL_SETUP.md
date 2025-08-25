# Email Setup Guide for Ordo

This guide will help you set up email functionality for signup and password reset using Resend.

## Prerequisites

- Resend account (sign up at https://resend.com)
- Verified sender domain or email address in Resend

## Environment Variables

You need to add the following environment variable to your project. Since email sending happens on the server-side for security, use the standard environment variable name:

### For the web app (`ordo/apps/web/.env.local`):

```env
RESEND_API_KEY=your_resend_api_key_here
```

### For the emails package (`ordo/packages/emails/.env.local`):

```env
RESEND_API_KEY=your_resend_api_key_here
```

## Getting Your Resend API Key

1. Sign up or log in to [Resend](https://resend.com)
2. Go to your dashboard
3. Navigate to "API Keys" section
4. Create a new API key
5. Copy the API key and add it to your environment variables

## Email Configuration

The system is configured to use:
- **Sender**: daniel@madeleydesignstudio.com
- **Host**: smtp.resend.com (handled automatically by Resend)
- **Port**: 465 (handled automatically by Resend)
- **User**: resend (handled automatically by Resend)

## Domain Verification

Make sure `madeleydesignstudio.com` is verified in your Resend account:

1. Go to your Resend dashboard
2. Navigate to "Domains"
3. Add and verify `madeleydesignstudio.com`
4. Follow the DNS verification steps

## Quick Setup

Run the automated setup script:

```bash
chmod +x setup-emails.sh
./setup-emails.sh
```

Then manually add your actual Resend API key to the generated `.env.local` files.

## Email Templates

The system includes two pre-built email templates:

### 1. Welcome Email (`WelcomeEmail`)
- Sent when users sign up
- Includes verification link
- Links to dashboard and help pages

### 2. Password Reset Email (`PasswordResetEmail`)
- Sent when users request password reset
- Includes reset link with expiration
- Security information and warnings

## Testing Email Functionality

### Signup Flow
1. Start the dev server: `pnpm dev`
2. Go to `http://localhost:3001/signup`
3. Create a new account
4. Check the email address for the welcome email

### Password Reset Flow
1. Go to `http://localhost:3001/login`
2. Click "Forgot password?"
3. Enter your email address
4. Check your email for the reset link
5. Follow the link to reset your password

### Email Preview (Development)
Visit `http://localhost:3001/email-preview` to preview and test email templates without sending actual emails.

## Development URLs

The system is configured for development with these URLs:
- Base URL: `http://localhost:3001`
- Dashboard: `http://localhost:3001/dashboard`
- Email verification: `http://localhost:3001/auth/verify`
- Password reset: `http://localhost:3001/reset-password`

## Email Functions

### `sendWelcomeEmail(options)`
Sends a welcome email to new users.

**Parameters:**
- `email`: User's email address
- `name`: User's name (optional, defaults to extracted from email)
- `verificationUrl`: Email verification link
- `dashboardUrl`: Link to dashboard

### `sendPasswordResetEmail(options)`
Sends a password reset email.

**Parameters:**
- `email`: User's email address
- `name`: User's name (optional)
- `resetUrl`: Password reset link
- `expiresIn`: Token expiration time (default: "1 hour")

## Error Handling

The system includes comprehensive error handling:
- Email sending failures are logged but don't break the auth flow
- Users receive appropriate success/error messages
- Email validation is performed before sending

## Security Considerations

- Reset links expire after 1 hour
- Email addresses are validated before sending
- Failed email sends are logged for monitoring
- Users are informed about security best practices

## Production Deployment

When deploying to production:

1. Update environment variables with production API key:
   ```env
   RESEND_API_KEY=your_production_api_key
   ```

2. Update URLs in email templates from localhost to production domain
3. Ensure domain is verified in Resend
4. Test all email flows in production environment

## Troubleshooting

### Common Issues

**"Missing API key" Error:**
- Ensure you're using `RESEND_API_KEY` in your server-side environment
- Verify the API key is in both `.env.local` files
- Restart the development server after adding environment variables
- Check that the API key doesn't have extra spaces or quotes

**Email not received:**
- Check spam/junk folders
- Verify domain is properly configured in Resend
- Check Resend dashboard for send status
- Verify API key is correct and active

**Domain verification failed:**
- Ensure DNS records are properly set
- Wait for DNS propagation (can take up to 24 hours)
- Use DNS checking tools to verify records

**Environment variable not loading:**
- Restart your development server
- Ensure `.env.local` files are in the correct directories
- Check that variable names use `RESEND_API_KEY` (server-side only)
- Verify there are no syntax errors in `.env.local` files

### Logs and Monitoring

Email sending status is logged to the console:
- Success: `Welcome email sent to [email]`
- Error: `Failed to send welcome email: [error]`

Check browser console (development) or server logs (production) for detailed information.

## File Structure

```
packages/emails/
├── src/
│   ├── templates/
│   │   ├── welcome.tsx           # Welcome email template
│   │   ├── password-reset.tsx    # Password reset template
│   │   └── index.ts             # Template exports
│   └── utils/
│       ├── auth-emails.ts       # Auth email functions
│       ├── resend.ts           # Resend client setup
│       └── index.ts            # Utility exports
```

## Support

For issues with:
- **Resend service**: Contact Resend support
- **Email templates**: Check the templates in `ordo/packages/emails/src/templates/`
- **Integration issues**: Check the auth context and email utilities
- **Environment variables**: Ensure you're using `RESEND_API_KEY` for server-side access

## Next Steps

Once basic email functionality is working, you can:
1. Customize email templates with your branding
2. Add more email types (task reminders, notifications, etc.)
3. Implement email preferences and unsubscribe functionality
4. Add email analytics and tracking
5. Set up email automation workflows

## Example .env.local File

Here's what your `.env.local` files should look like:

```env
# Resend Email Configuration (Server-side only)
RESEND_API_KEY=re_1234567890abcdef1234567890abcdef

# Other environment variables...
```

Make sure to replace `re_1234567890abcdef1234567890abcdef` with your actual Resend API key from your dashboard.

## Important Security Note

Email sending now happens on the server-side through API routes (`/api/send-welcome-email` and `/api/send-reset-email`). This is more secure because:
- API keys are never exposed to client-side code
- CORS issues are avoided
- Better error handling and rate limiting can be implemented