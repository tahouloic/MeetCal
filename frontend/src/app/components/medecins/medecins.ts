/**
 * EXPLICATION :
 * Ce composant est le "CONTROLLER" dans l'architecture MVC.
 * Il fait le lien entre la Vue (HTML) et le Modèle (Service).
 * 
 * Standalone: true = Composant autonome (nouveau dans Angular 17+)
 * Plus besoin de NgModule !
 * 
 * Imports nécessaires :
 * - CommonModule : Pour les directives *ngIf, *ngFor
 * - FormsModule : Pour le [(ngModel)] dans les formulaires
 */

import { Component, OnInit, inject, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { AdminMedecinService, MedecinAdmin } from '../../services/admin-medecin.service';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-medecins',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './medecins.html',
  styleUrl: './medecins.scss'
})
export class MedecinsComponent implements OnInit, OnDestroy {
  private adminMedecinService = inject(AdminMedecinService);
  private authService = inject(AuthService);
  private themeService = inject(ThemeService);
  private cdr = inject(ChangeDetectorRef);
  private destroy$ = new Subject<void>();

  // Données réactives
  medecins: MedecinAdmin[] = [];
  pendingMedecins: MedecinAdmin[] = [];
  filteredMedecins: MedecinAdmin[] = [];
  
  // État de l'interface
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  // Statistiques
  stats = {
    enAttente: 0,
    approuves: 0,
    rejetes: 0,
    suspendus: 0,
    total: 0
  };

  // Recherche et filtres
  searchQuery: string = '';
  selectedSpecialite: string = '';

  // Liste des spécialités
  specialites = [
    'Cardiologie',
    'Dermatologie',
    'Endocrinologie',
    'Gastroentérologie',
    'Gynécologie',
    'Neurologie',
    'Oncologie',
    'Ophtalmologie',
    'Orthopédie',
    'Pédiatrie',
    'Pneumologie',
    'Psychiatrie',
    'Radiologie',
    'Urologie',
    'Médecine générale',
    'Autre'
  ];

  ngOnInit(): void {
    console.log('🚀 MedecinsComponent: Initialisation du composant');
    
    // S'abonner aux changements d'état d'authentification
    this.authService.authState$
      .pipe(takeUntil(this.destroy$))
      .subscribe(authState => {
        console.log('🔐 MedecinsComponent: État d\'authentification changé:', authState.isAuthenticated);
        
        if (authState.isAuthenticated) {
          // Utilisateur connecté - charger les données
          console.log('✅ MedecinsComponent: Utilisateur authentifié, chargement des données');
          this.errorMessage = '';
          this.loadData();
        } else {
          // Utilisateur non connecté - effacer les données et afficher un message
          console.log('⚠️ MedecinsComponent: Utilisateur non authentifié, nettoyage des données');
          this.clearData();
          this.errorMessage = 'Veuillez vous connecter pour accéder aux données des médecins';
        }
      });
  }

  /**
   * Efface toutes les données
   */
  private clearData(): void {
    this.medecins = [];
    this.pendingMedecins = [];
    this.filteredMedecins = [];
    this.stats = {
      enAttente: 0,
      approuves: 0,
      rejetes: 0,
      suspendus: 0,
      total: 0
    };
    this.isLoading = false;
    
    // Forcer la détection de changements
    this.cdr.detectChanges();
    console.log('🧹 MedecinsComponent: Données effacées et interface mise à jour');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get isDarkMode() {
    return this.themeService.darkMode;
  }

  get medecinStats() {
    return this.stats;
  }

  /**
   * Charge toutes les données
   */
  private loadData(): void {
    console.log('📊 MedecinsComponent: Début du chargement des données');
    this.isLoading = true;
    this.errorMessage = '';

    // Déclencher le chargement des données dans le service
    this.adminMedecinService.getPendingDoctors().subscribe({
      next: (doctors) => {
        console.log('📥 MedecinsComponent: Médecins en attente reçus directement', doctors);
        this.pendingMedecins = doctors;
        this.cdr.detectChanges(); // Forcer la mise à jour de l'interface
        console.log('🔄 MedecinsComponent: Interface mise à jour pour médecins en attente');
      },
      error: (error) => {
        console.error('❌ MedecinsComponent: Erreur médecins en attente', error);
        if (error.status === 401) {
          this.errorMessage = 'Session expirée. Veuillez vous reconnecter.';
        } else {
          this.errorMessage = 'Erreur lors du chargement des médecins en attente';
        }
        this.cdr.detectChanges(); // Forcer la mise à jour même en cas d'erreur
      }
    });

    this.adminMedecinService.getAllDoctors().subscribe({
      next: (doctors) => {
        console.log('📥 MedecinsComponent: Tous les médecins reçus directement', doctors);
        this.medecins = doctors;
        this.applyFilters();
        this.isLoading = false;
        this.cdr.detectChanges(); // Forcer la mise à jour de l'interface
        console.log('🔄 MedecinsComponent: Interface mise à jour pour tous les médecins');
      },
      error: (error) => {
        console.error('❌ MedecinsComponent: Erreur tous les médecins', error);
        if (error.status === 401) {
          this.errorMessage = 'Session expirée. Veuillez vous reconnecter.';
        } else {
          this.errorMessage = 'Erreur lors du chargement des médecins';
        }
        this.isLoading = false;
        this.cdr.detectChanges(); // Forcer la mise à jour même en cas d'erreur
      }
    });

    this.adminMedecinService.getSystemStats().subscribe({
      next: (stats) => {
        console.log('📊 MedecinsComponent: Statistiques reçues directement', stats);
        this.stats = stats;
        this.cdr.detectChanges(); // Forcer la mise à jour de l'interface
        console.log('🔄 MedecinsComponent: Interface mise à jour pour statistiques');
      },
      error: (error) => {
        console.error('❌ MedecinsComponent: Erreur statistiques', error);
        if (error.status === 401) {
          console.log('⚠️ MedecinsComponent: Session expirée pour les statistiques');
        }
      }
    });

    // Également s'abonner aux observables pour les mises à jour futures
    this.adminMedecinService.pendingDoctors$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (doctors) => {
          console.log('📥 MedecinsComponent: Médecins en attente mis à jour via observable', doctors);
          this.pendingMedecins = doctors;
          this.cdr.detectChanges(); // Forcer la mise à jour de l'interface
          console.log('🔄 MedecinsComponent: Interface mise à jour via observable (pending)');
        }
      });

    this.adminMedecinService.allDoctors$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (doctors) => {
          console.log('📥 MedecinsComponent: Tous les médecins mis à jour via observable', doctors);
          this.medecins = doctors;
          this.applyFilters();
          this.cdr.detectChanges(); // Forcer la mise à jour de l'interface
          console.log('🔄 MedecinsComponent: Interface mise à jour via observable (all)');
        }
      });

    this.adminMedecinService.stats$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (stats) => {
          console.log('📊 MedecinsComponent: Statistiques mises à jour via observable', stats);
          this.stats = stats;
          this.cdr.detectChanges(); // Forcer la mise à jour de l'interface
          console.log('🔄 MedecinsComponent: Interface mise à jour via observable (stats)');
        }
      });
  }

  /**
   * Recharge les données manuellement
   */
  reloadData(): void {
    console.log('🔄 MedecinsComponent: Rechargement manuel des données');
    
    // Vérifier d'abord si l'utilisateur est authentifié
    if (!this.authService.isAuthenticated) {
      this.errorMessage = 'Veuillez vous connecter pour accéder aux données des médecins';
      this.cdr.detectChanges();
      return;
    }
    
    // Effacer les données existantes
    this.clearData();
    
    // Recharger les données
    this.loadData();
    
    // Forcer une mise à jour complète
    this.forceUIUpdate();
  }

  /**
   * Force une mise à jour complète de l'interface utilisateur
   */
  private forceUIUpdate(): void {
    // Utiliser setTimeout pour s'assurer que les changements sont appliqués dans le prochain cycle
    setTimeout(() => {
      this.cdr.detectChanges();
      console.log('🔄 MedecinsComponent: Mise à jour forcée de l\'interface');
      this.debugDataState();
    }, 0);
  }

  /**
   * Méthode de débogage pour vérifier l'état des données
   */
  debugDataState(): void {
    console.log('🐛 DEBUG - État des données:');
    console.log('  - Médecins en attente:', this.pendingMedecins.length, this.pendingMedecins);
    console.log('  - Tous les médecins:', this.medecins.length, this.medecins);
    console.log('  - Médecins filtrés:', this.filteredMedecins.length, this.filteredMedecins);
    console.log('  - Statistiques:', this.stats);
    console.log('  - Chargement en cours:', this.isLoading);
    console.log('  - Message d\'erreur:', this.errorMessage);
    console.log('  - Utilisateur authentifié:', this.authService.isAuthenticated);
    
    // Forcer une mise à jour après le debug
    this.cdr.detectChanges();
  }

  /**
   * Applique les filtres de recherche et spécialité
   */
  private applyFilters(): void {
    let filtered = [...this.medecins];

    // Filtre par recherche
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(medecin =>
        medecin.nom.toLowerCase().includes(query) ||
        medecin.prenom.toLowerCase().includes(query) ||
        medecin.email.toLowerCase().includes(query) ||
        medecin.specialite.toLowerCase().includes(query)
      );
    }

    // Filtre par spécialité
    if (this.selectedSpecialite) {
      filtered = filtered.filter(medecin => medecin.specialite === this.selectedSpecialite);
    }

    this.filteredMedecins = filtered;
    this.cdr.detectChanges(); // Forcer la mise à jour après filtrage
    console.log('🔍 MedecinsComponent: Filtres appliqués, interface mise à jour');
  }

  /**
   * Gestion de la recherche
   */
  onSearch(): void {
    this.applyFilters();
  }

  /**
   * Filtre par spécialité
   */
  onFilterBySpecialite(): void {
    this.applyFilters();
  }

  /**
   * Réinitialise tous les filtres
   */
  resetFilters(): void {
    this.searchQuery = '';
    this.selectedSpecialite = '';
    this.applyFilters();
  }

  /**
   * Approuve un médecin en attente
   */
  approveMedecin(medecin: MedecinAdmin): void {
    const confirmation = confirm(
      `Voulez-vous approuver Dr. ${medecin.prenom} ${medecin.nom} ?\n\nCela activera son compte et lui donnera accès à la plateforme.`
    );

    if (confirmation) {
      this.isLoading = true;
      // Utiliser l'ID du médecin (doctorId) pour l'approbation
      this.adminMedecinService.approveDoctor(medecin.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            this.successMessage = `Dr. ${medecin.prenom} ${medecin.nom} a été approuvé avec succès !`;
            this.clearMessages();
            this.isLoading = false;
            // Recharger les données
            this.loadData();
          },
          error: (error) => {
            this.errorMessage = 'Erreur lors de l\'approbation du médecin';
            this.clearMessages();
            this.isLoading = false;
            console.error(error);
          }
        });
    }
  }

  /**
   * Rejette un médecin en attente
   */
  rejectMedecin(medecin: MedecinAdmin): void {
    const confirmation = confirm(
      `Êtes-vous sûr de vouloir rejeter la demande de Dr. ${medecin.prenom} ${medecin.nom} ?\n\nCette action supprimera définitivement son compte.`
    );

    if (confirmation) {
      const reason = prompt('Raison du rejet (obligatoire):');
      if (reason && reason.trim().length >= 10) {
        this.isLoading = true;
        // Utiliser l'ID du médecin (doctorId) pour le rejet
        this.adminMedecinService.rejectDoctor(medecin.id, reason)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (response) => {
              this.successMessage = `La demande de Dr. ${medecin.prenom} ${medecin.nom} a été rejetée.`;
              this.clearMessages();
              this.isLoading = false;
              // Recharger les données
              this.loadData();
            },
            error: (error) => {
              this.errorMessage = 'Erreur lors du rejet du médecin';
              this.clearMessages();
              this.isLoading = false;
              console.error(error);
            }
          });
      } else {
        alert('Veuillez fournir une raison de rejet d\'au moins 10 caractères.');
      }
    }
  }

  /**
   * Change le statut d'un médecin (activer/bloquer)
   */
  toggleStatus(medecin: MedecinAdmin): void {
    const newStatus = medecin.statut === 'actif' ? 'BLOCKED' : 'ACTIVE';
    const action = newStatus === 'BLOCKED' ? 'bloquer' : 'activer';
    
    const confirmation = confirm(
      `Voulez-vous ${action} Dr. ${medecin.prenom} ${medecin.nom} ?`
    );

    if (confirmation) {
      this.isLoading = true;
      this.adminMedecinService.changeUserStatus(medecin.userId, newStatus)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            this.successMessage = `Dr. ${medecin.prenom} ${medecin.nom} a été ${action === 'bloquer' ? 'bloqué' : 'activé'} avec succès.`;
            this.clearMessages();
            this.isLoading = false;
          },
          error: (error) => {
            this.errorMessage = `Erreur lors du changement de statut`;
            this.clearMessages();
            this.isLoading = false;
            console.error(error);
          }
        });
    }
  }

  /**
   * Efface les messages après un délai
   */
  private clearMessages(): void {
    setTimeout(() => {
      this.successMessage = '';
      this.errorMessage = '';
    }, 5000);
  }
}