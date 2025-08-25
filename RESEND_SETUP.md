# Quick Fix for Email Error

If you're seeing the error: `Missing API key. Pass it to the constructor new Resend("re_123")`, here's how to fix it:

## Step 1: Get a Resend API Key

1. Go to [https://resend.com](https://resend.com)
2. Sign up for a free account
3. Navigate to "API Keys" in your dashboard
4. Create a new API key
5. Copy the API key (it starts with `re_`)

## Step 2: Configure Environment Variables

### For Web App:
1. Go to `ordo/apps/web/`
2. Copy the template file:
   ```bash
   cp .env.template .env.local
   ```
3. Edit `.env.local` and replace `your_resend_api_key_here` with your actual API key:
   ```
   RESEND_API_KEY=re_your_actual_api_key_here
   ```

### For Email Package (optional, for testing):
1. Go to `ordo/packages/emails/`
2. Create a `.env.local` file:
   ```bash
   echo "RESEND_API_KEY=re_your_actual_api_key_here" > .env.local
   ```

## Step 3: Restart Development Server

```bash
# Stop the current server (Ctrl+C)
# Then restart:
pnpm dev
```

## Step 4: Verify Domain (Optional but Recommended)

1. In your Resend dashboard, go to "Domains"
2. Add `madeleydesignstudio.com` (or your domain)
3. Follow the DNS verification steps

## That's It!

The error should now be resolved. The email functionality will work properly, and you'll see success messages instead of API key errors.

## If You Still See Errors:

1. Make sure your API key starts with `re_`
2. Check that there are no extra spaces or quotes in the `.env.local` file
3. Ensure you restarted the development server
4. Check the browser console for any other error messages

## For Development Without Email:

If you don't want to set up email right now, the app will still work. The system now gracefully handles missing API keys and will log warnings instead of crashing.