# Google OAuth2 Setup for Ordo Frontend

This guide explains how to set up Google OAuth2 authentication for the Ordo frontend React application.

## Prerequisites

1. A Google Cloud Platform (GCP) account
2. Node.js and npm/yarn installed
3. The Ordo frontend project set up

## Google Cloud Console Setup

### 1. Create a New Project (Optional)

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top
3. Click "New Project" if you want to create a dedicated project
4. Enter project name (e.g., "Ordo App") and click "Create"

### 2. Enable Google+ API

1. In the Google Cloud Console, navigate to **APIs & Services** > **Library**
2. Search for "Google+ API" 
3. Click on it and press **Enable**

### 3. Configure OAuth Consent Screen

1. Navigate to **APIs & Services** > **OAuth consent screen**
2. Choose **External** user type (unless you have a Google Workspace account)
3. Click **Create**
4. Fill in the required information:
   - **App name**: Ordo
   - **User support email**: Your email
   - **Developer contact information**: Your email
5. Click **Save and Continue**
6. On the Scopes page, click **Add or Remove Scopes**
7. Add these scopes:
   - `userinfo.email`
   - `userinfo.profile` 
   - `openid`
8. Click **Save and Continue**
9. Add test users if needed (for development)
10. Click **Save and Continue**

### 4. Create OAuth 2.0 Credentials

1. Navigate to **APIs & Services** > **Credentials**
2. Click **+ CREATE CREDENTIALS** > **OAuth client ID**
3. Select **Web application** as the application type
4. Configure the settings:
   - **Name**: Ordo Frontend (or any name you prefer)
   - **Authorized JavaScript origins**:
     - `http://localhost:5173` (for Vite dev server)
     - `http://localhost:3000` (if using different dev server)
   - **Authorized redirect URIs**:
     - `http://localhost:5173/auth/callback`
5. Click **Create**

### 5. Get Your Client ID

After creating the credentials, you'll see a dialog with:
- **Client ID**: A long string ending in `.apps.googleusercontent.com`
- **Client Secret**: (Not needed for frontend-only OAuth)

Copy the **Client ID** - you'll need it for the next step.

## Frontend Configuration

### 1. Environment Variables

1. In the `ordo/frontend` directory, copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Open the `.env` file and add your Google Client ID:
   ```env
   VITE_GOOGLE_CLIENT_ID=your_actual_client_id_here.apps.googleusercontent.com
   ```

   Replace `your_actual_client_id_here.apps.googleusercontent.com` with the Client ID you copied from Google Cloud Console.

### 2. Install Dependencies

The OAuth2 implementation uses only built-in browser APIs and React, so no additional dependencies are needed beyond what's already in the project.

### 3. Verify Setup

1. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   # or 
   bun dev
   ```

2. Open your browser to `http://localhost:5173`

3. You should see the login page with a "Continue with Google" button

4. Click the button to test the OAuth flow

## How It Works

The OAuth2 implementation follows this flow:

1. **User clicks "Sign in with Google"**
   - Generates a random state parameter for security
   - Redirects to Google's OAuth authorization URL

2. **User authorizes the app**
   - Google shows consent screen
   - User grants permissions

3. **Google redirects back with authorization code**
   - URL: `http://localhost:5173/auth/callback?code=...&state=...`
   - Code is exchanged for access token

4. **Frontend gets user information**
   - Uses access token to fetch user profile from Google
   - Stores user data in localStorage
   - Shows authenticated app

## File Structure

The OAuth2 implementation includes these files:

```
src/
├── services/
│   └── auth.ts              # Google OAuth2 service
├── contexts/
│   └── AuthContext.tsx      # React context for auth state
├── components/
│   ├── Login.tsx           # Login page component
│   ├── OAuthCallback.tsx   # Callback handler component
│   └── UserProfile.tsx     # User profile header
└── App.tsx                 # Updated with auth flow
```

## Security Features

- **State parameter validation**: Prevents CSRF attacks
- **Frontend-only flow**: No client secret needed
- **Secure token storage**: Uses localStorage (consider upgrading to httpOnly cookies for production)
- **Error handling**: Comprehensive error states and user feedback

## Production Deployment

For production deployment:

1. **Update Google Cloud Console**:
   - Add your production domain to **Authorized JavaScript origins**
   - Add your production callback URL to **Authorized redirect URIs**
   - Example: `https://yourdomain.com/auth/callback`

2. **Update Environment Variables**:
   - Set `VITE_GOOGLE_CLIENT_ID` in your production environment
   - Consider using your deployment platform's environment variable system

3. **Security Considerations**:
   - Consider implementing JWT tokens on your backend
   - Use HTTPS in production
   - Implement proper session management
   - Add logout functionality
   - Consider token refresh logic for long-lived sessions

## Troubleshooting

### Common Issues

1. **"redirect_uri_mismatch" error**:
   - Check that your callback URL in Google Console exactly matches your app
   - Make sure you're using the correct port (5173 for Vite)

2. **"invalid_client" error**:
   - Verify your `VITE_GOOGLE_CLIENT_ID` is correct
   - Make sure the Client ID is from the correct Google Cloud project

3. **"access_denied" error**:
   - User canceled the authentication
   - Check OAuth consent screen configuration
   - Make sure test users are added if app is not published

4. **CORS issues**:
   - Google APIs should allow localhost origins
   - If issues persist, check browser console for specific CORS errors

5. **Environment variables not loading**:
   - Make sure `.env` file is in the frontend root directory
   - Restart the dev server after adding environment variables
   - Environment variables must start with `VITE_` for Vite

### Testing

To test the complete flow:

1. Open browser dev tools (Network tab)
2. Click "Continue with Google"
3. Complete the OAuth flow
4. Check that user information is displayed
5. Verify tokens are stored in localStorage
6. Test sign out functionality

## Next Steps

After successful OAuth2 setup, consider implementing:

1. **Backend Integration**: Connect with your backend API for user management
2. **Token Management**: Implement refresh token logic
3. **Route Protection**: Add protected routes for authenticated users
4. **User Preferences**: Store user settings and preferences
5. **Multi-provider Auth**: Add other OAuth providers if needed

For more information, see the [Google OAuth2 documentation](https://developers.google.com/identity/protocols/oauth2).