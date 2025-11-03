# Google OAuth2 Setup for Ordo Backend

This guide explains how to set up Google OAuth2 authentication for the Ordo backend application.

## Prerequisites

1. A Google Cloud Platform (GCP) account
2. A project created in Google Cloud Console

## Google Cloud Console Setup

### 1. Create OAuth2 Credentials

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project or create a new one
3. Navigate to **APIs & Services** > **Credentials**
4. Click **+ CREATE CREDENTIALS** > **OAuth client ID**
5. Select **Web application** as the application type
6. Configure the OAuth consent screen if prompted:
   - Choose **External** user type
   - Fill in required fields (App name, User support email, Developer contact)
   - Add scopes: `userinfo.email` and `userinfo.profile`

### 2. Configure OAuth Client

1. **Name**: Enter a name for your OAuth client (e.g., "Ordo Backend")
2. **Authorized JavaScript origins**: 
   - `http://localhost:8080` (for development)
   - Your production domain when ready
3. **Authorized redirect URIs**:
   - `http://localhost:8080/auth/google/callback` (for development)
   - Your production callback URL when ready

### 3. Get Credentials

After creating the OAuth client, you'll receive:
- **Client ID**: A long string ending in `.apps.googleusercontent.com`
- **Client Secret**: A shorter secret string

## Environment Variables

Create a `.env` file in the `ordo/backend` directory with the following variables:

```env
# Database
DATABASE_URL=your_database_connection_string

# Server
PORT=8080

# Source (existing config)
SOURCE_ID=your_source_id
SOURCE_SECRET=your_source_secret

# Google OAuth2
GOOGLE_CLIENT_ID=your_google_client_id_here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URL=http://localhost:8080/auth/google/callback
```

## Testing the OAuth2 Flow

1. Start your backend server:
   ```bash
   cd ordo/backend
   go run cmd/server/main.go
   ```

2. Open your browser and navigate to:
   ```
   http://localhost:8080/auth/google
   ```

3. You should be redirected to Google's OAuth consent screen

4. After authentication, you'll be redirected back to your callback URL with user information

## API Endpoints

The following OAuth2 endpoints are now available:

- `GET /auth/google` - Initiates the Google OAuth2 flow
- `GET /auth/google/callback` - Handles the OAuth2 callback from Google

## Production Deployment

For production deployment:

1. Update the **Authorized redirect URIs** in Google Cloud Console to include your production domain
2. Update the `GOOGLE_REDIRECT_URL` environment variable to your production callback URL
3. Ensure your production environment has all required environment variables set
4. Consider implementing proper session management and JWT tokens for authenticated users

## Security Considerations

1. Never commit your `.env` file to version control
2. Use environment variables or secure secret management in production
3. Implement proper state parameter validation to prevent CSRF attacks
4. Consider implementing rate limiting on auth endpoints
5. Store user sessions securely (Redis, database, etc.)

## Next Steps

After successful OAuth2 integration, you may want to:

1. Implement user session management
2. Create or update user records in your database
3. Generate JWT tokens for authenticated API access
4. Add logout functionality
5. Implement proper error handling and user feedback

## Troubleshooting

### Common Issues

1. **"redirect_uri_mismatch" error**: 
   - Ensure the redirect URI in your Google Cloud Console matches exactly with `GOOGLE_REDIRECT_URL`

2. **"invalid_client" error**:
   - Check that your `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are correct

3. **"access_denied" error**:
   - User canceled the authentication or your OAuth consent screen needs approval

4. **CORS issues**:
   - Update the CORS configuration in your main.go if needed for your frontend domain

For additional help, check the [Google OAuth2 documentation](https://developers.google.com/identity/protocols/oauth2).