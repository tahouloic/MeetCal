// Modèle pour les profils utilisateurs publics

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  accountType: 'INDIVIDUAL' | 'BUSINESS';
  companyName?: string;
  profileVisibility: 'PUBLIC' | 'PRIVATE';
  timezone: string;
  createdAt?: Date;
}

export interface ProfileSearchRequest {
  query: string;
  accountType?: 'INDIVIDUAL' | 'BUSINESS';
}

export interface ProfileUpdateRequest {
  firstName?: string;
  lastName?: string;
  companyName?: string;
  timezone?: string;
}

export interface VisibilityUpdateRequest {
  profileVisibility: 'PUBLIC' | 'PRIVATE';
}
