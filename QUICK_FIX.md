# 🔧 Quick Fix: CORS Error & Email Implementation

If you're seeing these errors:
```
CORS Missing Allow Origin
Cross-Origin Request Blocked: The Same Origin Policy disallows reading the remote resource at https://api.resend.com/emails
```

## ✅ Solution

The issue is that email sending was happening in the browser, but it should happen on the server-side for security and to avoid CORS issues.

**Fixed:** Email sending now uses server-side API routes instead of direct browser calls to Resend.

### Step 1: Create Environment Files

Create these two files with the server-side environment variable:

**File: `apps/web/.env.local`**
```env
RESEND_API_KEY=your_resend_api_key_here
```

**File: `packages/emails/.env.local`**
```env
RESEND_API_KEY=your_resend_api_key_here
```

### Step 2: Get Your Resend API Key

1. Go to https://resend.com
2. Sign up or log in
3. Go to "API Keys" in your dashboard
4. Create a new API key
5. Copy the key (it starts with `re_`)

### Step 3: Add Your API Key

Replace `your_resend_api_key_here` in both `.env.local` files with your actual API key:

```env
RESEND_API_KEY=re_1234567890abcdef1234567890abcdef
```

### Step 4: Restart Development Server

```bash
# Stop the server (Ctrl+C)
# Then restart it
pnpm dev
```

### Step 5: Verify Domain (Important!)

In your Resend dashboard:
1. Go to "Domains"
2. Add `madeleydesignstudio.com`
3. Follow the DNS verification steps
4. Wait for verification (can take a few minutes to 24 hours)

## 🧪 Test It

1. Go to http://localhost:3001/signup
2. Create a test account
3. Check your email for the welcome message

## 📝 Notes

- Email sending now happens server-side via API routes for security
- No `VITE_` prefix needed - this is server-side only
- Both `.env.local` files need the same API key
- Restart the dev server after adding environment variables
- Make sure your domain is verified in Resend before testing

## 🔧 What Changed

- Added server-side API routes: `/api/send-welcome-email` and `/api/send-reset-email`
- Client-side code now calls these API routes instead of Resend directly
- API keys are kept secure on the server-side
- CORS issues are completely avoided

## ❓ Still Having Issues?

Check the browser console for any additional error messages and ensure:
- API key starts with `re_`
- No extra spaces or quotes in the `.env.local` files
- Development server was restarted
- Domain is verified in Resend dashboard

That's it! Your email functionality should now work properly. 🎉