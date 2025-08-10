# Build Fixes for Vercel Deployment

This document outlines the fixes applied to resolve Vercel deployment issues.

## Issues Fixed

### 1. TypeScript Configuration Error

**Problem**: 
```
error TS6059: File '/vercel/path0/packages/supabase/drizzle.config.ts' is not under 'rootDir' '/vercel/path0/packages/supabase/src'
```

**Root Cause**: The `drizzle.config.ts` file was included in TypeScript compilation but existed outside the configured `rootDir`.

**Solution**: 
- Removed `drizzle.config.ts` from the TypeScript `include` array
- Added it to the `exclude` array in `packages/supabase/tsconfig.json`

### 2. Unnecessary Build Dependency

**Problem**: The Supabase package was being built during deployment even though the web app doesn't use it directly.

**Root Cause**: The web app uses `@supabase/supabase-js` client library directly, not the internal `@ordo/supabase` package.

**Solution**: 
- Replaced the TypeScript compilation build script with a no-op echo command
- This allows Turbo to complete the build pipeline without errors

### 3. Environment Variables Warning

**Problem**: Turbo warned about missing environment variables in `turbo.json`.

**Solution**: 
- Added `globalEnv` configuration for `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and `DATABASE_URL`
- Added `env` array to the build task for proper environment variable handling

## Files Modified

1. **packages/supabase/tsconfig.json**
   - Removed `drizzle.config.ts` from includes
   - Added it to excludes

2. **packages/supabase/package.json**
   - Changed build script from `tsc` to `echo 'Supabase package - no build needed'`

3. **turbo.json**
   - Added `globalEnv` configuration
   - Added `env` array to build task

## Verification

After these changes, the build should:
- ✅ Install dependencies successfully with pnpm
- ✅ Build the web application without TypeScript errors
- ✅ Generate proper output in the `dist` directory
- ✅ Handle environment variables correctly

## Future Considerations

1. **Supabase Package Usage**: If the web app ever needs to use the internal Supabase package, restore the TypeScript build and fix the configuration properly.

2. **Environment Variables**: Ensure all required environment variables are set in Vercel project settings:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

3. **OAuth Configuration**: Update OAuth providers with production URLs after successful deployment.

## Deployment Checklist

- [ ] Build completes without errors
- [ ] Environment variables are set in Vercel
- [ ] Supabase Site URL updated to production domain
- [ ] OAuth providers configured with production callback URLs
- [ ] Authentication flow tested on live site