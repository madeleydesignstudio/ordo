export interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;
  country?: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Onboarding fields
  onboardingStarted: boolean;
  onboardingStep: number;
  onboardingCompleted: boolean;
}

export interface Session {
  id: string;
  expiresAt: Date;
  token: string;
  createdAt: Date;
  updatedAt: Date;
  ipAddress?: string | null;
  userAgent?: string | null;
  userId: string;
}

export interface AuthData {
  user: User | null;
  session: Session | null;
} 