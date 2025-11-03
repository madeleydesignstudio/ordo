# Google OAuth2 Implementation for Ordo

A secure Google OAuth2 implementation using backend-handled authentication for the Ordo project management application.

## 🚀 Quick Start

### 1. Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** > **Credentials**
4. Click **+ CREATE CREDENTIALS** > **OAuth client ID**
5. Select **Web application**
6. Add authorized redirect URI: `http://localhost:8080/auth/google/callback`
7. Copy the Client ID and Client Secret

### 2. Backend Configuration

1. Navigate to the backend directory:
   ```bash
   cd ordo/backend
   ```

2. Create or update your `.env` file with Google OAuth credentials:
   ```env
   GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your_client_secret_here
   GOOGLE_REDIRECT_URL=http://localhost:8080/auth/google/callback
   DATABASE_URL=your_database_url
   SOURCE_ID=your_source_id
   SOURCE_SECRET=your_source_secret
   PORT=8080
   ```

3. Start the backend server:
   ```bash
   go run cmd/server/main.go
   ```

### 3. Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd ordo/frontend
   ```

2. Start the frontend development server:
   ```bash
   npm run dev
   ```

3. Open `http://localhost:5173` and test the OAuth flow

## 📁 File Structure

```
backend/internal/
├── auth/
│   └── auth.go             # Google OAuth2 service
├── handlers/
│   └── auth.go             # OAuth HTTP handlers
└── config/
    └── config.go           # Configuration management

frontend/src/
├── services/
│   └── auth.ts             # Frontend auth service (calls backend)
├── contexts/
│   └── AuthContext.tsx     # Authentication state management
├── components/
│   ├── Login.tsx          # Login page
│   ├── OAuthCallback.tsx  # OAuth callback handler
│   └── UserProfile.tsx    # User profile header
└── App.tsx                # Main app with auth integration
```

## 🔧 How It Works

1. **Login Flow**: User clicks "Sign in with Google"
2. **Backend Redirect**: Frontend redirects to backend (`http://localhost:8080/auth/google`)
3. **Google OAuth**: Backend redirects to Google OAuth consent screen
4. **Authorization**: User grants permissions
5. **Backend Callback**: Google redirects back to backend with authorization code
6. **Token Exchange**: Backend exchanges code for access token with Google
7. **User Info**: Backend fetches user profile from Google
8. **Frontend Redirect**: Backend redirects to frontend with auth token
9. **Token Storage**: Frontend stores auth token and shows authenticated interface

## 🔒 Security Features

- **Backend Security**: OAuth client secret secured on server
- **Token-Based Auth**: Backend generates secure auth tokens
- **CSRF Protection**: State parameter validation on backend
- **Secure Storage**: Sensitive credentials never exposed to frontend
- **Error Handling**: Comprehensive error states with user-friendly messages
- **Clean URLs**: Automatic URL cleanup after authentication

## 🎨 Components

### Backend Auth (`internal/auth/auth.go`)
- Handles Google OAuth2 flow with secure client credentials
- Manages token exchange with Google
- Fetches user information from Google APIs

### Frontend AuthService (`services/auth.ts`)
- Redirects to backend OAuth endpoints
- Handles auth tokens from backend
- Manages authentication state
- Provides token verification

### AuthContext (`contexts/AuthContext.tsx`)
- React context for authentication state
- Provides hooks for auth operations
- Manages loading and error states

### Login (`components/Login.tsx`)
- Clean login interface
- Google sign-in button
- Error display
- Loading states

### OAuthCallback (`components/OAuthCallback.tsx`)
- Handles OAuth callback processing
- Shows loading/success/error states
- Automatically redirects after success

### UserProfile (`components/UserProfile.tsx`)
- Displays user information
- Shows verification status
- Sign out functionality

## 🌐 Production Setup

For production deployment:

1. **Google Console**: Update redirect URI to your production backend URL
2. **Backend Environment**: Set all OAuth environment variables securely
3. **HTTPS**: Use secure connections for both frontend and backend
4. **Token Security**: Implement proper token expiration and refresh logic
5. **Database**: Store auth tokens in secure database instead of memory

## 🛠 Development

### Testing OAuth Flow

1. Start backend server: `go run cmd/server/main.go` (port 8080)
2. Start frontend server: `npm run dev` (port 5173)
3. Open `http://localhost:5173`
4. Click "Continue with Google" → redirects to backend
5. Backend redirects to Google OAuth
6. Complete OAuth flow → redirects back to backend
7. Backend redirects to frontend with token
8. Verify user profile displays
9. Test sign out functionality

### Common Issues

- **redirect_uri_mismatch**: Check backend callback URL in Google Console
- **invalid_client**: Verify backend Client ID and Secret are correct
- **access_denied**: User cancelled or consent screen needs approval
- **Backend not running**: Ensure backend server is running on port 8080
- **CORS issues**: Check CORS configuration allows frontend origin

## 📦 Dependencies

The implementation uses:

**Backend:**
- `golang.org/x/oauth2` for Google OAuth2 flow
- Fiber framework for HTTP handling
- Secure server-side credential management

**Frontend:**
- `fetch()` for HTTP requests to backend
- `localStorage` for auth token storage
- React hooks for state management

Clean separation between frontend and backend security concerns!

## 🔄 Future Enhancements

- Database storage for auth tokens
- JWT token implementation
- Refresh token handling
- Multiple OAuth providers (GitHub, etc.)
- Session timeout and cleanup
- Enhanced security with rate limiting

## 📚 Documentation

- [Backend Setup Guide](backend/OAUTH2_SETUP.md) - Detailed backend setup
- [Frontend Setup Guide](frontend/OAUTH_SETUP.md) - Frontend integration guide  
- [Google OAuth2 Docs](https://developers.google.com/identity/protocols/oauth2)
- [Fiber Framework](https://gofiber.io/) - Backend framework documentation

## 🤝 Contributing

1. Follow existing code patterns
2. Add TypeScript types for new features
3. Update documentation
4. Test OAuth flow thoroughly
5. Consider security implications

---

**Note**: This implementation uses backend-handled OAuth2 for security. The frontend never handles sensitive OAuth credentials, making it production-ready with proper deployment practices.