# Update Notification System

This document describes the automated update notification system that detects when new deployments are available and prompts users to refresh their browser to get the latest version.

## Overview

The update notification system combines two detection methods:

1. **Deployment Detection**: Monitors `version.json` for new deployments
2. **PWA Updates**: Handles service worker updates from `vite-plugin-pwa`

When an update is detected, users see a prominent popup with options to refresh immediately or dismiss temporarily.

## How It Works

### 1. Version Generation (Build Time)

During the build process (`vite.config.ts`), a `version.json` file is automatically generated:

```json
{
  "version": "1703123456789",
  "timestamp": 1703123456789,
  "updated": "2023-12-20T14:30:56.789Z"
}
```

This file is created in the `public` directory and deployed with your app.

### 2. Client-Side Detection

The `useAppUpdates` hook continuously monitors for updates:

- **Initial Check**: Runs 1 second after app load
- **Periodic Checks**: Every 30 seconds
- **Visibility Checks**: When user returns to the tab
- **Focus Checks**: When user focuses the window

### 3. Version Comparison

The system compares:
- **Stored Version**: Last known version in localStorage (`app_version`)
- **Server Version**: Current version from `/version.json`

If they differ, an update notification is triggered.

### 4. Update Process

When "Refresh Now" is clicked:

1. **Cache Clearing**: All browser caches are cleared
2. **Service Worker Cleanup**: All service workers are unregistered
3. **Hard Refresh**: Browser performs a cache-busted reload
4. **URL Cache Busting**: Adds version and random parameters

## Components

### `useAppUpdates` Hook

Located in `src/hooks/useAppUpdates.ts`

**Features:**
- Handles both deployment and PWA updates
- Manages dismissal state (5-minute timeout)
- Provides force refresh functionality
- Automatic fallback to build timestamp

**API:**
```typescript
const {
  showUpdatePrompt,      // boolean: Show update popup
  updateType,           // 'deployment' | 'pwa' | null
  isChecking,           // boolean: Currently checking for updates
  handleUpdate,         // function: Apply the update
  dismissUpdate,        // function: Dismiss the notification
  forceRefresh         // function: Force hard refresh
} = useAppUpdates();
```

### `UpdateNotification` Component

Located in `src/components/UpdateNotification.tsx`

**Features:**
- Modal popup overlay design
- Different messaging for deployment vs PWA updates
- Loading states during refresh process
- Responsive design

### `UpdateStatusIndicator` Component

Located in `src/components/UpdateStatusIndicator.tsx`

**Features:**
- Small corner indicator when checking for updates
- Animated spinner
- Configurable position
- Auto-hides when update prompt is shown

## Configuration

### Check Intervals

Modify in `useAppUpdates.ts`:

```typescript
// Check every 30 seconds (current default)
const interval = setInterval(checkForDeploymentUpdate, 30000);

// Change to 60 seconds
const interval = setInterval(checkForDeploymentUpdate, 60000);
```

### Dismissal Timeout

Modify in `useAppUpdates.ts`:

```typescript
// Reset dismissal after 5 minutes (current default)
setTimeout(() => {
  setIsDismissed(false);
}, 5 * 60 * 1000);

// Change to 10 minutes
setTimeout(() => {
  setIsDismissed(false);
}, 10 * 60 * 1000);
```

### Position of Status Indicator

```typescript
// In your component
<UpdateStatusIndicator position="top-right" />
<UpdateStatusIndicator position="bottom-left" />
<UpdateStatusIndicator position="bottom-right" /> // default
```

## Testing

### Manual Testing

1. **Build the app**: `bun run build`
2. **Run test script**: `node test-update.js`
3. **Open app in browser**
4. **Trigger check** by switching tabs or waiting 30 seconds
5. **Verify popup appears**

### Test Script

The `test-update.js` script creates a new `version.json` file to simulate a deployment:

```bash
node test-update.js
```

This will:
- Generate a new timestamp version
- Update the `public/version.json` file
- Show instructions for testing

## Deployment Integration

### Automatic Version Generation

The system automatically generates version files during build. No manual intervention needed.

### CDN Considerations

If using a CDN, ensure:
- `version.json` is not cached aggressively
- Cache-Control headers allow frequent checks
- The file is available at `/version.json`

### Environment Variables

You can customize the build timestamp if needed:

```typescript
// In vite.config.ts
const buildTimestamp = process.env.BUILD_ID ? 
  parseInt(process.env.BUILD_ID) : 
  Date.now();
```

## Troubleshooting

### Updates Not Detected

1. **Check Network Tab**: Verify `version.json` requests are being made
2. **Check Console**: Look for version check logs
3. **Verify File**: Ensure `public/version.json` exists after build
4. **Clear Storage**: Clear localStorage and test again

### False Positives

If updates trigger too frequently:

1. **Check Build Process**: Ensure consistent version generation
2. **Verify Deployment**: Make sure version.json is deployed correctly
3. **Check Caching**: Verify CDN/server caching configuration

### Performance Impact

The system is designed to be lightweight:

- Minimal network requests (30-second intervals)
- Efficient caching strategies
- No impact when updates aren't available
- Graceful degradation if version.json unavailable

## Browser Compatibility

- **Modern Browsers**: Full support (Chrome 60+, Firefox 55+, Safari 11+)
- **Service Workers**: Required for PWA updates
- **Fetch API**: Required for version checking
- **LocalStorage**: Required for version tracking

## Security Considerations

- **No Sensitive Data**: Version info contains no sensitive information
- **HTTPS Only**: Service workers require HTTPS in production
- **Same-Origin**: Version checks respect same-origin policy
- **Cache Busting**: Prevents cache poisoning attacks

## Best Practices

1. **Test Before Deploy**: Always test the update flow in staging
2. **Monitor Logs**: Watch for version check errors in production
3. **Gradual Rollouts**: Consider feature flags for major updates
4. **User Communication**: Clearly communicate what's new after updates
5. **Backup Strategy**: Have rollback procedures for failed deployments

## Future Enhancements

Potential improvements:

- **Update Changelog**: Show what's new in updates
- **Scheduled Updates**: Allow users to schedule updates
- **Update Analytics**: Track update adoption rates
- **Selective Updates**: Only prompt for critical updates
- **Background Updates**: Download updates in background