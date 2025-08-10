# Ordo Web App

A task management application built with TanStack Start and Supabase authentication.

## Features

- ✅ User authentication (sign up, sign in, sign out)
- ✅ Protected routes
- ✅ Responsive design
- 🚧 Task management (coming soon)

## Tech Stack

- **Frontend**: React 19, TanStack Start (React Router)
- **Authentication**: Supabase Auth
- **Build Tool**: Vite
- **Package Manager**: pnpm

## Setup Instructions

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to your project's Settings > API
3. Copy your project URL and anon key

### 3. Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in your Supabase credentials in `.env.local`:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

### 4. Configure Supabase Authentication

In your Supabase dashboard:

1. Go to **Authentication > Settings**
2. Add your site URL to **Site URL**: `http://localhost:3001`
3. Add redirect URLs if needed
4. Enable email confirmations or disable them for development

### 5. Run the Development Server

```bash
pnpm dev
```

The app will be available at `http://localhost:3001`

## Authentication Flow

1. **Unauthenticated users** see a login/signup form
2. **New users** can sign up with email/password
3. **Existing users** can sign in
4. **Authenticated users** can access the protected dashboard
5. **Users can sign out** using the navigation button

## Project Structure

```
src/
├── components/
│   ├── LoginForm.tsx       # Authentication form
│   ├── Navigation.tsx      # Top navigation with user info
│   └── ProtectedRoute.tsx  # Route protection wrapper
├── contexts/
│   └── AuthContext.tsx     # Authentication state management
├── lib/
│   └── supabase.ts        # Supabase client configuration
├── routes/
│   ├── __root.tsx         # Root layout with AuthProvider
│   └── index.tsx          # Home page (protected)
└── types/                 # TypeScript type definitions
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | Yes |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anonymous key | Yes |

## Development

### Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production

### Adding New Features

1. **Protected Routes**: Wrap any route component with `<ProtectedRoute>`
2. **User Data**: Access user info via the `useAuth()` hook
3. **Authentication State**: Use `user`, `loading`, `signIn`, `signUp`, `signOut` from `useAuth()`

### Example Usage

```tsx
import { useAuth } from '../contexts/AuthContext'

function MyComponent() {
  const { user, signOut } = useAuth()
  
  return (
    <div>
      <p>Welcome, {user?.email}</p>
      <button onClick={signOut}>Sign Out</button>
    </div>
  )
}
```

## Troubleshooting

### Common Issues

1. **"Missing Supabase environment variables"**
   - Make sure `.env.local` exists and contains the correct values
   - Restart the dev server after adding environment variables

2. **Authentication not working**
   - Check your Supabase project settings
   - Verify the Site URL is set correctly
   - Make sure your Supabase keys are correct

3. **Email confirmation issues**
   - For development, you can disable email confirmation in Supabase Auth settings
   - For production, configure your email templates

### Getting Help

- Check the [Supabase Auth documentation](https://supabase.com/docs/guides/auth)
- Review [TanStack Router documentation](https://tanstack.com/router)

## Next Steps

- [ ] Add user profiles
- [ ] Implement task CRUD operations
- [ ] Add task categories and tags
- [ ] Implement real-time updates
- [ ] Add mobile responsiveness
- [ ] Set up deployment