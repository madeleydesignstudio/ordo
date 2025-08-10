# Ordo Web Application

A modern web application built with TanStack Start, React, and Supabase authentication.

## Features

- 🔐 Complete authentication system with Supabase
- 🌐 Multiple OAuth providers (Google, GitHub)
- 📧 Email/password authentication
- 🛡️ Protected routes - all routes require authentication
- 🎨 Modern UI with Tailwind CSS and custom components
- 🚀 Built with TanStack Start for optimal performance
- 📱 Responsive design with dark mode support
- ⚡ Real-time session management
- 🔄 OAuth callback handling
- 🛠️ TypeScript support with full type safety

## Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (recommended package manager)
- Supabase account and project

### Environment Setup

1. Copy the environment example file:
   ```bash
   cp .env.example .env.local
   ```

2. Update `.env.local` with your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

   You can find these values in your Supabase project dashboard under Settings > API.

### Installation

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Start the development server:
   ```bash
   pnpm dev
   ```

3. Open [http://localhost:3001](http://localhost:3001) in your browser.

## Authentication Flow

The application implements a complete authentication system:

1. **Protected Routes**: All routes are protected and require authentication
2. **Multiple Sign-in Options**: 
   - Email/password authentication
   - Google OAuth
   - GitHub OAuth
3. **OAuth Callback Handling**: Dedicated route for processing OAuth redirects
4. **Session Management**: Automatic session handling with refresh tokens
5. **Error Handling**: Comprehensive error messages and user feedback
6. **Logout**: Secure sign out functionality

### Key Components

- **AuthProvider**: Context provider for authentication state
- **ProtectedRoute**: Wrapper component that enforces authentication
- **Auth**: Login/signup form with email/password and OAuth options
- **OAuthButton**: Reusable component for OAuth provider sign-in
- **AuthError**: Enhanced error display component with dismiss functionality
- **Navigation**: Header with user info and logout button
- **OAuth Callback**: Dedicated route for handling OAuth redirects

## Project Structure

```
src/
├── components/
│   ├── Auth.tsx              # Authentication form with OAuth
│   ├── AuthError.tsx         # Error display component
│   ├── Navigation.tsx        # App navigation with logout
│   ├── OAuthButton.tsx       # Reusable OAuth provider button
│   ├── GoogleSignInButton.tsx # Legacy Google sign-in component
│   └── ProtectedRoute.tsx    # Route protection wrapper
├── contexts/
│   └── AuthContext.tsx       # Authentication context and provider
├── hooks/
│   ├── useAuth.ts           # Authentication hook
│   └── useOAuth.ts          # OAuth utilities hook
├── routes/
│   ├── __root.tsx           # Root layout with auth provider
│   ├── auth.callback.tsx    # OAuth callback handler
│   └── index.tsx            # Protected home page
├── types/
│   └── database.ts          # TypeScript types for Supabase
├── utils/
│   └── supabase.ts          # Supabase client configuration
└── styles/
    └── app.css              # Global styles
```

### Supabase Setup

### Database Tables

The application uses the following database structure (managed by Drizzle ORM):

- `users_table`: User profiles
- `posts_table`: User posts (with foreign key to users)

### Authentication

Supabase Auth is configured with:
- Email/password authentication
- Google OAuth authentication  
- GitHub OAuth authentication
- Automatic session management
- OAuth callback handling
- Email confirmation for new signups
- Real-time auth state changes

### OAuth Providers Setup

#### Google OAuth Setup

1. **Google Cloud Console Setup:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Enable the Google+ API
   - Go to "Credentials" and create OAuth 2.0 Client IDs
   - Add authorized redirect URIs:
     - Production: `https://your-project-ref.supabase.co/auth/v1/callback`
     - Development: `http://localhost:54321/auth/v1/callback` (if using local Supabase)

2. **Supabase Configuration:**
   - Go to your Supabase project dashboard
   - Navigate to Authentication > Providers
   - Enable the Google provider
   - Add your Google OAuth Client ID and Client Secret

#### GitHub OAuth Setup

1. **GitHub OAuth App Setup:**
   - Go to [GitHub Developer Settings](https://github.com/settings/developers)
   - Create a new OAuth App
   - Set Authorization callback URL:
     - Production: `https://your-project-ref.supabase.co/auth/v1/callback`
     - Development: `http://localhost:54321/auth/v1/callback`

2. **Supabase Configuration:**
   - Navigate to Authentication > Providers in your Supabase dashboard
   - Enable the GitHub provider
   - Add your GitHub Client ID and Client Secret

#### Common Configuration

For all OAuth providers, configure these URLs in Supabase:
- **Site URL:** 
  - Production: `https://your-domain.com`
  - Development: `http://localhost:3001`
- **Redirect URLs:**
  - Production: `https://your-domain.com/auth/callback`
  - Development: `http://localhost:3001/auth/callback`

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | `https://abc123.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anonymous key | `eyJhbGciOiJIUzI1NiIs...` |

## Development

### Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production

## Authentication Testing

### Email/Password Authentication
1. Navigate to the app - you'll see the login form
2. Click "Don't have an account? Sign up" to create a new account
3. After signup, check your email for confirmation (if email confirmation is enabled)
4. Sign in with your credentials
5. You'll be redirected to the protected dashboard

### OAuth Authentication
1. Click "Continue with Google" or "Continue with GitHub"
2. You'll be redirected to the provider's authorization page
3. Grant permissions to your app
4. You'll be redirected back to `/auth/callback` for processing
5. Finally redirected to the protected dashboard

### Testing OAuth Locally
- Ensure your OAuth providers are configured with `http://localhost:3001/auth/callback`
- Start the development server with `pnpm dev`
- Test each OAuth provider individually

## Deployment

### Vercel (Recommended)

1. Connect your repository to Vercel
2. Add environment variables in Vercel dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Deploy

### Other Platforms

The application can be deployed to any platform that supports Node.js applications. Make sure to:

1. Set the required environment variables
2. Build the application with `pnpm build`
3. Serve the built files

## Security Considerations

- Environment variables are properly prefixed with `VITE_` for client-side access
- Supabase Row Level Security (RLS) should be enabled for production
- The anonymous key is safe to expose as it only allows access to your auth and authorized data
- OAuth redirects are properly validated through Supabase's security layer
- Authentication state is managed securely with automatic token refresh
- All OAuth providers use secure HTTPS redirects in production
- Error handling prevents sensitive information from being exposed to users

## API Integration

The app includes hooks and utilities for easy integration with your backend:

```typescript
// Using the auth context
const { user, session, signOut } = useAuth();

// Using OAuth utilities
const { signInWithGoogle, signInWithGitHub, loading, error } = useOAuth();

// Accessing user data
console.log(user?.email, user?.id, session?.access_token);
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the ISC License.