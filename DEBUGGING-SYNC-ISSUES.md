# Debugging ElectricSQL Sync Issues

This guide helps you diagnose and fix sync issues between your local PGlite database and Supabase PostgreSQL via ElectricSQL Cloud.

## Quick Diagnosis Checklist

### 1. Check Environment Configuration
```bash
# Run the configuration checker
cd apps/web
bun run check-electric
```

**Expected output**: All green checkmarks for required variables.

**Common issues**:
- ❌ Missing `VITE_ELECTRIC_SOURCE_ID` or `VITE_ELECTRIC_SECRET`
- ❌ `VITE_ELECTRIC_SYNC_ENABLED=false`
- ❌ Invalid Electric URL

### 2. Check ElectricSQL Cloud Status
1. Visit [Electric Cloud Console](https://console.electric-sql.com)
2. Verify your source status is **"active"**
3. Check connection to your Supabase database

### 3. Visual Sync Status Check
Look at the **ElectricSQL Sync Status** component in your web app:
- 🟢 Green dot = Working correctly
- 🟡 Yellow dot = Configuration issue
- 🔴 Red dot = Connection error
- ⚪ Gray dot = Disabled

### 4. Browser Console Debugging
Open browser DevTools (F12) and check the Console tab for:
- `[ElectricSync]` messages
- `[useElectricSync]` messages
- Network errors
- JavaScript errors

## Detailed Debugging Steps

### Step 1: Test ElectricSQL Connection

**In the web app**:
1. Click the 🧪 test button in the ElectricSync status section
2. Check browser console for detailed test results

**Expected console output**:
```
🧪 [QuickTest] Running quick ElectricSQL test...
📡 [ElectricDiagnostics] Test 1: Basic connectivity
✅ [ElectricDiagnostics] Connection successful
📊 [ElectricDiagnostics] Records found: 3
✅ [ElectricDiagnostics] Data structure is valid
🎉 [ElectricDiagnostics] All tests passed!
```

**If connection fails**:
- Verify your Electric credentials in `.env.local`
- Check network connectivity
- Verify Electric Cloud source is active

### Step 2: Check Local Database State

**In the web app**:
1. Click the 🐛 "Debug DB" button
2. Check browser console for local database info

**Expected console output**:
```
[Debug] === Database State Debug ===
[Debug] PGlite has electric extension: true
[Debug] Total tasks in local database: 1
[Debug] Task 1: {id: "...", title: "...", completed: false}
```

**Common issues**:
- PGlite missing electric extension (check main.tsx)
- Local database has fewer records than cloud
- Electric metadata tables missing

### Step 3: Verify Cloud Database Content

**Direct database check**:
1. Go to your Supabase project dashboard
2. Open SQL Editor
3. Run: `SELECT * FROM tasks ORDER BY created_at;`
4. Verify you have the expected 3 records

**Check record structure**:
```sql
-- Verify table schema matches ElectricSQL expectations
\d tasks

-- Check data types and constraints
SELECT 
  column_name, 
  data_type, 
  is_nullable 
FROM information_schema.columns 
WHERE table_name = 'tasks';
```

### Step 4: ElectricSQL Shape Configuration

**Check shape parameters**:
The sync should use these parameters:
- `table=tasks`
- `source_id=<your-source-id>`
- `secret=<your-secret>`

**Test shape API directly**:
```bash
curl "https://api.electric-sql.cloud/v1/shape?table=tasks&source_id=YOUR_SOURCE_ID&secret=YOUR_SECRET" | jq
```

Should return an array with your task records.

## Common Issues & Solutions

### Issue 1: Only 1 of 3 Records Syncing

**Possible causes**:

1. **Database Schema Mismatch**
   ```sql
   -- Check if all records have required fields
   SELECT id, title, completed, created_at, updated_at 
   FROM tasks 
   WHERE id IS NULL OR title IS NULL;
   ```
   
2. **Primary Key Issues**
   - Duplicate IDs in source data
   - ID field type mismatch (string vs UUID)
   - Missing primary key constraints

3. **ElectricSQL Shape Filtering**
   - Check if there are WHERE clauses in your shape configuration
   - Verify all records meet the shape criteria

4. **Sync State Corruption**
   ```javascript
   // In browser console, clear sync state
   localStorage.removeItem('electric-sync-state');
   // Refresh the page
   ```

### Issue 2: "Electric Sync Not Configured"

**Solution**:
```bash
# 1. Copy example environment file
cp apps/web/.env.example apps/web/.env.local

# 2. Edit with your credentials
# VITE_ELECTRIC_SOURCE_ID=your-actual-source-id
# VITE_ELECTRIC_SECRET=your-actual-secret
# VITE_ELECTRIC_SYNC_ENABLED=true

# 3. Restart dev server
bun run dev
```

### Issue 3: "Electric Sync Unavailable"

**Cause**: PGlite instance missing Electric extension

**Solution**: Check `apps/web/src/main.tsx`:
```typescript
const db = await PGlite.create("idb://ordo-db", {
  extensions: {
    live,
    electric: electricSync({          // ← This must be present
      metadataSchema: "electric",
      debug: import.meta.env.DEV || false,
    }),
  },
});
```

### Issue 4: Connection Errors

**Common errors**:
- `404`: Invalid Electric URL or shape endpoint
- `401/403`: Invalid source_id or secret
- `500`: ElectricSQL service issues
- `CORS`: Network/proxy issues

**Debug steps**:
1. Verify credentials in Electric Cloud console
2. Test direct API call with curl
3. Check network tab in DevTools for failed requests

### Issue 5: Records Sync But Don't Appear in UI

**Possible causes**:

1. **React State Not Updating**
   - Check if `useDatabase` hook is re-fetching data
   - Verify task list refresh after sync

2. **Database Query Issues**
   ```javascript
   // In browser console, manually check database
   debugDatabaseState();
   ```

3. **Cached Data**
   - Clear browser cache
   - Refresh the page

## Advanced Debugging

### Network Traffic Analysis

1. Open DevTools → Network tab
2. Filter by "shape" or "electric"
3. Look for:
   - HTTP requests to `api.electric-sql.cloud`
   - Response status codes
   - Response payloads

### ElectricSQL Logs

**Enable debug mode**:
```bash
# In .env.local
VITE_ELECTRIC_DEBUG=true
```

**Check for detailed logs**:
- Shape stream connections
- Message processing
- Sync state changes

### Database Comparison

**Script to compare databases**:
```javascript
// In browser console
async function compareDatabases() {
  // Test Electric API
  const response = await fetch('/api/electric-test');
  const cloudData = await response.json();
  
  // Get local data
  debugDatabaseState();
  
  console.log('Cloud records:', cloudData.length);
  console.log('Local records:', /* check console output */);
}
```

## Manual Sync Reset

If sync is completely broken:

### 1. Clear All Sync State
```javascript
// In browser console
localStorage.clear();
sessionStorage.clear();

// Clear IndexedDB
if ('indexedDB' in window) {
  indexedDB.deleteDatabase('ordo-db');
}

// Refresh page
window.location.reload();
```

### 2. Restart ElectricSQL Connection
```javascript
// In browser console (if available)
if (window.testElectric) {
  await window.testElectric();
}
```

### 3. Force Full Resync
1. Stop the app
2. Clear browser storage (as above)
3. Restart the app
4. ElectricSQL should perform full initial sync

## Prevention Tips

### 1. Consistent Data Types
Ensure your Supabase table and PGlite schema have matching:
- Column names (case-sensitive)
- Data types (string, boolean, timestamp)
- Primary key definitions

### 2. Monitor Sync Health
- Check ElectricSQL Cloud console regularly
- Monitor browser console for errors
- Set up alerts for sync failures (future enhancement)

### 3. Backup Strategies
- Regular database backups
- Export local data before major changes
- Test sync in staging environment

## Getting Help

If you're still having issues:

1. **Gather Information**:
   - Browser console logs
   - Network tab screenshots
   - Electric Cloud console status
   - Database schema details

2. **Check Resources**:
   - [ElectricSQL Documentation](https://electric-sql.com/docs/)
   - [ElectricSQL Discord](https://discord.electric-sql.com)
   - [PGlite Sync Docs](https://pglite.dev/docs/sync)

3. **Create Minimal Reproduction**:
   - Isolate the specific issue
   - Document exact steps to reproduce
   - Test with minimal data set

Remember: ElectricSQL is in alpha, so some issues may be service-related rather than configuration problems.