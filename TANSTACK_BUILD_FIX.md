# TanStack Start Vercel Deployment Fix

## Problem
The build was failing because TanStack Start with Vercel target has specific requirements for deployment that weren't properly configured.

## Root Cause Analysis

1. **Missing Route Tree Generation**: TanStack Router requires the route tree to be generated before building
2. **Incorrect Output Directory**: TanStack Start with Vercel target manages its own output structure
3. **Missing CLI Dependency**: The TanStack Router CLI wasn't installed for route generation

## Solutions Applied

### 1. Added TanStack Router CLI
```json
// apps/web/package.json
"devDependencies": {
  "@tanstack/router-cli": "^1.131.2",
  // ... other deps
}
```

### 2. Updated Build Script
```json
// apps/web/package.json
"scripts": {
  "build": "tsr generate && vite build"
}
```

### 3. Created Router Configuration
```json
// apps/web/tsr.config.json
{
  "routesDirectory": "./src/routes",
  "generatedRouteTree": "./src/routeTree.gen.ts",
  "routeFileIgnorePrefix": "-",
  "quoteStyle": "double"
}
```

### 4. Updated Turbo Configuration
```json
// turbo.json
{
  "tasks": {
    "build": {
      "outputs": [".vercel/**", "dist/**", "build/**"]
    }
  }
}
```

### 5. Simplified Vercel Configuration
```json
// apps/web/vercel.json
{
  "installCommand": "npm install -g pnpm@10.4.1",
  "buildCommand": "cd ../.. && pnpm install && pnpm build --filter=web",
  "framework": null
}
```

## Expected Build Flow

1. **Install pnpm globally**
2. **Install workspace dependencies** from monorepo root
3. **Generate route tree** with `tsr generate`
4. **Build with Vite** using TanStack Start plugin
5. **Create Vercel output** in `.vercel/output` directory

## Verification Steps

After deployment succeeds:

1. **Check Build Logs**: Verify route tree generation completes
2. **Test Routes**: Ensure all routes are accessible
3. **Test Authentication**: Verify OAuth flows work in production
4. **Check Environment Variables**: Ensure Supabase variables are loaded

## TanStack Start + Vercel Specifics

- TanStack Start with `target: "vercel"` automatically generates the correct output structure
- No need to specify custom output directory in `vercel.json`
- Route tree must be generated before build
- Server-side rendering is handled by TanStack Start's Vercel adapter

## Post-Deployment Checklist

- [ ] Update Supabase Site URL to production domain
- [ ] Add production callback URL: `https://your-app.vercel.app/auth/callback`
- [ ] Update Google OAuth redirect URLs
- [ ] Update GitHub OAuth redirect URLs
- [ ] Test email/password authentication
- [ ] Test Google OAuth flow
- [ ] Test GitHub OAuth flow
- [ ] Verify protected routes work correctly

## Troubleshooting

### Route Tree Generation Fails
```bash
# Manually generate route tree
pnpm tsr generate
```

### Build Output Missing
- Ensure TanStack Start plugin is configured with `target: "vercel"`
- Check that route tree generation completes successfully
- Verify no TypeScript compilation errors

### Environment Variables Not Available
- Add variables in Vercel project settings
- Ensure variables are prefixed with `VITE_` for client-side access
- Check turbo.json includes variables in `globalEnv`

## References

- [TanStack Start Deployment Guide](https://tanstack.com/start/latest/docs/deployment)
- [Vercel Monorepo Guide](https://vercel.com/docs/concepts/git/monorepos)
- [TanStack Router CLI](https://tanstack.com/router/latest/docs/guide/cli)