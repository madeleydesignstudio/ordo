import { createClient } from '@supabase/supabase-js'

// Types for environment variables
interface SupabaseConfig {
  url: string
  anonKey: string
}

// Create Supabase client with config
export function createSupabaseClient(config: SupabaseConfig) {
  if (!config.url || !config.anonKey) {
    throw new Error('Missing Supabase environment variables: url and anonKey are required')
  }

  return createClient(config.url, config.anonKey)
}

// Utility function to get config from environment variables
export function getSupabaseConfigFromEnv(): SupabaseConfig {
  // Try different environment variable patterns
  const url = import.meta.env?.VITE_SUPABASE_URL || process.env?.VITE_SUPABASE_URL || process.env?.SUPABASE_URL
  const anonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY || process.env?.VITE_SUPABASE_ANON_KEY || process.env?.SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    throw new Error('Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY')
  }

  return { url, anonKey }
} 