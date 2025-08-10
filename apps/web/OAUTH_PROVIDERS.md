# Adding New OAuth Providers

This guide explains how to add additional OAuth providers to your authentication system.

## Supported Providers

Supabase supports the following OAuth providers:

- **Social Providers:**
  - Google ✅ (Implemented)
  - GitHub ✅ (Implemented)

- **Developer Platforms:**
  - GitLab
  - Bitbucket
  - Figma
  - Notion
  - Slack

- **Enterprise:**
  - Azure (Microsoft)
  - WorkOS
  - SAML

## Implementation Steps

### 1. Configure Provider in Supabase

1. Go to your Supabase project dashboard
2. Navigate to **Authentication > Providers**
3. Find your desired provider and click **Enable**
4. Add the required credentials (Client ID, Client Secret, etc.)
5. Configure redirect URLs:
   - Production: `https://your-project-ref.supabase.co/auth/v1/callback`
   - Development: `http://localhost:54321/auth/v1/callback`

### 2. Update the OAuth Hook

Add the new provider to `src/hooks/useOAuth.ts`:

```typescript
const signInWithDiscord = useCallback(
  (options?: UseOAuthOptions) => signInWithProvider("discord", options),
  [signInWithProvider]
);

// Add to return object
return {
  // ... existing providers
  signInWithDiscord,
};
```

### 3. Update Auth Context

Add the new provider method to `src/contexts/AuthContext.tsx`:

```typescript
interface AuthContextType {
  // ... existing methods
  signInWithDiscord: () => Promise<{ error: AuthError | null }>;
}

// In AuthProvider component
const signInWithDiscord = async () => {
  return await oAuth.signInWithDiscord();
};

// Add to context value
const value = {
  // ... existing values
  signInWithDiscord,
};
```

### 4. Add Provider Icon and Configuration

Update `src/components/OAuthButton.tsx` to include the new provider:

```typescript
interface OAuthButtonProps {
  provider: "google" | "github" | "discord"; // Add new provider
  // ... other props
}

const providers: Record<string, OAuthProvider> = {
  // ... existing providers
  discord: {
    name: "Discord",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        {/* Discord SVG icon path */}
        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.191.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
      </svg>
    ),
    action: signInWithDiscord,
  },
};
```

### 5. Add Provider to Auth Component

Update `src/components/Auth.tsx` to include the new OAuth button:

```typescript
<div className="mt-6 space-y-3">
  <OAuthButton
    provider="google"
    disabled={loading}
    onError={handleGoogleError}
  />
  <OAuthButton
    provider="github"
    disabled={loading}
    onError={handleGoogleError}
  />
  <OAuthButton
    provider="discord"
    disabled={loading}
    onError={handleGoogleError}
  />
</div>
```

## Provider-Specific Setup Guides

### Discord OAuth

1. **Discord Developer Portal:**
   - Go to [Discord Developer Portal](https://discord.com/developers/applications)
   - Create a new application
   - Go to OAuth2 settings
   - Add redirect URI: `https://your-project-ref.supabase.co/auth/v1/callback`
   - Copy Client ID and Client Secret

2. **Supabase Configuration:**
   - Enable Discord provider
   - Paste Discord Client ID and Secret
   - No additional scopes needed for basic auth

### Twitter OAuth

1. **Twitter Developer Portal:**
   - Apply for a developer account at [Twitter Developer](https://developer.twitter.com/)
   - Create a new app
   - Enable OAuth 1.0a or OAuth 2.0
   - Add callback URL: `https://your-project-ref.supabase.co/auth/v1/callback`

2. **Supabase Configuration:**
   - Enable Twitter provider
   - Use API Key as Client ID and API Secret as Client Secret

### Facebook OAuth

1. **Facebook Developers:**
   - Go to [Facebook Developers](https://developers.facebook.com/)
   - Create a new app
   - Add Facebook Login product
   - Configure OAuth redirect URIs
   - Get App ID and App Secret

2. **Supabase Configuration:**
   - Enable Facebook provider
   - Use App ID as Client ID and App Secret as Client Secret

## Testing New Providers

1. **Local Development:**
   ```bash
   # Start the development server
   pnpm dev

   # Navigate to http://localhost:3001
   # Test the new OAuth provider button
   ```

2. **Check OAuth Flow:**
   - Click the new provider button
   - Verify redirect to provider's authorization page
   - Complete authorization
   - Verify redirect back to `/auth/callback`
   - Verify successful authentication

3. **Error Handling:**
   - Test with invalid credentials
   - Test network failures
   - Verify error messages are displayed correctly

## Common Issues

### Redirect URI Mismatch
- Ensure the redirect URI in the provider console matches exactly
- Check for trailing slashes and protocol (http vs https)

### Invalid Client Credentials
- Verify Client ID and Client Secret are correctly copied
- Check for extra spaces or hidden characters

### Scope Issues
- Some providers require specific scopes for user information
- Add required scopes in the `useOAuth` hook options

### Development vs Production
- Use different OAuth apps for development and production
- Ensure environment variables are set correctly for each environment

## Best Practices

1. **Security:**
   - Never commit OAuth credentials to version control
   - Use environment variables for all sensitive data
   - Implement proper error handling to avoid credential leakage

2. **User Experience:**
   - Provide clear loading states during OAuth flows
   - Display helpful error messages for common issues
   - Allow users to retry failed authentication attempts

3. **Testing:**
   - Test each provider individually
   - Verify the entire OAuth flow from start to finish
   - Test error scenarios and edge cases

4. **Monitoring:**
   - Track OAuth success/failure rates
   - Monitor for unusual authentication patterns
   - Set up alerts for authentication errors
