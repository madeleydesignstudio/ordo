interface WorkspaceData {
  name: string;
  image?: string;
}

interface OnboardingResponse {
  success: boolean;
  workspace?: any;
  error?: string;
}

class OnboardingService {
  private baseUrl: string;

  constructor() {
    // Determine environment and set appropriate engine URL
    const isDevelopment = typeof window !== 'undefined' && window.location.hostname === 'localhost';
    this.baseUrl = isDevelopment 
      ? import.meta.env.VITE_ENGINE_DEV_URL
      : import.meta.env.VITE_ENGINE_PROD_URL;
  }

  async createWorkspace(data: WorkspaceData): Promise<OnboardingResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/onboarding/workspace`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.error || 'Failed to create workspace',
        };
      }

      return result;
    } catch (error) {
      console.error('Error creating workspace:', error);
      return {
        success: false,
        error: 'Network error occurred',
      };
    }
  }

  async getWorkspace(): Promise<{ workspace: any | null; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/onboarding/workspace`, {
        method: 'GET',
        credentials: 'include',
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          workspace: null,
          error: result.error || 'Failed to fetch workspace',
        };
      }

      return result;
    } catch (error) {
      console.error('Error fetching workspace:', error);
      return {
        workspace: null,
        error: 'Network error occurred',
      };
    }
  }

  async updateOnboardingStatus(step: number, completed: boolean): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/onboarding/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ step, completed }),
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.error || 'Failed to update onboarding status',
        };
      }

      return result;
    } catch (error) {
      console.error('Error updating onboarding status:', error);
      return {
        success: false,
        error: 'Network error occurred',
      };
    }
  }
}

export const onboardingService = new OnboardingService(); 