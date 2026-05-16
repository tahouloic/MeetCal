import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { 
  User, 
  LoginRequest, 
  LoginResponse, 
  AuthState,
  VerifyTwoFactorRequest,
  VerifyTwoFactorResponse,
  RefreshTokenResponse
} from '../models/auth';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = environment.apiUrl;
  private readonly TOKEN_KEY = 'schedule_management_access_token';
  private readonly REFRESH_TOKEN_KEY = 'schedule_management_refresh_token';
  private readonly USER_KEY = 'schedule_management_user';
  private readonly SESSION_KEY = 'schedule_management_session_active';

  private authStateSubject = new BehaviorSubject<AuthState>({
    isAuthenticated: false,
    user: null,
    accessToken: null,
    refreshToken: null,
    isLoading: false,
    requiresVerification: false,
    pendingEmail: null
  });

  public authState$ = this.authStateSubject.asObservable();

  constructor(private http: HttpClient) {
    this.initializeAuthState();
  }

  private initializeAuthState(): void {
    console.log('🔄 AuthService: Initialisation de l\'état d\'authentification');
    
    // Vérifier si c'est un nouveau démarrage de l'application
    const sessionActive = sessionStorage.getItem(this.SESSION_KEY);
    
    if (!sessionActive) {
      // Nouveau démarrage de l'application - nettoyer les tokens
      console.log('🔄 Nouveau démarrage de l\'application - nettoyage des tokens');
      this.clearAuthData();
      sessionStorage.setItem(this.SESSION_KEY, 'true');
      return;
    }

    // Session active - vérifier les tokens existants
    const accessToken = localStorage.getItem(this.TOKEN_KEY);
    const refreshToken = localStorage.getItem(this.REFRESH_TOKEN_KEY);
    const userStr = localStorage.getItem(this.USER_KEY);

    console.log('🔍 AuthService: Vérification des tokens existants:', {
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
      hasUser: !!userStr
    });

    if (accessToken && refreshToken && userStr) {
      try {
        const user = JSON.parse(userStr);
        console.log('✅ AuthService: Restauration de la session utilisateur:', user.email);
        this.authStateSubject.next({
          ...this.authStateSubject.value,
          isAuthenticated: true,
          user,
          accessToken,
          refreshToken
        });
      } catch (error) {
        console.error('❌ AuthService: Erreur parsing user data:', error);
        this.clearAuthData();
      }
    } else {
      console.log('⚠️ AuthService: Tokens manquants, utilisateur non authentifié');
    }
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    this.setLoading(true);
    console.log('🔐 AuthService: Tentative de connexion pour:', credentials.email);
    
    return this.http.post<LoginResponse>(`${this.API_URL}/auth/login`, credentials)
      .pipe(
        tap(response => {
          console.log('📥 AuthService: Réponse de connexion complète:', response);
          console.log('📥 AuthService: response.data:', response.data);
          console.log('📥 AuthService: requiresVerification:', response.data?.requiresVerification);
          
          if (response.success && response.data) {
            // Cas 1: Connexion directe avec tokens (admin)
            if (response.data.accessToken && response.data.refreshToken && response.data.user) {
              console.log('✅ AuthService: Connexion directe réussie (admin)');
              this.setAuthData(response.data.user, {
                accessToken: response.data.accessToken,
                refreshToken: response.data.refreshToken
              });
            }
            // Cas 2: Nécessite une vérification 2FA (enseignant)
            else if (response.data.requiresVerification === true) {
              console.log('🔒 AuthService: Vérification 2FA requise');
              console.log('📧 AuthService: Email en attente:', response.data.user?.email || credentials.email);
              
              const newState = {
                ...this.authStateSubject.value,
                requiresVerification: true,
                pendingEmail: response.data.user?.email || credentials.email,
                isLoading: false
              };
              
              console.log('📊 AuthService: Nouveau state:', newState);
              this.authStateSubject.next(newState);
            } else {
              console.warn('⚠️ AuthService: Cas non géré, response.data:', response.data);
              this.setLoading(false);
            }
          } else {
            console.warn('⚠️ AuthService: Réponse invalide');
            this.setLoading(false);
          }
        }),
        catchError(error => {
          console.error('❌ AuthService: Erreur de connexion:', error);
          this.setLoading(false);
          return throwError(() => error);
        })
      );
  }

  verifyTwoFactor(request: VerifyTwoFactorRequest): Observable<VerifyTwoFactorResponse> {
    this.setLoading(true);
    console.log('🔐 AuthService: Vérification du code 2FA pour:', request.email);
    
    return this.http.post<VerifyTwoFactorResponse>(`${this.API_URL}/auth/verify-2fa`, request)
      .pipe(
        tap(response => {
          console.log('📥 AuthService: Réponse de vérification 2FA:', response);
          if (response.success && response.data) {
            // Backend retourne directement les tokens et l'utilisateur
            this.setAuthData(response.data.user, {
              accessToken: response.data.accessToken,
              refreshToken: response.data.refreshToken
            });
          }
        }),
        catchError(error => {
          console.error('❌ AuthService: Erreur de vérification 2FA:', error);
          this.setLoading(false);
          return throwError(() => error);
        })
      );
  }

  refreshToken(): Observable<RefreshTokenResponse> {
    const refreshToken = this.authStateSubject.value.refreshToken;
    
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    console.log('🔄 AuthService: Rafraîchissement du token');
    
    return this.http.post<RefreshTokenResponse>(`${this.API_URL}/auth/refresh`, { refreshToken })
      .pipe(
        tap(response => {
          console.log('📥 AuthService: Token rafraîchi avec succès');
          if (response.success && response.data) {
            const currentState = this.authStateSubject.value;
            this.authStateSubject.next({
              ...currentState,
              accessToken: response.data.accessToken,
              refreshToken: response.data.refreshToken
            });
            
            localStorage.setItem(this.TOKEN_KEY, response.data.accessToken);
            localStorage.setItem(this.REFRESH_TOKEN_KEY, response.data.refreshToken);
          }
        }),
        catchError(error => {
          console.error('❌ AuthService: Erreur de rafraîchissement du token:', error);
          this.logout();
          return throwError(() => error);
        })
      );
  }

  logout(): Observable<any> {
    const refreshToken = this.authStateSubject.value.refreshToken;
    
    console.log('🚪 AuthService: Déconnexion');
    
    // Appel API de déconnexion
    const logoutRequest = refreshToken 
      ? this.http.post(`${this.API_URL}/auth/logout`, { refreshToken })
      : new Observable(observer => {
          observer.next({});
          observer.complete();
        });

    return logoutRequest.pipe(
      tap(() => {
        console.log('✅ AuthService: Déconnexion réussie');
        this.clearAuthData();
      }),
      catchError(() => {
        // Même en cas d'erreur, on nettoie les données locales
        console.log('⚠️ AuthService: Erreur de déconnexion, nettoyage local');
        this.clearAuthData();
        return new Observable(observer => {
          observer.next({});
          observer.complete();
        });
      })
    );
  }

  getProfile(): Observable<{ success: boolean; data?: { user: User } }> {
    return this.http.get<{ success: boolean; data?: { user: User } }>(`${this.API_URL}/auth/profile`)
      .pipe(
        tap(response => {
          if (response.success && response.data) {
            const currentState = this.authStateSubject.value;
            this.authStateSubject.next({
              ...currentState,
              user: response.data.user
            });
            localStorage.setItem(this.USER_KEY, JSON.stringify(response.data.user));
          }
        })
      );
  }

  resendTwoFactorCode(email: string): Observable<any> {
    console.log('📧 AuthService: Renvoi du code 2FA pour:', email);
    return this.http.post(`${this.API_URL}/auth/resend-2fa`, { email });
  }

  registerTeacher(data: any): Observable<any> {
    console.log('📝 AuthService: Inscription enseignant');
    
    return this.http.post<any>(`${this.API_URL}/auth/register/teacher`, data)
      .pipe(
        tap(response => {
          console.log('📥 AuthService: Réponse d\'inscription:', response);
        }),
        catchError(error => {
          console.error('❌ AuthService: Erreur d\'inscription:', error);
          return throwError(() => error);
        })
      );
  }

  registerIndividual(data: any): Observable<any> {
    console.log('📝 AuthService: Inscription particulier');
    console.log('📋 Données envoyées:', JSON.stringify(data, null, 2));
    console.log('📋 Type de chaque champ:');
    console.log('  - firstName:', typeof data.firstName, '=', data.firstName);
    console.log('  - lastName:', typeof data.lastName, '=', data.lastName);
    console.log('  - email:', typeof data.email, '=', data.email);
    console.log('  - phone:', typeof data.phone, '=', data.phone);
    console.log('  - occupation:', typeof data.occupation, '=', data.occupation);
    console.log('  - educationLevel:', typeof data.educationLevel, '=', data.educationLevel);
    console.log('  - gender:', typeof data.gender, '=', data.gender);
    
    return this.http.post<any>(`${this.API_URL}/auth/register/individual`, data)
      .pipe(
        tap(response => {
          console.log('📥 AuthService: Réponse d\'inscription particulier:', response);
        }),
        catchError(error => {
          console.error('❌ AuthService: Erreur d\'inscription particulier:', error);
          console.error('❌ Détails de l\'erreur:', error.error);
          console.error('❌ Message d\'erreur:', error.error?.error);
          console.error('❌ Code d\'erreur:', error.error?.code);
          console.error('❌ Erreur complète:', JSON.stringify(error.error, null, 2));
          return throwError(() => error);
        })
      );
  }

  registerBusiness(data: any): Observable<any> {
    console.log('📝 AuthService: Inscription entreprise');
    
    return this.http.post<any>(`${this.API_URL}/auth/register/business`, data)
      .pipe(
        tap(response => {
          console.log('📥 AuthService: Réponse d\'inscription entreprise:', response);
        }),
        catchError(error => {
          console.error('❌ AuthService: Erreur d\'inscription entreprise:', error);
          return throwError(() => error);
        })
      );
  }

  private setAuthData(user: User, tokens: { accessToken: string; refreshToken: string }): void {
    console.log('✅ AuthService: Définition des données d\'authentification pour:', user.email);
    console.log('🔑 AuthService: Token défini (premiers caractères):', tokens.accessToken.substring(0, 20) + '...');
    
    this.authStateSubject.next({
      isAuthenticated: true,
      user,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      isLoading: false,
      requiresVerification: false,
      pendingEmail: null
    });

    localStorage.setItem(this.TOKEN_KEY, tokens.accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, tokens.refreshToken);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    sessionStorage.setItem(this.SESSION_KEY, 'true');
    
    console.log('💾 AuthService: Données sauvegardées dans localStorage et sessionStorage');
  }

  private clearAuthData(): void {
    console.log('🧹 AuthService: Nettoyage des données d\'authentification');
    
    this.authStateSubject.next({
      isAuthenticated: false,
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,
      requiresVerification: false,
      pendingEmail: null
    });

    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    sessionStorage.removeItem(this.SESSION_KEY);
    
    console.log('🗑️ AuthService: Données supprimées de localStorage et sessionStorage');
  }

  private setLoading(loading: boolean): void {
    this.authStateSubject.next({
      ...this.authStateSubject.value,
      isLoading: loading
    });
  }

  // Getters pour l'état actuel
  get currentUser(): User | null {
    return this.authStateSubject.value.user;
  }

  get isAuthenticated(): boolean {
    return this.authStateSubject.value.isAuthenticated;
  }

  get accessToken(): string | null {
    const token = this.authStateSubject.value.accessToken;
    console.log('🔑 AuthService: Récupération du token d\'accès:', !!token ? token.substring(0, 20) + '...' : 'null');
    return token;
  }

  get requiresVerification(): boolean {
    return this.authStateSubject.value.requiresVerification;
  }

  get pendingEmail(): string | null {
    return this.authStateSubject.value.pendingEmail;
  }
}