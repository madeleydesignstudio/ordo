import { useState, useCallback } from "react";
import { AuthError } from "@supabase/supabase-js";
import { supabase } from "../utils/supabase";

export type OAuthProvider = "google" | "github" | "apple" | "azure" | "bitbucket" | "discord" | "facebook" | "figma" | "gitlab" | "linkedin" | "notion" | "slack" | "spotify" | "twitch" | "twitter" | "workos";

interface UseOAuthOptions {
  redirectTo?: string;
  scopes?: string;
  queryParams?: Record<string, string>;
  skipBrowserRedirect?: boolean;
}

interface OAuthState {
  loading: boolean;
  error: string | null;
}

export const useOAuth = () => {
  const [state, setState] = useState<OAuthState>({
    loading: false,
    error: null,
  });

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const signInWithProvider = useCallback(
    async (provider: OAuthProvider, options: UseOAuthOptions = {}) => {
      setState({ loading: true, error: null });

      try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider,
          options: {
            redirectTo: options.redirectTo || `${window.location.origin}/auth/callback`,
            scopes: options.scopes,
            queryParams: options.queryParams,
            skipBrowserRedirect: options.skipBrowserRedirect,
          },
        });

        if (error) {
          setState({ loading: false, error: error.message });
          return { error };
        }

        // Don't set loading to false here as we're redirecting
        return { error: null };
      } catch (err: any) {
        const errorMessage = err?.message || "An unexpected error occurred";
        setState({ loading: false, error: errorMessage });
        return { error: { message: errorMessage } as AuthError };
      }
    },
    []
  );

  const signInWithGoogle = useCallback(
    (options?: UseOAuthOptions) => signInWithProvider("google", options),
    [signInWithProvider]
  );

  const signInWithGitHub = useCallback(
    (options?: UseOAuthOptions) => signInWithProvider("github", options),
    [signInWithProvider]
  );

  const signInWithDiscord = useCallback(
    (options?: UseOAuthOptions) => signInWithProvider("discord", options),
    [signInWithProvider]
  );

  const signInWithTwitter = useCallback(
    (options?: UseOAuthOptions) => signInWithProvider("twitter", options),
    [signInWithProvider]
  );

  return {
    ...state,
    clearError,
    signInWithProvider,
    signInWithGoogle,
    signInWithGitHub,
    signInWithDiscord,
    signInWithTwitter,
  };
};
