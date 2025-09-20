# Update Notification System

This document describes the automated update notification system that detects when new deployments are available and prompts users to refresh their browser to get the latest version.

## Overview

The update notification system combines two detection methods with mobile-optimized enhancements:

1. **Deployment Detection**: Monitors `version.json` for new deployments
2. **PWA Updates**: Handles service worker updates from `vite-plugin-pwa`
3. **Mobile Optimization**: Enhanced caching strategies and device-specific handling

When an update is detected, users see a prominent popup with options to refresh immediately or dismiss temporarily. The system includes special optimizations for mobile browsers and PWA installations.

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

The `useAppUpdates` hook continuously monitors for updates with mobile optimizations:

- **Initial Check**: Runs 2 seconds after app load (delayed for mobile startup)
- **Periodic Checks**: Every 20 seconds on mobile, 30 seconds on desktop
- **Visibility Checks**: When user returns to the tab
- **Focus Checks**: When user focuses the window
- **Mobile-Specific**: Orientation changes, online/offline events, page restoration
- **Enhanced Caching**: Aggressive cache-busting headers for mobile browsers

### 3. Version Comparison

The system compares:
- **Stored Version**: Last known version in localStorage (`app_version`)
- **Server Version**: Current version from `/version.json`

If they differ, an update notification is triggered.

### 4. Update Process

When "Refresh Now" (or "Tap to Refresh" on mobile) is clicked:

1. **Device Detection**: Identifies mobile browser, PWA installation, iOS/Android
2. **Enhanced Cache Clearing**: 
   - All browser caches cleared
   - IndexedDB cleanup (preserving user data)
   - WebStorage management
   - iOS/Android-specific cache clearing
3. **Service Worker Cleanup**: All service workers are unregistered
4. **Hard Refresh**: Device-appropriate reload strategy
5. **URL Cache Busting**: Multiple cache-busting parameters

## Components

### `useAppUpdates` Hook

Located in `src/hooks/useAppUpdates.ts`

**Features:**
- Handles both deployment and PWA updates
- Mobile-optimized update detection and cache clearing
- Manages dismissal state (3-minute timeout on mobile, 5-minute on desktop)
- Device-specific refresh strategies
- Enhanced event listening for mobile devices
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
- Mobile-responsive messaging and sizing
- Device-specific content (PWA, mobile browser, desktop)
- Different messaging for deployment vs PWA updates
- Touch-optimized buttons ("Tap to Refresh")
- Loading states during refresh process

### `UpdateStatusIndicator` Component

Located in `src/components/UpdateStatusIndicator.tsx`

**Features:**
- Small corner indicator when checking for updates
- Animated spinner
- Configurable position
- Auto-hides when update prompt is shown
- Mobile-optimized sizing

### `MobileUpdateHelper` Class

Located in `src/utils/mobileUpdateHelper.ts`

**Features:**
- Device detection (iOS, Android, PWA, browser type)
- Comprehensive mobile cache clearing strategies
- IndexedDB management with data preservation
- iOS and Android-specific optimizations
- Enhanced network request handling for mobile
- Mobile-specific event listener management

## Configuration

### Check Intervals

Modify in `useAppUpdates.ts`:

```typescript
// Current mobile-optimized defaults
const checkInterval = isMobile() ? 20000 : 30000; // 20s mobile, 30s desktop
const interval = setInterval(checkForDeploymentUpdate, checkInterval);

// Customize intervals
const checkInterval = isMobile() ? 15000 : 45000; // 15s mobile, 45s desktop
```

### Dismissal Timeout

Modify in `useAppUpdates.ts`:

```typescript
// Mobile-optimized timeouts (current default)
const timeoutDuration = isMobile() ? 3 * 60 * 1000 : 5 * 60 * 1000; // 3min mobile, 5min desktop

setTimeout(() => {
  setIsDismissed(false);
}, timeoutDuration);

// Customize timeouts
const timeoutDuration = isMobile() ? 2 * 60 * 1000 : 10 * 60 * 1000; // 2min mobile, 10min desktop
```

### Position of Status Indicator

```typescript
// In your component
<UpdateStatusIndicator position="top-right" />
<UpdateStatusIndicator position="bottom-left" />
<UpdateStatusIndicator position="bottom-right" /> // default
```

## Testing

### Desktop Testing

1. **Build the app**: `bun run build`
2. **Run test script**: `node test-update.js`
3. **Open app in browser**
4. **Trigger check** by switching tabs or waiting 30 seconds
5. **Verify popup appears**

### Mobile Testing

1. **Build the app**: `bun run build`
2. **Access via mobile device**: Use local IP or ngrok tunnel
3. **Install as PWA** (optional): Add to home screen
4. **Run test script**: `node test-update.js`
5. **Trigger check** by switching apps or waiting 20 seconds
6. **Verify mobile-optimized popup appears**

**See [MOBILE_UPDATE_TESTING.md](MOBILE_UPDATE_TESTING.md) for comprehensive mobile testing guide.**

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
- Mobile-specific cache headers are supported
- HTTPS is enabled (required for PWA features)

### Mobile Deployment Considerations

- **Service Worker Updates**: Ensure proper PWA configuration
- **Cache Headers**: Mobile browsers cache more aggressively
- **Network Timeouts**: Longer timeouts for mobile networks (15s vs 10s)
- **Installation Prompts**: Configure PWA manifest correctly

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

**Desktop:**
1. **Check Network Tab**: Verify `version.json` requests are being made
2. **Check Console**: Look for version check logs
3. **Verify File**: Ensure `public/version.json` exists after build
4. **Clear Storage**: Clear localStorage and test again

**Mobile:**
1. **Enable Remote Debugging**: Chrome DevTools or Safari Web Inspector
2. **Check Mobile Console**: Look for mobile-specific logs
3. **Verify Network Requests**: Ensure cache-busting headers are sent
4. **Test Data Saver**: Disable data saver modes that might block requests
5. **PWA Installation**: Test both browser and installed PWA versions

### False Positives

If updates trigger too frequently:

1. **Check Build Process**: Ensure consistent version generation
2. **Verify Deployment**: Make sure version.json is deployed correctly
3. **Check Caching**: Verify CDN/server caching configuration

### Performance Impact

The system is designed to be lightweight with mobile optimizations:

- **Network Requests**: 20s mobile / 30s desktop intervals
- **Efficient Caching**: Mobile-specific cache strategies
- **Battery Optimization**: Event-driven checks reduce polling
- **Data Usage**: Minimal impact on mobile data plans
- **No Impact**: When updates aren't available
- **Graceful Degradation**: If version.json unavailable

## Browser Compatibility

### Desktop
- **Modern Browsers**: Full support (Chrome 60+, Firefox 55+, Safari 11+)
- **Service Workers**: Required for PWA updates
- **Fetch API**: Required for version checking
- **LocalStorage**: Required for version tracking

### Mobile
- **iOS Safari 11+**: Full support including PWA features
- **Chrome Mobile 60+**: Complete functionality
- **Samsung Internet**: Supported with enhanced mobile features
- **Firefox Mobile**: Basic support (limited PWA features)
- **PWA Installation**: iOS 11.3+, Android Chrome 70+

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
- **Update Analytics**: Track update adoption rates by device type
- **Selective Updates**: Only prompt for critical updates
- **Background Updates**: Download updates in background
- **Mobile-Specific**:
  - Battery-aware update scheduling
  - WiFi-only update options
  - Adaptive update frequency based on usage patterns
  - Enhanced offline capability detection