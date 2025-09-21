# Database Package Comparison: Local vs Cloud

This guide compares the `@ordo/local-db` and `@ordo/cloud-db` packages, helping you choose the right database solution for your needs.

## Overview

| Package | Technology | Use Case | Storage | Scalability |
|---------|------------|----------|---------|-------------|
| `@ordo/local-db` | PGlite + IndexedDB | Offline-first, PWA | Browser IndexedDB | Single user |
| `@ordo/cloud-db` | Supabase + PostgreSQL | Cloud-first, multi-user | Remote PostgreSQL | Multi-user, scalable |

## Schema Compatibility

Both packages maintain **identical schemas** for seamless data synchronization:

```typescript
// Same schema in both packages
export const tasks = pgTable("tasks", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  completed: boolean("completed").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  dueDate: timestamp("due_date"),
});
```

## Feature Comparison

### @ordo/local-db (PGlite)

#### ✅ Advantages
- **Offline-first**: Works without internet connection
- **No backend required**: Runs entirely in browser
- **Fast performance**: No network latency
- **Privacy**: Data stays on device
- **No costs**: No server or database hosting fees
- **PWA ready**: Perfect for Progressive Web Apps

#### ❌ Limitations
- **Single user**: No collaboration features
- **Device-bound**: Data tied to specific browser/device
- **Storage limits**: Browser storage quotas (~10GB)
- **No real-time sync**: Between different devices
- **Backup complexity**: Requires manual export/import

#### 🎯 Best For
- Personal task managers
- Offline-first applications
- Single-user productivity tools
- Mobile apps with intermittent connectivity
- Privacy-focused applications

### @ordo/cloud-db (Supabase)

#### ✅ Advantages
- **Multi-user**: Collaboration and sharing
- **Real-time sync**: Live updates across devices
- **Scalable**: Handles thousands of users
- **Backup included**: Automatic backups
- **Cross-device**: Access from anywhere
- **Rich ecosystem**: Auth, storage, edge functions

#### ❌ Limitations
- **Requires internet**: No offline capability
- **Monthly costs**: Database hosting fees
- **Latency**: Network requests add delay
- **Complexity**: More setup and configuration
- **Privacy**: Data stored on third-party servers

#### 🎯 Best For
- Team collaboration tools
- Multi-device applications
- Real-time applications
- SaaS products
- Applications requiring user authentication

## Technical Implementation

### Local Database Setup

```typescript
import { 
  createDatabaseWithClient, 
  initializeClient, 
  runMigrations 
} from "@ordo/local-db";
import { PGlite } from "@electric-sql/pglite";
import { live } from "@electric-sql/pglite/live";

// For React apps with live queries
const client = await PGlite.create("idb://ordo-db", {
  extensions: { live },
});
const db = createDatabaseWithClient(client);
await runMigrations(client);
```

### Cloud Database Setup

```typescript
import { 
  initializeCloudDatabase, 
  initializeSupabaseClient 
} from "@ordo/cloud-db";

// Initialize with Supabase
const db = initializeCloudDatabase({
  supabase: {
    url: process.env.SUPABASE_URL!,
    anonKey: process.env.SUPABASE_ANON_KEY!,
  }
});

// Or with direct PostgreSQL connection
const db = initializeCloudDatabase({
  connectionString: process.env.DATABASE_URL!
});
```

## API Compatibility

Both packages provide **identical APIs** for basic operations:

```typescript
// Same code works with both packages
import { tasks, eq } from "@ordo/local-db";  // or "@ordo/cloud-db"

// Create
const newTask = await db.insert(tasks).values({
  title: "Example task",
  description: "This works with both packages"
}).returning();

// Read
const allTasks = await db.select().from(tasks);
const completedTasks = await db
  .select()
  .from(tasks)
  .where(eq(tasks.completed, true));

// Update
await db
  .update(tasks)
  .set({ completed: true })
  .where(eq(tasks.id, taskId));

// Delete
await db.delete(tasks).where(eq(tasks.id, taskId));
```

## Hybrid Approach (Best of Both)

For maximum flexibility, use both packages together:

### Architecture

```
┌─────────────────┐    Sync    ┌─────────────────┐
│   Local DB      │ ←--------→ │   Cloud DB      │
│   (PGlite)      │            │   (Supabase)    │
│                 │            │                 │
│ • Offline ops   │            │ • Multi-user    │
│ • Fast reads    │            │ • Backup        │
│ • Privacy       │            │ • Collaboration │
└─────────────────┘            └─────────────────┘
```

### Implementation Strategy

1. **Local-first**: All operations go to local database first
2. **Background sync**: Sync with cloud when online
3. **Conflict resolution**: Handle merge conflicts intelligently
4. **Fallback**: Cloud-only when local storage unavailable

### Sync Implementation

```typescript
import { tasks as localTasks, eq } from "@ordo/local-db";
import { tasks as cloudTasks, eq as cloudEq } from "@ordo/cloud-db";

async function syncLocalToCloud(localDb: any, cloudDb: any) {
  const localTasksList = await localDb.select().from(localTasks);
  
  for (const task of localTasksList) {
    const existing = await cloudDb
      .select()
      .from(cloudTasks)
      .where(cloudEq(cloudTasks.id, task.id))
      .limit(1);
    
    if (existing.length === 0) {
      await cloudDb.insert(cloudTasks).values(task);
    } else if (task.updatedAt > existing[0].updatedAt) {
      await cloudDb
        .update(cloudTasks)
        .set(task)
        .where(cloudEq(cloudTasks.id, task.id));
    }
  }
}
```

## Performance Comparison

| Metric | Local DB | Cloud DB | Notes |
|--------|----------|----------|-------|
| Initial load | ~100ms | ~300-1000ms | Network latency |
| CRUD operations | ~1-5ms | ~100-500ms | Network roundtrip |
| Offline capability | ✅ Full | ❌ None | Local wins |
| Concurrent users | 1 | Unlimited | Cloud wins |
| Storage capacity | ~10GB | Unlimited | Cloud wins |
| Backup/restore | Manual | Automatic | Cloud wins |

## Cost Analysis

### Local Database (@ordo/local-db)
- **Development**: $0
- **Hosting**: $0 (runs in browser)
- **Storage**: $0 (uses device storage)
- **Bandwidth**: $0 (no server requests)
- **Total**: **$0/month**

### Cloud Database (@ordo/cloud-db)
- **Supabase Free Tier**: $0/month (up to 500MB, 2 projects)
- **Supabase Pro**: $25/month (8GB, unlimited projects)
- **Custom hosting**: $10-100+/month (depending on usage)
- **Bandwidth**: Variable (depends on usage)

## Decision Matrix

Choose **@ordo/local-db** if:
- ✅ Single user application
- ✅ Offline functionality required
- ✅ Privacy is paramount
- ✅ Zero hosting costs needed
- ✅ Simple deployment
- ✅ Fast, responsive UI

Choose **@ordo/cloud-db** if:
- ✅ Multi-user collaboration
- ✅ Real-time synchronization
- ✅ Cross-device access
- ✅ Automatic backups
- ✅ Scalability requirements
- ✅ Team features needed

Choose **Both** (Hybrid) if:
- ✅ Want offline + online capabilities
- ✅ Need maximum reliability
- ✅ Building a premium product
- ✅ Can handle sync complexity
- ✅ Want best user experience

## Migration Path

### From Local to Cloud

1. Set up Supabase project
2. Install `@ordo/cloud-db`
3. Export data from local database
4. Import data to cloud database
5. Update application code
6. Deploy with cloud database

### From Cloud to Local

1. Install `@ordo/local-db`
2. Export data from cloud database
3. Import data to local database
4. Update application code
5. Remove cloud dependencies

### To Hybrid Approach

1. Keep existing implementation
2. Add second database package
3. Implement sync logic
4. Add online/offline detection
5. Test conflict resolution
6. Deploy incrementally

## Best Practices

### For Local Database
```typescript
// Request persistent storage
if ("storage" in navigator && "persist" in navigator.storage) {
  await navigator.storage.persist();
}

// Handle storage quota
const estimate = await navigator.storage.estimate();
if (estimate.usage! > estimate.quota! * 0.8) {
  // Warn user about storage limits
}
```

### For Cloud Database
```typescript
// Use connection pooling
const db = initializeCloudDatabase({
  connectionString: process.env.DATABASE_URL,
  poolSize: 20,
  timeout: 30000,
});

// Enable Row Level Security
await sql`ALTER TABLE tasks ENABLE ROW LEVEL SECURITY`;
```

### For Hybrid Systems
```typescript
// Always write to local first
async function createTask(taskData: NewTask) {
  // 1. Insert into local database
  const localTask = await localDb.insert(localTasks).values(taskData).returning();
  
  // 2. Queue for cloud sync
  await queueForSync(localTask[0]);
  
  // 3. Try immediate sync if online
  if (navigator.onLine) {
    try {
      await syncToCloud(localTask[0]);
    } catch (error) {
      // Sync will retry later
    }
  }
  
  return localTask[0];
}
```

## Conclusion

Both packages serve different needs but maintain schema compatibility for easy migration. Choose based on your requirements:

- **Solo developers & offline apps** → `@ordo/local-db`
- **Teams & cloud-first apps** → `@ordo/cloud-db`  
- **Premium products** → **Both** for maximum flexibility

The identical schemas and APIs make it easy to switch or combine approaches as your needs evolve.