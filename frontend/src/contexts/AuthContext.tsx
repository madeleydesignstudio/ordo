import { createContext, useEffect, useState, useCallback } from "react";
import type { ReactNode } from "react";
import { authService } from "../services/auth";
import type { AuthState } from "../services/auth";

interface AuthContextType extends AuthState {
  signIn: () => Promise<void>;
  signOut: () => void;
  handleCallback: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    // Initialize auth state on mount
    const initializeAuth = () => {
      try {
        const isAuthenticated = authService.isAuthenticated();
        const user = authService.getCurrentUser();

        setAuthState((prev) => ({
          ...prev,
          isAuthenticated,
          user,
          loading: false,
          error: null,
        }));
      } catch (error) {
        setAuthState((prev) => ({
          ...prev,
          isAuthenticated: false,
          user: null,
          loading: false,
          error:
            error instanceof Error ? error.message : "Authentication error",
        }));
      }
    };

    initializeAuth();
  }, []);

  const signIn = useCallback(async (): Promise<void> => {
    try {
      setAuthState((prev) => ({ ...prev, loading: true, error: null }));
      await authService.signInWithGoogle();
    } catch (error) {
      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : "Sign in failed",
      }));
      throw error;
    }
  }, []);

  const signOut = useCallback((): void => {
    authService.signOut();
    setAuthState((prev) => ({
      ...prev,
      isAuthenticated: false,
      user: null,
      loading: false,
      error: null,
    }));
  }, []);

  const handleCallback = useCallback(async (): Promise<void> => {
    try {
      setAuthState((prev) => ({ ...prev, loading: true, error: null }));
      const user = await authService.handleCallback();

      setAuthState((prev) => ({
        ...prev,
        isAuthenticated: true,
        user,
        loading: false,
        error: null,
      }));
    } catch (error) {
      setAuthState((prev) => ({
        ...prev,
        isAuthenticated: false,
        user: null,
        loading: false,
        error:
          error instanceof Error ? error.message : "Callback handling failed",
      }));
      throw error;
    }
  }, []);

  const contextValue: AuthContextType = {
    ...authState,
    signIn,
    signOut,
    handleCallback,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}
