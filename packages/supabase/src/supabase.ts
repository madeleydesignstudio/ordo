import { createSupabaseClient, getSupabaseConfigFromEnv } from './client.js'
import type { User, SupabaseClient } from '@supabase/supabase-js'

// Initialize Supabase client with environment variables
let supabaseClient: SupabaseClient | null = null

export function getSupabaseClient(): SupabaseClient {
  if (!supabaseClient) {
    const config = getSupabaseConfigFromEnv()
    supabaseClient = createSupabaseClient(config)
  }
  return supabaseClient
}

// Simple auth utilities following Supabase docs
export const auth = {
  // Sign in with Google OAuth - implicit flow (Supabase handles redirects)
  signInWithGoogle: async () => {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    })
    return { data, error }
  },

  // Sign out
  signOut: async () => {
    const supabase = getSupabaseClient()
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  // Get current user
  getCurrentUser: async (): Promise<User | null> => {
    const supabase = getSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    return user
  },

  // Get current session
  getCurrentSession: async () => {
    const supabase = getSupabaseClient()
    const { data: { session }, error } = await supabase.auth.getSession()
    return { session, error }
  },

  // Listen to auth changes
  onAuthStateChange: (callback: (user: User | null) => void) => {
    const supabase = getSupabaseClient()
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(session?.user ?? null)
    })
  },

  // Upsert user profile when they sign in
  upsertUserProfile: async (user: User) => {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from('users')
      .upsert({
        id: user.id,
        email: user.email!,
        name: user.user_metadata?.full_name || user.user_metadata?.name,
        avatar_url: user.user_metadata?.avatar_url,
      })
      .select()
      .single()
    return { data, error }
  },
}

// Database utilities for client-side operations
export const db = {
  // Users
  users: {
    create: async (userData: { email: string; name?: string }) => {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('users')
        .insert(userData)
        .select()
        .single()
      return { data, error }
    },

    getById: async (id: string) => {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single()
      return { data, error }
    },

    update: async (id: string, updates: { name?: string; avatar_url?: string }) => {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      return { data, error }
    },
  },

  // Projects
  projects: {
    create: async (projectData: { name: string; description?: string; user_id: string }) => {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('projects')
        .insert(projectData)
        .select()
        .single()
      return { data, error }
    },

    getByUserId: async (userId: string) => {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
      return { data, error }
    },

    update: async (id: string, updates: { name?: string; description?: string; is_active?: boolean }) => {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      return { data, error }
    },

    delete: async (id: string) => {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('projects')
        .update({ is_active: false })
        .eq('id', id)
        .select()
        .single()
      return { data, error }
    },
  },

  // Tasks
  tasks: {
    create: async (taskData: { 
      title: string; 
      description?: string; 
      project_id?: string; 
      user_id: string;
      priority?: number;
      due_date?: string;
    }) => {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('tasks')
        .insert(taskData)
        .select()
        .single()
      return { data, error }
    },

    getByUserId: async (userId: string) => {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      return { data, error }
    },

    getByProjectId: async (projectId: string) => {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
      return { data, error }
    },

    update: async (id: string, updates: { 
      title?: string; 
      description?: string; 
      is_completed?: boolean;
      priority?: number;
      due_date?: string;
    }) => {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      return { data, error }
    },

    delete: async (id: string) => {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)
      return { data, error }
    },
  },
}

// Export the supabase client for direct usage
export const supabase = getSupabaseClient