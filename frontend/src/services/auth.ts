/**
 * Google OAuth2 Authentication Service - Backend Flow
 * Uses backend server at port 8080 to handle OAuth2 flow
 */

export interface GoogleUser {
  id: string;
  email: string;
  name: string;
  picture: string;
  verified_email: boolean;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: GoogleUser | null;
  loading: boolean;
  error: string | null;
}

class AuthService {
  private readonly BACKEND_URL = "http://localhost:8080";

  /**
   * Initialize Google OAuth2 flow via backend
   */
  async signInWithGoogle(): Promise<void> {
    // Redirect to backend OAuth endpoint
    window.location.href = `${this.BACKEND_URL}/auth/google`;
  }

  /**
   * Handle OAuth2 callback from backend
   * Backend redirects here after successful authentication
   */
  async handleCallback(): Promise<GoogleUser> {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    const error = urlParams.get("error");

    // Check for errors
    if (error) {
      throw new Error(`OAuth error: ${error}`);
    }

    if (!token) {
      throw new Error("No authentication token received");
    }

    // Verify token and get user info from backend
    const response = await fetch(`${this.BACKEND_URL}/api/auth/verify`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to verify authentication token: ${response.status}`,
      );
    }

    const authData = await response.json();

    if (!authData.user) {
      throw new Error("Invalid authentication response");
    }

    // Store token and user info
    localStorage.setItem("access_token", token);
    localStorage.setItem("user_info", JSON.stringify(authData.user));

    return authData.user;
  }

  /**
   * Get current user from storage
   */
  getCurrentUser(): GoogleUser | null {
    const userInfo = localStorage.getItem("user_info");
    if (!userInfo) return null;

    try {
      return JSON.parse(userInfo);
    } catch {
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = localStorage.getItem("access_token");
    const user = this.getCurrentUser();
    return !!(token && user);
  }

  /**
   * Sign out user
   */
  signOut(): void {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_info");
  }

  /**
   * Get current access token
   */
  getAccessToken(): string | null {
    return localStorage.getItem("access_token");
  }

  /**
   * Refresh authentication status by checking with backend
   */
  async refreshAuth(): Promise<GoogleUser | null> {
    const token = this.getAccessToken();
    if (!token) return null;

    try {
      const response = await fetch(`${this.BACKEND_URL}/api/auth/verify`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        this.signOut();
        return null;
      }

      const authData = await response.json();
      if (!authData.user) {
        this.signOut();
        return null;
      }

      // Update stored user info
      localStorage.setItem("user_info", JSON.stringify(authData.user));
      return authData.user;
    } catch {
      this.signOut();
      return null;
    }
  }
}

export const authService = new AuthService();
