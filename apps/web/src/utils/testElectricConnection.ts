// ElectricSQL Connection Test Utility
// This utility helps test and debug ElectricSQL Cloud connections

export interface ElectricTestConfig {
  electricUrl: string;
  sourceId: string;
  secret: string;
  table?: string;
}

export interface ElectricTestResult {
  success: boolean;
  status: number;
  data?: any;
  error?: string;
  responseHeaders?: Record<string, string>;
  timing?: {
    start: number;
    end: number;
    duration: number;
  };
}

/**
 * Test basic connectivity to ElectricSQL Cloud
 */
export async function testElectricConnection(config: ElectricTestConfig): Promise<ElectricTestResult> {
  const start = Date.now();

  try {
    const testUrl = new URL(`${config.electricUrl}/v1/shape`);
    testUrl.searchParams.set('table', config.table || 'tasks');
    testUrl.searchParams.set('source_id', config.sourceId);
    testUrl.searchParams.set('secret', config.secret);
    testUrl.searchParams.set('offset', '0');
    testUrl.searchParams.set('limit', '100'); // Get more records for testing

    console.log('[ElectricTest] Testing connection to:', testUrl.toString().replace(config.secret, '***SECRET***'));

    const response = await fetch(testUrl.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(15000), // 15 second timeout
    });

    const end = Date.now();
    const duration = end - start;

    // Collect response headers
    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    const result: ElectricTestResult = {
      success: response.ok,
      status: response.status,
      responseHeaders,
      timing: { start, end, duration }
    };

    if (response.ok) {
      try {
        const data = await response.json();
        result.data = data;

        console.log('[ElectricTest] ✅ Success! Response:', {
          status: response.status,
          recordCount: Array.isArray(data) ? data.length : 'not array',
          duration: `${duration}ms`,
          headers: responseHeaders
        });

        if (Array.isArray(data)) {
          console.log('[ElectricTest] Records received:', data);
        }

      } catch (parseError) {
        result.error = `Failed to parse JSON response: ${parseError}`;
        result.success = false;
        console.error('[ElectricTest] ❌ JSON parse error:', parseError);
      }
    } else {
      try {
        const errorText = await response.text();
        result.error = `HTTP ${response.status}: ${errorText}`;
        console.error('[ElectricTest] ❌ HTTP error:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
          headers: responseHeaders
        });
      } catch {
        result.error = `HTTP ${response.status}: ${response.statusText}`;
        console.error('[ElectricTest] ❌ HTTP error (no body):', response.status, response.statusText);
      }
    }

    return result;

  } catch (error) {
    const end = Date.now();
    const duration = end - start;

    console.error('[ElectricTest] ❌ Connection error:', error);

    return {
      success: false,
      status: 0,
      error: error instanceof Error ? error.message : String(error),
      timing: { start, end, duration }
    };
  }
}

/**
 * Test ElectricSQL connection and validate data structure
 */
export async function testElectricSyncData(config: ElectricTestConfig): Promise<{
  connectionTest: ElectricTestResult;
  dataValidation: {
    isValid: boolean;
    recordCount: number;
    sampleRecord?: any;
    issues: string[];
  };
}> {
  const connectionTest = await testElectricConnection(config);

  const dataValidation = {
    isValid: true,
    recordCount: 0,
    sampleRecord: undefined as any,
    issues: [] as string[]
  };

  if (connectionTest.success && connectionTest.data) {
    if (!Array.isArray(connectionTest.data)) {
      dataValidation.isValid = false;
      dataValidation.issues.push('Response is not an array');
    } else {
      dataValidation.recordCount = connectionTest.data.length;

      if (connectionTest.data.length > 0) {
        const sampleRecord = connectionTest.data[0];
        dataValidation.sampleRecord = sampleRecord;

        // Validate expected task fields
        const expectedFields = ['id', 'title', 'completed'];
        const missingFields = expectedFields.filter(field => !(field in sampleRecord));

        if (missingFields.length > 0) {
          dataValidation.issues.push(`Missing expected fields: ${missingFields.join(', ')}`);
          dataValidation.isValid = false;
        }

        // Check for common field types
        if (sampleRecord.id && typeof sampleRecord.id !== 'string') {
          dataValidation.issues.push('ID field should be a string');
        }

        if (sampleRecord.title && typeof sampleRecord.title !== 'string') {
          dataValidation.issues.push('Title field should be a string');
        }

        if (sampleRecord.completed && typeof sampleRecord.completed !== 'boolean') {
          dataValidation.issues.push('Completed field should be a boolean');
        }
      }
    }
  } else {
    dataValidation.isValid = false;
    dataValidation.issues.push('Connection test failed');
  }

  return { connectionTest, dataValidation };
}

/**
 * Comprehensive ElectricSQL diagnostic test
 */
export async function runElectricDiagnostics(config: ElectricTestConfig): Promise<void> {
  console.log('🔍 [ElectricDiagnostics] Starting comprehensive ElectricSQL diagnostics...');
  console.log('🔗 [ElectricDiagnostics] Configuration:', {
    url: config.electricUrl,
    sourceId: config.sourceId.substring(0, 8) + '...',
    secretLength: config.secret.length,
    table: config.table || 'tasks'
  });

  // Test 1: Basic connectivity
  console.log('\n📡 [ElectricDiagnostics] Test 1: Basic connectivity');
  const { connectionTest, dataValidation } = await testElectricSyncData(config);

  if (connectionTest.success) {
    console.log('✅ [ElectricDiagnostics] Connection successful');
    console.log(`⏱️  [ElectricDiagnostics] Response time: ${connectionTest.timing?.duration}ms`);
  } else {
    console.log('❌ [ElectricDiagnostics] Connection failed:', connectionTest.error);
    return; // Exit early if basic connection fails
  }

  // Test 2: Data validation
  console.log('\n📊 [ElectricDiagnostics] Test 2: Data validation');
  console.log(`📈 [ElectricDiagnostics] Records found: ${dataValidation.recordCount}`);

  if (dataValidation.isValid) {
    console.log('✅ [ElectricDiagnostics] Data structure is valid');
    if (dataValidation.sampleRecord) {
      console.log('📝 [ElectricDiagnostics] Sample record:', dataValidation.sampleRecord);
    }
  } else {
    console.log('❌ [ElectricDiagnostics] Data validation issues:', dataValidation.issues);
  }

  // Test 3: Response headers analysis
  console.log('\n📋 [ElectricDiagnostics] Test 3: Response headers analysis');
  if (connectionTest.responseHeaders) {
    const importantHeaders = [
      'content-type',
      'cache-control',
      'x-electric-shape-id',
      'x-electric-chunk-last-offset',
      'x-electric-schema'
    ];

    importantHeaders.forEach(header => {
      const value = connectionTest.responseHeaders![header];
      if (value) {
        console.log(`🏷️  [ElectricDiagnostics] ${header}: ${value}`);
      }
    });
  }

  // Test 4: Network timing analysis
  console.log('\n⏰ [ElectricDiagnostics] Test 4: Network timing analysis');
  if (connectionTest.timing) {
    const { duration } = connectionTest.timing;

    if (duration < 1000) {
      console.log(`🚀 [ElectricDiagnostics] Excellent response time: ${duration}ms`);
    } else if (duration < 3000) {
      console.log(`⚡ [ElectricDiagnostics] Good response time: ${duration}ms`);
    } else {
      console.log(`🐌 [ElectricDiagnostics] Slow response time: ${duration}ms - check network`);
    }
  }

  console.log('\n🎯 [ElectricDiagnostics] Diagnostics complete!');

  // Summary
  if (connectionTest.success && dataValidation.isValid) {
    console.log('🎉 [ElectricDiagnostics] All tests passed! ElectricSQL sync should work correctly.');
  } else {
    console.log('⚠️  [ElectricDiagnostics] Some issues found. Check the logs above for details.');
  }
}

/**
 * Get environment-based ElectricSQL configuration
 */
export function getElectricConfigFromEnv(): ElectricTestConfig | null {
  const electricUrl = import.meta.env.VITE_ELECTRIC_URL;
  const sourceId = import.meta.env.VITE_ELECTRIC_SOURCE_ID;
  const secret = import.meta.env.VITE_ELECTRIC_SECRET;

  if (!electricUrl || !sourceId || !secret) {
    console.warn('[ElectricTest] Missing required environment variables');
    return null;
  }

  return {
    electricUrl,
    sourceId,
    secret,
    table: 'tasks'
  };
}

/**
 * Quick test function for use in browser console or components
 */
export async function quickElectricTest(): Promise<void> {
  const config = getElectricConfigFromEnv();

  if (!config) {
    console.error('❌ [QuickTest] ElectricSQL not configured. Set environment variables.');
    return;
  }

  console.log('🧪 [QuickTest] Running quick ElectricSQL test...');
  await runElectricDiagnostics(config);
}

// Make functions available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).testElectric = quickElectricTest;
  (window as any).runElectricDiagnostics = runElectricDiagnostics;
  (window as any).testElectricConnection = testElectricConnection;
}
