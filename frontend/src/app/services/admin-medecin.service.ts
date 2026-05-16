import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError, forkJoin } from 'rxjs';
import { map, catchError, tap, switchMap } from 'rxjs/operators';
import { AuthService } from './auth.service';

// Interfaces pour les données du backend
export interface BackendUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'PATIENT' | 'DOCTOR' | 'ADMIN';
  status: 'ACTIVE' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'BLOCKED';
  profilePicture?: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BackendDoctor {
  id: string;
  userId: string;
  specialty: string;
  licenseNumber: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  user: BackendUser;
}

// Interface pour les médecins en attente (structure différente)
export interface BackendPendingDoctor {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  profilePicture?: string;
  status: string;
  createdAt: string;
  specialty: string;
  licenseNumber: string;
  doctorId: string;
}

export interface DoctorListResponse {
  success: boolean;
  data: {
    doctors: BackendPendingDoctor[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface UserListResponse {
  success: boolean;
  data: {
    users: BackendUser[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface ValidationResponse {
  success: boolean;
  message: string;
  data?: any;
}

export interface SystemStatsResponse {
  success: boolean;
  data: {
    totalUsers: number;
    totalPatients: number;
    totalDoctors: number;
    pendingDoctors: number;
    approvedDoctors: number;
    rejectedDoctors: number;
    blockedUsers: number;
  };
}

// Interface pour les médecins adaptée à l'interface existante
export interface MedecinAdmin {
  id: string;
  nom: string;
  prenom: string;
  specialite: string;
  telephone: string;
  email: string;
  numeroOrdre: string;
  dateInscription: string;
  statut: 'actif' | 'inactif' | 'en attente' | 'suspendu';
  verified: boolean;
  userId: string;
  profilePicture?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminMedecinService {
  private readonly API_URL = 'http://localhost:5000/api';
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  // BehaviorSubjects pour la gestion d'état réactive
  private pendingDoctorsSubject = new BehaviorSubject<MedecinAdmin[]>([]);
  private allDoctorsSubject = new BehaviorSubject<MedecinAdmin[]>([]);
  private statsSubject = new BehaviorSubject<any>({
    enAttente: 0,
    approuves: 0,
    rejetes: 0,
    suspendus: 0,
    total: 0
  });

  // Observables publics
  public pendingDoctors$ = this.pendingDoctorsSubject.asObservable();
  public allDoctors$ = this.allDoctorsSubject.asObservable();
  public stats$ = this.statsSubject.asObservable();

  constructor() {
    console.log('🔧 AdminMedecinService: Initialisation du service');
    // Ne pas charger les données automatiquement dans le constructeur
    // Les données seront chargées quand le composant en aura besoin
  }

  /**
   * Récupère les médecins en attente de validation
   */
  getPendingDoctors(page: number = 1, limit: number = 50, search?: string): Observable<MedecinAdmin[]> {
    console.log('🔍 AdminMedecinService: Récupération des médecins en attente');
    
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<DoctorListResponse>(`${this.API_URL}/admin/doctors/pending`, { params })
      .pipe(
        map(response => {
          console.log('📥 AdminMedecinService: Réponse médecins en attente', response);
          if (response.success) {
            const medecins = response.data.doctors.map(doctor => this.mapBackendPendingDoctorToMedecin(doctor));
            console.log('✅ AdminMedecinService: Médecins en attente mappés', medecins);
            this.pendingDoctorsSubject.next(medecins);
            return medecins;
          }
          return [];
        }),
        catchError(error => {
          console.error('❌ AdminMedecinService: Erreur lors du chargement des médecins en attente:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Récupère tous les médecins (approuvés et en attente)
   */
  getAllDoctors(page: number = 1, limit: number = 100, search?: string): Observable<MedecinAdmin[]> {
    console.log('🔍 AdminMedecinService: Récupération de tous les médecins');
    
    return this.getAllDoctorsFromAllPages(search);
  }

  /**
   * Récupère tous les médecins de toutes les pages
   */
  private getAllDoctorsFromAllPages(search?: string): Observable<MedecinAdmin[]> {
    const allDoctors: MedecinAdmin[] = [];
    
    return new Observable<MedecinAdmin[]>(observer => {
      const fetchPage = (pageNum: number) => {
        let params = new HttpParams()
          .set('page', pageNum.toString())
          .set('limit', '50') // Limite raisonnable par page
          .set('role', 'DOCTOR');

        if (search) {
          params = params.set('search', search);
        }

        this.http.get<UserListResponse>(`${this.API_URL}/admin/users`, { params })
          .subscribe({
            next: (response) => {
              if (response.success) {
                // Filtrer et mapper les médecins de cette page
                const pageDoctors = response.data.users
                  .filter(user => user.role === 'DOCTOR')
                  .map(user => this.mapBackendUserToMedecin(user));

                allDoctors.push(...pageDoctors);
                console.log(`📥 AdminMedecinService: Page ${pageNum} - ${pageDoctors.length} médecins trouvés. Total: ${allDoctors.length}`);

                // Vérifier s'il y a d'autres pages
                const hasNext = response.data.pagination.page < response.data.pagination.totalPages;
                if (hasNext) {
                  // Récupérer la page suivante
                  fetchPage(pageNum + 1);
                } else {
                  // Dernière page atteinte
                  console.log('✅ AdminMedecinService: Toutes les pages récupérées. Total final:', allDoctors.length);
                  console.log('👥 AdminMedecinService: Liste complète:', allDoctors.map(m => `${m.prenom} ${m.nom} (${m.statut})`));
                  
                  this.allDoctorsSubject.next(allDoctors);
                  observer.next(allDoctors);
                  observer.complete();
                }
              } else {
                observer.error(new Error('Erreur lors de la récupération des médecins'));
              }
            },
            error: (error) => {
              console.error(`❌ AdminMedecinService: Erreur page ${pageNum}:`, error);
              observer.error(error);
            }
          });
      };

      // Commencer par la première page
      fetchPage(1);
    });
  }



  /**
   * Approuve un médecin
   */
  approveDoctor(doctorId: string): Observable<ValidationResponse> {
    return this.http.post<ValidationResponse>(`${this.API_URL}/admin/doctors/${doctorId}/validate`, {
      action: 'approve'
    }).pipe(
      tap(response => {
        if (response.success) {
          // Recharger les données après approbation
          this.loadPendingDoctors();
          this.loadAllDoctors();
          this.loadStats();
        }
      }),
      catchError(error => {
        console.error('Erreur lors de l\'approbation du médecin:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Rejette un médecin
   */
  rejectDoctor(doctorId: string, rejectionReason: string): Observable<ValidationResponse> {
    return this.http.post<ValidationResponse>(`${this.API_URL}/admin/doctors/${doctorId}/validate`, {
      action: 'reject',
      rejectionReason
    }).pipe(
      tap(response => {
        if (response.success) {
          // Recharger les données après rejet
          this.loadPendingDoctors();
          this.loadStats();
        }
      }),
      catchError(error => {
        console.error('Erreur lors du rejet du médecin:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Change le statut d'un utilisateur (activer/bloquer)
   */
  changeUserStatus(userId: string, status: 'ACTIVE' | 'BLOCKED'): Observable<ValidationResponse> {
    return this.http.post<ValidationResponse>(`${this.API_URL}/admin/users/${userId}/status`, {
      status
    }).pipe(
      tap(response => {
        if (response.success) {
          // Recharger les données après changement de statut
          this.loadAllDoctors();
          this.loadStats();
        }
      }),
      catchError(error => {
        console.error('Erreur lors du changement de statut:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Récupère les statistiques du système
   */
  getSystemStats(): Observable<any> {
    return this.http.get<SystemStatsResponse>(`${this.API_URL}/admin/stats`)
      .pipe(
        map(response => {
          if (response.success) {
            const stats = {
              enAttente: response.data.pendingDoctors,
              approuves: response.data.approvedDoctors,
              rejetes: response.data.rejectedDoctors,
              suspendus: response.data.blockedUsers,
              total: response.data.totalDoctors
            };
            this.statsSubject.next(stats);
            return stats;
          }
          return {
            enAttente: 0,
            approuves: 0,
            rejetes: 0,
            suspendus: 0,
            total: 0
          };
        }),
        catchError(error => {
          console.error('Erreur lors du chargement des statistiques:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Recherche des médecins
   */
  searchDoctors(query: string): Observable<MedecinAdmin[]> {
    return this.getAllDoctors(1, 100, query);
  }

  /**
   * Filtre les médecins par spécialité
   */
  getDoctorsBySpecialty(specialty: string): Observable<MedecinAdmin[]> {
    return this.allDoctors$.pipe(
      map(doctors => doctors.filter(doctor => doctor.specialite === specialty))
    );
  }

  // Méthodes privées pour charger les données
  private loadPendingDoctors(): void {
    this.getPendingDoctors().subscribe();
  }

  private loadAllDoctors(): void {
    this.getAllDoctors().subscribe();
  }

  private loadStats(): void {
    this.getSystemStats().subscribe();
  }

  /**
   * Mappe un médecin en attente du backend vers l'interface locale
   */
  private mapBackendPendingDoctorToMedecin(doctor: BackendPendingDoctor): MedecinAdmin {
    return {
      id: doctor.doctorId, // Utiliser l'ID du médecin, pas l'ID utilisateur
      userId: doctor.id, // L'ID utilisateur
      nom: doctor.lastName,
      prenom: doctor.firstName,
      specialite: doctor.specialty,
      telephone: doctor.phone || '',
      email: doctor.email,
      numeroOrdre: doctor.licenseNumber,
      dateInscription: new Date(doctor.createdAt).toISOString().split('T')[0],
      statut: this.mapBackendStatusToLocal(doctor.status),
      verified: false, // En attente = pas encore vérifié
      profilePicture: doctor.profilePicture
    };
  }

  /**
   * Mappe un médecin du backend vers l'interface locale
   */
  private mapBackendDoctorToMedecin(doctor: BackendDoctor): MedecinAdmin {
    return {
      id: doctor.id,
      userId: doctor.userId,
      nom: doctor.user.lastName,
      prenom: doctor.user.firstName,
      specialite: doctor.specialty,
      telephone: doctor.user.phone || '',
      email: doctor.user.email,
      numeroOrdre: doctor.licenseNumber,
      dateInscription: new Date(doctor.user.createdAt).toISOString().split('T')[0],
      statut: this.mapBackendStatusToLocal(doctor.user.status),
      verified: doctor.user.status === 'APPROVED',
      profilePicture: doctor.user.profilePicture
    };
  }

  /**
   * Mappe un utilisateur du backend vers l'interface locale (pour les médecins)
   */
  private mapBackendUserToMedecin(user: BackendUser): MedecinAdmin {
    return {
      id: user.id,
      userId: user.id,
      nom: user.lastName,
      prenom: user.firstName,
      specialite: 'Non spécifiée', // À récupérer depuis la table doctors si nécessaire
      telephone: user.phone || '',
      email: user.email,
      numeroOrdre: 'Non spécifié', // À récupérer depuis la table doctors si nécessaire
      dateInscription: new Date(user.createdAt).toISOString().split('T')[0],
      statut: this.mapBackendStatusToLocal(user.status),
      verified: user.status === 'APPROVED',
      profilePicture: user.profilePicture
    };
  }

  /**
   * Mappe le statut du backend vers le statut local
   */
  private mapBackendStatusToLocal(status: string): 'actif' | 'inactif' | 'en attente' | 'suspendu' {
    switch (status) {
      case 'ACTIVE':
      case 'APPROVED':
        return 'actif';
      case 'PENDING':
        return 'en attente';
      case 'BLOCKED':
        return 'suspendu';
      case 'REJECTED':
        return 'inactif';
      default:
        return 'en attente';
    }
  }

  // Getters pour la compatibilité avec l'interface existante
  get currentStats() {
    return this.statsSubject.value;
  }

  get isAuthenticated(): boolean {
    return this.authService.isAuthenticated;
  }
}