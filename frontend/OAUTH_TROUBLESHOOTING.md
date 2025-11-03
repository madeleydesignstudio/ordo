# OAuth2 Troubleshooting Guide

This guide helps resolve common issues with Google OAuth2 authentication in the Ordo frontend.

## 🚨 Common Issues & Solutions

### 1. "State mismatch" or "Invalid nonce parameter"

**Problem:** React's Strict Mode in development runs effects twice, clearing stored values.

**Solution:** This is expected in development mode and won't occur in production.
```javascript
// The nonce/state gets cleared by the second effect run in Strict Mode
// This only happens in development - production works fine
```

**Temporary workaround for development:**
- Disable React Strict Mode temporarily in `main.tsx`:
```javascript
// Remove <React.StrictMode> wrapper for OAuth testing
ReactDOM.createRoot(document.getElementById('root')!).render(
  <App />  // Instead of <React.StrictMode><App /></React.StrictMode>
);
```

### 2. "redirect_uri_mismatch" Error

**Problem:** Google Console redirect URI doesn't match your app's callback URL.

**Solutions:**
1. **Check your Google Console settings:**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Navigate to APIs & Services > Credentials
   - Edit your OAuth 2.0 Client ID
   - Ensure redirect URI exactly matches: `http://localhost:5173/auth/callback`

2. **Verify your dev server port:**
   ```bash
   # Check which port Vite is using
   npm run dev
   # Should show: Local: http://localhost:5173/
   ```

3. **For custom ports:**
   - If using different port, update Google Console redirect URI
   - Example: `http://localhost:3000/auth/callback`

### 3. "invalid_client" Error

**Problem:** Client ID is incorrect or missing.

**Solutions:**
1. **Check environment variable:**
   ```bash
   # Ensure .env file exists and contains:
   VITE_GOOGLE_CLIENT_ID=your_actual_client_id.apps.googleusercontent.com
   ```

2. **Restart dev server after env changes:**
   ```bash
   # Stop server (Ctrl+C) then restart
   npm run dev
   ```

3. **Verify Client ID format:**
   - Should end with `.apps.googleusercontent.com`
   - Should be long string of numbers and letters
   - Copy exactly from Google Console (no extra spaces)

### 4. "access_denied" Error

**Problem:** User canceled authentication or app needs approval.

**Solutions:**
1. **Complete OAuth flow:** Don't cancel the Google consent screen
2. **Check OAuth consent screen:**
   - Go to APIs & Services > OAuth consent screen
   - Ensure app is configured properly
   - Add test users if app is in "Testing" status
3. **Publish app:** For production, submit for verification

### 5. "No authentication data received"

**Problem:** Callback URL doesn't contain expected authentication data.

**Solutions:**
1. **Check URL after redirect:**
   - Should contain `#access_token=...` in URL fragment
   - If missing, OAuth flow didn't complete properly

2. **Verify callback handling:**
   - URL should be: `http://localhost:5173/#access_token=ya29...`
   - Not: `http://localhost:5173/auth/callback?error=...`

### 6. Environment Variables Not Loading

**Problem:** `VITE_GOOGLE_CLIENT_ID` is undefined.

**Solutions:**
1. **Check file name:** Must be `.env` (not `.env.example`)
2. **Check location:** Must be in `ordo/frontend/` directory
3. **Check prefix:** Must start with `VITE_` for Vite to load it
4. **Restart server:** Always restart after env file changes

### 7. CORS Issues

**Problem:** Browser blocks requests to Google APIs.

**Solutions:**
1. **This shouldn't happen** - Google APIs allow localhost origins
2. **If it occurs:**
   - Check browser console for specific CORS errors
   - Verify you're using `http://localhost:5173` (not `127.0.0.1`)
   - Try different browser or incognito mode

## 🔧 Debug Steps

### 1. Check Environment Setup
```bash
# Navigate to frontend directory
cd ordo/frontend

# Verify .env file exists
ls -la | grep .env

# Check if environment variable is loaded
npm run dev
# Should not show "Google Client ID is not configured" error
```

### 2. Verify Google Console Configuration

**Required settings:**
- **Application type:** Web application
- **Authorized JavaScript origins:** 
  - `http://localhost:5173`
- **Authorized redirect URIs:**
  - `http://localhost:5173/auth/callback`

### 3. Test OAuth Flow Step by Step

1. **Click "Continue with Google"**
   - Should redirect to Google
   - URL should contain your client ID

2. **Complete Google consent**
   - Grant permissions
   - Should redirect back to your app

3. **Check callback URL**
   - Should contain `#access_token=...`
   - Should show success message briefly
   - Should redirect to main app

### 4. Browser Developer Tools

**Console tab:** Check for error messages
```javascript
// Look for these types of errors:
- "Google Client ID is not configured"
- "Invalid nonce parameter" 
- "OAuth callback error"
- Network errors (400, 401, 403)
```

**Network tab:** Check OAuth requests
- Initial redirect to Google
- Callback with tokens
- User info API call

**Application tab:** Check localStorage
```javascript
// Should contain after successful auth:
- access_token: "ya29...."
- id_token: "eyJ...."
- user_info: "{...}"
```

## 🏭 Production Deployment

### Required Changes for Production

1. **Update Google Console:**
   - Add production domain to JavaScript origins
   - Add production callback URL to redirect URIs

2. **Environment Variables:**
   - Set `VITE_GOOGLE_CLIENT_ID` in production environment
   - Use your deployment platform's env var system

3. **HTTPS Required:**
   - Google requires HTTPS for production OAuth
   - Localhost HTTP is only allowed for development

### Example Production Setup
```bash
# Production environment variables
VITE_GOOGLE_CLIENT_ID=123456789-abc...apps.googleusercontent.com

# Production Google Console settings:
# JavaScript origins: https://yourdomain.com
# Redirect URIs: https://yourdomain.com/auth/callback
```

## 📞 Getting Help

### Before Asking for Help

1. ✅ Check this troubleshooting guide
2. ✅ Verify Google Console configuration
3. ✅ Check browser console for errors
4. ✅ Try in incognito/private browsing mode
5. ✅ Test with a fresh browser session

### Information to Include

When reporting OAuth issues, include:
- **Error message:** Exact error from console
- **Browser:** Chrome, Firefox, Safari, etc.
- **Environment:** Development or production
- **URLs:** What URL are you redirected to after Google auth
- **Console logs:** Any errors in browser developer tools

### Quick Self-Check

Run this in browser console on your app:
```javascript
// Check if environment variable is loaded
console.log('Client ID:', import.meta.env.VITE_GOOGLE_CLIENT_ID);

// Check current storage
console.log('Access Token:', localStorage.getItem('access_token'));
console.log('User Info:', localStorage.getItem('user_info'));

// Check current URL for callback data
console.log('Current hash:', window.location.hash);
console.log('Current search:', window.location.search);
```

---

Most OAuth2 issues are configuration problems in Google Console or environment variables. Double-check these first!