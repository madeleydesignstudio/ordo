# Dashboard Deployment Guide

## Netlify Deployment

This guide covers deploying the Ordo Dashboard to Netlify.

### Prerequisites

1. **Netlify Account**: Sign up at [netlify.com](https://netlify.com)
2. **Git Repository**: Your code should be in a Git repository (GitHub, GitLab, etc.)
3. **Environment Variables**: PostHog analytics configuration

### Required Environment Variables

Set these environment variables in your Netlify site settings:

```bash
# PostHog Analytics Configuration
VITE_PUBLIC_POSTHOG_KEY=your_posthog_project_key_here
VITE_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
VITE_PUBLIC_POSTHOG_UI_HOST=https://us.posthog.com
```

**Note**: For PostHog EU instance, use:
- `VITE_PUBLIC_POSTHOG_HOST=https://eu.i.posthog.com`
- `VITE_PUBLIC_POSTHOG_UI_HOST=https://eu.posthog.com`

### Deployment Steps

#### Option 1: Netlify UI Deployment

1. **Connect Repository**:
   - Go to [Netlify Dashboard](https://app.netlify.com)
   - Click "New site from Git"
   - Connect your Git provider and select your repository

2. **Configure Build Settings**:
   - **Base directory**: Leave empty (uses root)
   - **Build command**: `turbo build --filter=@ordo/dashboard`
   - **Publish directory**: `apps/dashboard/dist`
   - **Node version**: `20` (set in Environment Variables)

3. **Set Environment Variables**:
   - Go to Site Settings → Environment Variables
   - Add the PostHog variables listed above
   - Add `NODE_VERSION=20`

4. **Deploy**:
   - Click "Deploy site"
   - Netlify will automatically build and deploy your site

#### Option 2: Netlify CLI Deployment

1. **Install Netlify CLI**:
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**:
   ```bash
   netlify login
   ```

3. **Initialize Site** (from project root):
   ```bash
   cd apps/dashboard
   netlify init
   ```

4. **Set Environment Variables**:
   ```bash
   netlify env:set VITE_PUBLIC_POSTHOG_KEY "your_key_here"
   netlify env:set VITE_PUBLIC_POSTHOG_HOST "https://us.i.posthog.com"
   netlify env:set VITE_PUBLIC_POSTHOG_UI_HOST "https://us.posthog.com"
   netlify env:set NODE_VERSION "20"
   ```

5. **Deploy**:
   ```bash
   # From project root
   netlify deploy --prod --dir=apps/dashboard/dist
   ```

### Build Configuration

The `netlify.toml` file is already configured with:

- ✅ **Build Command**: `turbo build --filter=@ordo/dashboard`
- ✅ **Publish Directory**: `apps/dashboard/dist`
- ✅ **Node Version**: 20
- ✅ **Security Headers**: Frame protection, XSS protection, etc.
- ✅ **Asset Caching**: Long-term caching for CSS/JS/fonts
- ✅ **Content Types**: Proper MIME types for assets

### Verification

After deployment, verify:

1. **Site Loads**: Visit your Netlify URL
2. **CSS Applied**: Check that styles are properly loaded
3. **Routing Works**: Navigate between different pages
4. **Analytics**: Verify PostHog is tracking (check browser dev tools)

### Troubleshooting

#### CSS Not Loading
- ✅ **Fixed**: CSS import order issue resolved
- Check browser dev tools for 404 errors on CSS files
- Verify `/_build/assets/client-*.css` files are accessible

#### Build Failures
- Check build logs in Netlify dashboard
- Ensure all dependencies are properly installed
- Verify Node version is set to 20

#### Environment Variables
- Double-check variable names (case-sensitive)
- Ensure PostHog key is valid
- Test locally with same environment variables

### Performance Optimization

The build includes:
- ✅ **CSS Minification**: Automatic via Vite
- ✅ **JS Bundling**: Code splitting and tree shaking
- ✅ **Asset Hashing**: Cache busting for updates
- ✅ **Gzip Compression**: Automatic via Netlify

### Security

Security headers are configured:
- ✅ **X-Frame-Options**: Prevents clickjacking
- ✅ **X-XSS-Protection**: XSS protection
- ✅ **X-Content-Type-Options**: MIME type sniffing protection
- ✅ **Referrer-Policy**: Controls referrer information

### Support

For deployment issues:
1. Check Netlify build logs
2. Verify environment variables
3. Test build locally: `turbo build --filter=@ordo/dashboard`
4. Check this repository's issues for known problems 