import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY;

// Only create supabase client if environment variables are provided
export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

const isSupabaseConfigured = (): boolean => !!supabase;

const SUPABASE_NOT_CONFIGURED_ERROR =
  "Supabase not configured. Please set VITE_PUBLIC_SUPABASE_URL and VITE_PUBLIC_SUPABASE_ANON_KEY environment variables.";

export class AuthService {
  private validateSupabaseConfiguration(): void {
    if (!isSupabaseConfigured()) {
      throw new Error(SUPABASE_NOT_CONFIGURED_ERROR);
    }
  }

  async signUp(email: string, password: string) {
    this.validateSupabaseConfiguration();

    const { data, error } = await supabase!.auth.signUp({
      email,
      password,
    });

    if (error) throw error;
    return data;
  }

  async signIn(email: string, password: string) {
    this.validateSupabaseConfiguration();

    const { data, error } = await supabase!.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  }

  async signOut(): Promise<void> {
    this.validateSupabaseConfiguration();

    const { error } = await supabase!.auth.signOut();
    if (error) throw error;
  }

  async getCurrentUser() {
    if (!isSupabaseConfigured()) {
      return null;
    }

    const {
      data: { user },
      error,
    } = await supabase!.auth.getUser();

    if (error) throw error;
    return user;
  }

  async getSession() {
    if (!isSupabaseConfigured()) {
      return null;
    }

    const {
      data: { session },
      error,
    } = await supabase!.auth.getSession();

    if (error) throw error;
    return session;
  }

  isConfigured(): boolean {
    return isSupabaseConfigured();
  }
}

export const authService = new AuthService();
