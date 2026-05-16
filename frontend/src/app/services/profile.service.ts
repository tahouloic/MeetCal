import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { 
  UserProfile, 
  ProfileSearchRequest,
  ProfileUpdateRequest,
  VisibilityUpdateRequest
} from '../models/profile';
import { ApiResponse } from '../models/schedule';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private readonly API_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Rechercher des profils publics
  searchProfiles(query: string, accountType?: 'INDIVIDUAL' | 'BUSINESS'): Observable<ApiResponse<UserProfile[]>> {
    let params = new HttpParams().set('query', query);
    if (accountType) {
      params = params.set('accountType', accountType);
    }
    return this.http.get<ApiResponse<UserProfile[]>>(`${this.API_URL}/profiles/search`, { params });
  }

  // Obtenir un profil public par ID
  getPublicProfile(userId: string): Observable<ApiResponse<UserProfile>> {
    return this.http.get<ApiResponse<UserProfile>>(`${this.API_URL}/profiles/${userId}`);
  }

  // Obtenir mon profil
  getMyProfile(): Observable<ApiResponse<UserProfile>> {
    return this.http.get<ApiResponse<UserProfile>>(`${this.API_URL}/profiles/me`);
  }

  // Mettre à jour mon profil
  updateMyProfile(updates: ProfileUpdateRequest): Observable<ApiResponse<UserProfile>> {
    return this.http.put<ApiResponse<UserProfile>>(`${this.API_URL}/profiles/me`, updates);
  }

  // Changer la visibilité du profil
  updateVisibility(visibility: 'PUBLIC' | 'PRIVATE'): Observable<ApiResponse<void>> {
    return this.http.put<ApiResponse<void>>(`${this.API_URL}/profiles/me/visibility`, {
      profileVisibility: visibility
    });
  }

  // Changer le fuseau horaire
  updateTimezone(timezone: string): Observable<ApiResponse<void>> {
    return this.http.put<ApiResponse<void>>(`${this.API_URL}/profiles/me/timezone`, {
      timezone
    });
  }

  // Formater le nom complet
  getFullName(profile: UserProfile): string {
    if (profile.accountType === 'BUSINESS' && profile.companyName) {
      return profile.companyName;
    }
    return `${profile.firstName} ${profile.lastName}`;
  }

  // Obtenir le label du type de compte
  getAccountTypeLabel(accountType: 'INDIVIDUAL' | 'BUSINESS'): string {
    return accountType === 'INDIVIDUAL' ? 'Particulier' : 'Entreprise';
  }
}
