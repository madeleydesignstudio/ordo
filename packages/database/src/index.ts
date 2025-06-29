// Export database connection and factory
export { db, createDatabase } from './connection';

// Export schema
export * from './schema';

// Export types
export * from './types';

// Re-export common drizzle-orm functions
export { eq, and, or, not, isNull, isNotNull, desc, asc } from 'drizzle-orm'; 