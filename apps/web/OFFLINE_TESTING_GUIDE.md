# Complete Offline Testing Guide for Ordo Todo App

This guide will help you test the true offline-first capabilities of the Ordo Todo App. The app should work completely without any internet connection from the moment you turn on your computer.

## What "True Offline-First" Means

This app is designed to work in scenarios where you have **zero internet connectivity**:
- ✅ Airplane mode
- ✅ Remote locations without internet  
- ✅ Internet outages
- ✅ Fresh computer startup with no network
- ✅ Disconnected ethernet/WiFi

The app should:
1. **Start completely offline** - No network required to launch
2. **Function fully offline** - Create, edit, delete todos
3. **Persist data locally** - All data saved to PGLite (local PostgreSQL)
4. **Auto-sync when online** - Background sync when internet returns

## Testing Scenarios

### Scenario 1: Complete Network Disconnection

**Setup:**
1. Disconnect from all networks (WiFi + Ethernet)
2. Turn off mobile hotspot/tethering
3. Verify you're completely offline: `ping google.com` should fail

**Test Steps:**
```bash
# 1. Build and serve the app
cd ordo/apps/web
bun run build
bun run serve

# 2. Open browser to localhost (this still works offline)
# Navigate to: http://localhost:3000
```

**Expected Results:**
- ✅ App loads without errors
- ✅ UI renders completely
- ✅ Can create new todos
- ✅ Todos persist after page refresh
- ✅ All CRUD operations work
- ✅ Console shows: "🚫 OFFLINE-FIRST LAUNCH: App starting without internet connection"
- ✅ Banner shows: "🎉 OFFLINE-FIRST SUCCESS! App launched without internet & works perfectly!"

### Scenario 2: PWA Installation & Offline Use

**Setup:**
1. With internet connected, visit the app
2. Install as PWA (look for install button in browser)
3. Close browser completely
4. Disconnect from internet
5. Launch the PWA from desktop/app drawer

**Test Steps:**
```bash
# 1. Install PWA when online
# 2. Go completely offline
# 3. Launch PWA from desktop shortcut
```

**Expected Results:**
- ✅ PWA launches without network
- ✅ All functionality works offline
- ✅ Data persists between sessions
- ✅ Service Worker caches everything needed

### Scenario 3: Browser Developer Tools Testing

**Setup:**
```bash
cd ordo/apps/web
bun run serve
```

**Test Steps:**
1. Open browser to `http://localhost:3000`
2. Open DevTools (F12)
3. Go to **Network** tab
4. Check "Offline" checkbox
5. Refresh the page (Ctrl+R)

**Expected Results:**
- ✅ App loads from service worker cache
- ✅ All functionality works
- ✅ Network tab shows resources served from ServiceWorker
- ✅ No failed network requests

### Scenario 4: Fresh System Boot (Ultimate Test)

**Setup:**
1. Install app as PWA when online
2. Completely shut down computer
3. Disconnect all network cables/disable WiFi
4. Boot computer with no network access

**Test Steps:**
1. Boot computer offline
2. Launch PWA from desktop
3. Use app normally

**Expected Results:**
- ✅ App launches without any network dependency
- ✅ Previous todos are still there
- ✅ Can create new todos
- ✅ Everything persists locally

## Service Worker Verification

Open DevTools → Application → Service Workers:

**Check:**
- ✅ Service Worker is registered and active
- ✅ Scope covers your domain
- ✅ Status shows "Running" or "Activated"

**Cache Storage Check:**
Open DevTools → Application → Cache Storage:

**Expected Caches:**
- `workbox-precache-v2-[hash]` - App shell and static assets
- `pglite-assets` - Database WebAssembly files  
- `app-shell` - HTML pages
- `static-resources` - CSS, JS, images
- `version-cache` - Version information

## Network Simulation Tests

### Test 1: Slow/Unreliable Connection
```bash
# In DevTools → Network → Throttling
# Select "Slow 3G" or "Fast 3G"
```
**Expected:** App still works, sync may be slower but doesn't block UI

### Test 2: Intermittent Connection
```bash
# Repeatedly toggle "Offline" checkbox while using app
```
**Expected:** App continues working, sync happens when online

### Test 3: Connection Recovery
```bash
# Start offline, create todos, then go online
```
**Expected:** 
- Todos created offline remain
- Sync button becomes available
- Can manually sync to cloud

## Data Persistence Tests

### Test Local Storage
```javascript
// In browser console, check what's stored:
console.log('PGLite data:', localStorage.getItem('pglite-data'));
console.log('App version:', localStorage.getItem('app_version'));

// Check IndexedDB
indexedDB.databases().then(console.log);
```

### Test Data Survival
1. Create todos offline
2. Close browser completely
3. Reopen app (still offline)
4. **Expected:** All todos still there

## Sync Testing

### Manual Sync Test
1. Create todos while offline
2. Connect to internet
3. Click "☁️ Sync" button
4. **Expected:** Success message, todos uploaded to Supabase

### Auto-Sync Test
1. Create todos offline  
2. Connect to internet
3. App should detect connection
4. **Expected:** Sync becomes available automatically

## Troubleshooting Failed Tests

### App Won't Load Offline
**Check:**
- Service Worker registered? (DevTools → Application → Service Workers)
- Resources cached? (DevTools → Application → Cache Storage)
- Any console errors?

**Fix:**
```bash
# Clear all data and reinstall PWA
# In DevTools → Application → Storage → Clear storage
```

### Database Errors
**Check Console for:**
- PGLite initialization errors
- IndexedDB access issues
- WASM loading problems

**Fix:**
```bash
# Clear IndexedDB data
# DevTools → Application → IndexedDB → Delete all
```

### Sync Issues
**Check:**
- SUPABASE environment variables set?
- Network actually working?
- Console shows cloud service errors?

## Performance Expectations

**Initial Load (Offline):**
- First visit: ~2-3 seconds (needs to cache resources)
- Subsequent visits: <500ms (served from cache)

**Database Operations:**
- Create todo: <100ms
- Load todos: <50ms  
- Delete todo: <50ms

**Sync Operations:**
- Upload todos: Depends on network, should not block UI

## Success Criteria

You've achieved true offline-first if:

✅ **Zero Network Dependency:** App works without any internet connection
✅ **Instant Startup:** App loads quickly from cache when offline  
✅ **Full Functionality:** All CRUD operations work offline
✅ **Data Persistence:** Data survives browser restarts, system reboots
✅ **Seamless Sync:** When online, data syncs to cloud seamlessly
✅ **No Blocking:** Network operations never block the UI
✅ **Progressive Enhancement:** App works offline, better when online

## Real-World Scenarios

**✈️ Airplane Mode:**
- Board plane, enable airplane mode
- Launch app, create todos for trip planning
- Data saved locally, syncs when you land

**🏔️ Remote Location:**
- Camping with no cell service
- Use app to track hiking todos, notes
- Sync when you return to civilization

**🏠 Internet Outage:**
- ISP down, no internet at home
- App continues working normally
- Productivity not interrupted

**🚀 Development/Demo:**
- Demo app without needing internet
- Works in air-gapped environments
- Perfect for offline presentations

This is what true offline-first architecture looks like!