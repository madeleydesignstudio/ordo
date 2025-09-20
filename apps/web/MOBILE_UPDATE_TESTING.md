# Mobile Update Testing Guide

This guide helps you test the mobile-optimized update notification system on various devices and browsers.

## 🧪 Testing Overview

The mobile update system includes enhanced caching strategies, device-specific optimizations, and PWA-aware update handling. This guide covers testing on real devices and emulated environments.

## 📱 Device Testing Matrix

### iOS Devices
- **Safari Mobile**: Native iOS browser
- **PWA (Home Screen)**: App installed via "Add to Home Screen"
- **Chrome iOS**: Chrome browser on iOS
- **Edge iOS**: Edge browser on iOS

### Android Devices
- **Chrome Mobile**: Default Android browser
- **PWA (Home Screen)**: App installed via Chrome's install prompt
- **Samsung Internet**: Samsung's default browser
- **Firefox Mobile**: Firefox browser on Android

## 🔧 Testing Setup

### 1. Development Environment

```bash
# Start the development server
bun dev

# In another terminal, build for testing
bun run build

# Serve the built version locally
bun run preview
```

### 2. Mobile Device Access

#### Option A: Local Network Testing
1. Find your computer's IP address: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
2. Access via mobile browser: `http://YOUR_IP:3001`
3. Ensure both devices are on the same network

#### Option B: ngrok Tunnel
```bash
# Install ngrok (if not already installed)
npm install -g ngrok

# Tunnel your local server
ngrok http 3001

# Use the provided HTTPS URL on mobile devices
```

## 🧪 Test Scenarios

### Scenario 1: Fresh Installation Detection

**Desktop Steps:**
1. Build the app: `bun run build`
2. Note the version in `public/version.json`
3. Access app on mobile device
4. Verify initial version is stored

**Mobile Expected Behavior:**
- No update notification on first visit
- Version stored in localStorage
- Status indicator may briefly show "checking..."

### Scenario 2: Deployment Update Detection

**Desktop Steps:**
1. Access app on mobile, wait for it to fully load
2. Run update simulation: `node test-update.js`
3. On mobile device, either:
   - Switch to another app and back (triggers visibility check)
   - Wait 20 seconds (mobile check interval)
   - Refresh the page once to trigger focus check

**Mobile Expected Behavior:**
- Update notification popup appears within 20-30 seconds
- Mobile-specific messaging is displayed
- "Tap to Refresh" button (instead of "Refresh Now")
- Enhanced footer text for mobile context

### Scenario 3: PWA Installation Testing

**Mobile Steps:**
1. Open app in Chrome/Safari
2. Install as PWA:
   - **Chrome**: Tap menu → "Add to Home Screen" → "Install"
   - **Safari**: Tap share → "Add to Home Screen"
3. Open installed PWA from home screen
4. Trigger update (run `test-update.js`)

**PWA Expected Behavior:**
- PWA-specific messaging: "App Update Available!"
- Different icon: 📱 instead of 🚀
- Footer mentions "PWA restart"
- More aggressive cache clearing

### Scenario 4: Network Interruption Testing

**Mobile Steps:**
1. Open app with good connection
2. Turn off mobile data/WiFi
3. Turn connection back on
4. Trigger update (run `test-update.js`)

**Expected Behavior:**
- App should detect online status change
- Automatic update check when reconnected
- Graceful handling of network timeouts (15s on mobile vs 10s desktop)

## 🔍 Debugging Mobile Issues

### Common Issues and Solutions

#### Issue: Updates not detected on mobile
**Possible Causes:**
- Aggressive browser caching
- Service worker interference
- Network cache policies

**Debug Steps:**
1. Open browser dev tools on mobile (if available)
2. Check Network tab for `/version.json` requests
3. Verify cache-busting parameters are present
4. Look for console errors

**Solutions:**
- Clear browser cache manually
- Disable data saver modes
- Try in incognito/private browsing mode

#### Issue: PWA not updating properly
**Possible Causes:**
- Service worker not unregistering
- IndexedDB cache conflicts
- App shell caching

**Debug Steps:**
1. Check Application tab in dev tools
2. Verify service workers are being unregistered
3. Check cache storage entries

**Solutions:**
- Force close and reopen PWA
- Clear all app data in browser settings
- Uninstall and reinstall PWA

### Mobile Developer Tools

#### Chrome DevTools on Android
1. Enable Developer Options on Android
2. Enable USB Debugging
3. Connect to computer via USB
4. Open `chrome://inspect` in desktop Chrome
5. Select your mobile browser for remote debugging

#### Safari Web Inspector on iOS
1. Enable Web Inspector on iOS: Settings → Safari → Advanced → Web Inspector
2. On Mac: Safari → Develop → [Your iPhone] → Select tab
3. Full debugging capabilities available

### Testing Commands

```bash
# Check current version
curl http://localhost:3001/version.json

# Create new update
node test-update.js

# Check updated version
curl http://localhost:3001/version.json?t=$(date +%s)

# Force rebuild with new timestamp
bun run build
```

## 📊 Mobile Testing Checklist

### Before Testing
- [ ] App builds successfully
- [ ] version.json is generated correctly
- [ ] Mobile device has network access to development server
- [ ] Browser dev tools accessible (if needed)

### Basic Functionality
- [ ] App loads correctly on mobile browser
- [ ] No console errors during initial load
- [ ] Update check interval respects mobile timing (20s vs 30s desktop)
- [ ] Status indicator shows during checks

### Update Detection
- [ ] First visit stores version correctly
- [ ] Update simulation triggers notification
- [ ] Notification appears within expected timeframe
- [ ] Mobile-specific messaging is displayed
- [ ] Touch/tap interactions work properly

### Cache Clearing
- [ ] "Tap to Refresh" clears all caches
- [ ] IndexedDB is properly cleared (except preserved data)
- [ ] Service workers are unregistered
- [ ] Hard refresh loads latest version

### PWA Specific
- [ ] PWA installation works correctly
- [ ] PWA-specific update messaging appears
- [ ] PWA restart works after update
- [ ] App icon updates if changed

### Network Conditions
- [ ] Works on WiFi and mobile data
- [ ] Handles poor network conditions gracefully
- [ ] Timeouts work correctly (15s mobile timeout)
- [ ] Reconnection triggers update check

## 🚨 Troubleshooting

### Issue: Stuck on old version after update
**Solution:**
```javascript
// Run in mobile browser console
localStorage.clear();
sessionStorage.clear();
if ('caches' in window) {
  caches.keys().then(names => names.forEach(name => caches.delete(name)));
}
location.reload(true);
```

### Issue: Update notification not appearing
**Check:**
1. Browser cache settings (disable if aggressive)
2. Data saver mode (can block update checks)
3. Background app refresh settings
4. Power saving modes

### Issue: Service worker conflicts
**Solution:**
```javascript
// Run in browser console
navigator.serviceWorker.getRegistrations()
  .then(registrations => registrations.forEach(reg => reg.unregister()));
```

## 📈 Performance Monitoring

### Metrics to Watch
- Time from trigger to notification appearance
- Cache clearing duration
- Refresh/reload time
- Network request count during update

### Expected Performance
- **Update Detection**: < 30 seconds
- **Cache Clearing**: < 5 seconds
- **Page Reload**: < 10 seconds (depending on network)
- **PWA Restart**: < 3 seconds

## 🔄 Continuous Testing

### Automated Testing Setup
```bash
# Create a test script for regular deployment testing
#!/bin/bash
echo "Building app..."
bun run build

echo "Triggering update..."
node test-update.js

echo "Waiting for update check interval..."
sleep 25

echo "Test complete - check mobile devices"
```

### Regular Testing Schedule
- Test on major mobile browser updates
- Test with new iOS/Android releases  
- Test during each deployment cycle
- Test PWA functionality quarterly

## 📚 Additional Resources

- [MDN: Web App Install Banners](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Add_to_home_screen)
- [Chrome DevTools Mobile Testing](https://developer.chrome.com/docs/devtools/device-mode/)
- [Safari Web Inspector Guide](https://webkit.org/web-inspector/)
- [PWA Best Practices](https://web.dev/pwa-checklist/)