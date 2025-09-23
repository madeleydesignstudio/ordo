import type { ElectricSyncConfig } from "./sync.js";
import { testSyncConnectivity, createPGliteWithSync, setupTasksSync } from "./sync.js";

export interface ElectricSyncTestResult {
  connected: boolean;
  syncSetup: boolean;
  taskCount: number;
  error?: string;
}

/**
 * Comprehensive test of ElectricSQL sync functionality
 */
export async function testElectricSync(config: ElectricSyncConfig): Promise<ElectricSyncTestResult> {
  console.log("[ElectricSyncTest] Starting comprehensive ElectricSQL sync test...");
  
  try {
    // Step 1: Test connectivity
    console.log("[ElectricSyncTest] Step 1: Testing connectivity...");
    const connected = await testSyncConnectivity(config);
    
    if (!connected) {
      return {
        connected: false,
        syncSetup: false,
        taskCount: 0,
        error: "Failed to connect to ElectricSQL API"
      };
    }
    
    // Step 2: Create a test PGlite instance and test sync setup
    console.log("[ElectricSyncTest] Step 2: Testing sync setup...");
    const testPglite = await createPGliteWithSync("memory://test-sync");
    
    // Create the tasks table for testing
    await testPglite.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
        title text NOT NULL,
        description text,
        completed boolean DEFAULT false,
        created_at timestamp DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamp DEFAULT CURRENT_TIMESTAMP,
        due_date timestamp
      );
    `);
    
    let syncSetup = false;
    let taskCount = 0;
    
    try {
      // Attempt to set up sync
      const subscription = await setupTasksSync(testPglite, config);
      syncSetup = true;
      
      console.log("[ElectricSyncTest] Sync setup successful, waiting for initial data...");
      
      // Wait a moment for initial sync
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Count tasks in local database
      const result = await testPglite.query("SELECT COUNT(*) as count FROM tasks");
      taskCount = (result.rows[0] as any)?.count || 0;
      
      console.log(`[ElectricSyncTest] Found ${taskCount} tasks after sync`);
      
      // Cleanup
      subscription.unsubscribe();
      
    } catch (syncError) {
      console.error("[ElectricSyncTest] Sync setup failed:", syncError);
      syncSetup = false;
    }
    
    // Cleanup test database
    await testPglite.close();
    
    return {
      connected,
      syncSetup,
      taskCount,
    };
    
  } catch (error) {
    console.error("[ElectricSyncTest] Test failed:", error);
    return {
      connected: false,
      syncSetup: false,
      taskCount: 0,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}