# ElectricSQL Cloud Setup Guide

This guide will help you set up ElectricSQL Cloud for bidirectional sync between your local PGlite database and Supabase PostgreSQL.

## Prerequisites

- A Supabase project with PostgreSQL database
- Access to your Supabase database connection string
- Node.js/Bun environment set up

## Step 1: Sign up for ElectricSQL Cloud

1. Go to https://console.electric-sql.com
2. Create an account or log in if you already have one
3. ElectricSQL Cloud is currently in public BETA and free to use

## Step 2: Connect Your Supabase Database

1. In the Electric Cloud console, click **"New Source"**
2. Fill in the following details:
   - **Region**: Choose the region closest to your users
   - **Team**: Select or create a team
   - **PostgreSQL Connection String**: Your Supabase connection string

### Finding Your Supabase Connection String

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **Database**
3. Scroll down to **Connection string**
4. Copy the **URI** connection string (it looks like):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```

3. Click **"Connect Source"** in Electric Cloud
4. Wait for the source state to become **"active"**

## Step 3: Get Your Electric Cloud Credentials

1. Once your source is active, you'll see your source details
2. Copy the following values:
   - **Source ID**: A UUID that identifies your database
   - **Source Secret**: A long secret token for authentication

## Step 4: Configure Environment Variables

1. In your Ordo web app directory (`ordo/apps/web/`), create or update your `.env.local` file:

```bash
# Backend Sync Configuration
VITE_SYNC_BACKEND_URL=http://localhost:3001

# ElectricSQL Cloud Configuration
VITE_ELECTRIC_URL=https://api.electric-sql.cloud
VITE_ELECTRIC_SOURCE_ID=your-source-id-here
VITE_ELECTRIC_SECRET=your-secret-here
VITE_ELECTRIC_SYNC_ENABLED=true
```

2. Replace `your-source-id-here` and `your-secret-here` with the actual values from Electric Cloud

## Step 5: Test the Setup

1. Start your development server:
   ```bash
   bun run dev
   ```

2. Open the app in your browser
3. Look for the **ElectricSQL Sync Status** section
4. You should see:
   - ✅ Green dot: "Electric Sync Up to Date" (if working)
   - 🟡 Yellow dot: "Electric Sync Not Configured" (if credentials missing)
   - 🔴 Red dot: "Electric Sync Error" (if there's an issue)

## Step 6: Verify Bidirectional Sync

### Test Local → Cloud (via Custom Backend)
1. Create a new task in the web app
2. Click **"Sync to Cloud"**
3. Check your Supabase database to confirm the task was created

### Test Cloud → Local (via ElectricSQL)
1. Add a task directly to your Supabase database (via SQL editor or API)
2. The task should automatically appear in your local app within a few seconds

## Troubleshooting

### Electric Sync Not Configured
- Check that `VITE_ELECTRIC_SOURCE_ID` and `VITE_ELECTRIC_SECRET` are set
- Ensure `VITE_ELECTRIC_SYNC_ENABLED=true`
- Restart your dev server after changing environment variables

### Electric Sync Error
- Verify your Electric Cloud credentials are correct
- Check the browser console for detailed error messages
- Ensure your Supabase database is accessible from Electric Cloud
- Check that your database has the `tasks` table with the expected schema

### Sync Not Working
- Confirm both sync systems are working independently:
  - Local → Cloud: Test the "Sync to Cloud" button
  - Cloud → Local: Add data directly to Supabase and check if it appears locally
- Check network connectivity
- Look for error messages in the browser console

## Security Considerations

⚠️ **Important**: The current setup exposes Electric credentials in the client code, which is suitable for development only.

For production, you should:
1. Set up a proxy API that adds Electric credentials server-side
2. Never expose `VITE_ELECTRIC_SECRET` in client builds
3. Use environment-specific configuration

Example proxy setup:
```typescript
// pages/api/electric-proxy.ts
export default async function handler(req: NextRequest) {
  const url = new URL(req.url);
  const electricUrl = new URL('/v1/shape', 'https://api.electric-sql.cloud');
  
  // Copy query params
  url.searchParams.forEach((value, key) => {
    electricUrl.searchParams.set(key, value);
  });
  
  // Add credentials server-side
  electricUrl.searchParams.set('source_id', process.env.ELECTRIC_SOURCE_ID);
  electricUrl.searchParams.set('secret', process.env.ELECTRIC_SECRET);
  
  return fetch(electricUrl);
}
```

## Architecture Overview

```
┌─────────────────┐    Custom Backend    ┌──────────────────────┐
│   Local PGlite  │ ────────────────────► │ Supabase PostgreSQL │
│                 │                       │                      │
│                 │ ◄──────────────────── │                      │
└─────────────────┘    ElectricSQL        └──────────────────────┘
```

- **Local → Cloud**: Your custom sync backend handles local changes
- **Cloud → Local**: ElectricSQL streams changes from Supabase back to local
- **Real-time**: ElectricSQL provides near real-time sync
- **Offline-first**: Local PGlite works completely offline

## Next Steps

- Set up production proxy for secure credential handling
- Configure shape filters for more efficient sync
- Explore conflict resolution strategies
- Monitor sync performance and costs

For more information, see:
- [ElectricSQL Documentation](https://electric-sql.com/docs/)
- [PGlite Sync Documentation](https://pglite.dev/docs/sync)