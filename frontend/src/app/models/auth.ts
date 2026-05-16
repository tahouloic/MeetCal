export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'TEACHER';
  status: 'ACTIVE' | 'PENDING' | 'BLOCKED';
  profilePicture?: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

// Réponse du backend Spring Boot pour /api/auth/login
export interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    requiresTwoFactor?: boolean;
    requiresVerification?: boolean;  // Alias pour requiresTwoFactor
    email?: string;
    // Pour connexion directe (admin)
    accessToken?: string;
    refreshToken?: string;
    tokenType?: string;
    user?: User;
  };
  error?: string;
}

// Réponse du backend Spring Boot pour /api/auth/verify-2fa
export interface VerifyTwoFactorRequest {
  email: string;  // Backend utilise email, pas userId
  code: string;
}

export interface VerifyTwoFactorResponse {
  success: boolean;
  message: string;
  data?: {
    accessToken: string;
    refreshToken: string;
    tokenType: string;
    expiresIn: number;
    user: User;
  };
  error?: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  success: boolean;
  message: string;
  data?: {
    accessToken: string;
    refreshToken: string;
    tokenType: string;
    expiresIn: number;
  };
  error?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  requiresVerification: boolean;
  pendingEmail: string | null;  // Changé de pendingUserId à pendingEmail
}