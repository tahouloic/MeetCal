import { Component, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject, takeUntil, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { ThemeService } from '../../../services/theme.service';
import { AuthService } from '../../../services/auth.service';
import { SearchService, SearchResults, SearchResult } from '../../../services/search';
import { AppointmentService } from '../../../services/appointment.service';
import { AppointmentStatus } from '../../../models/appointment';
import { User } from '../../../models/auth';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header implements OnInit, OnDestroy {
  private themeService = inject(ThemeService);
  private authService = inject(AuthService);
  private searchService = inject(SearchService);
  private appointmentService = inject(AppointmentService);
  private router = inject(Router);
  private destroy$ = new Subject<void>();
  
  searchQuery = signal('');
  showProfileMenu = signal(false);
  showSearchResults = signal(false);
  currentUser = signal<User | null>(null);
  isLoggingOut = signal(false);
  showAppsMenu = signal(false);
  pendingRequestsCount = signal(0);
  searchResults = signal<SearchResults>({
    patients: [],
    medecins: [],
    dossiers: [],
    messages: [],
    total: 0
  });
  quickSuggestions = signal<SearchResult[]>([]);
  isSearching = signal(false);
  isAdmin = signal(false);
  userDisplayName = signal('Utilisateur');
  userEmail = signal('');
  userRole = signal('Utilisateur');
  searchPlaceholder = signal('Rechercher cours...');

  private searchSubject = new Subject<string>();

  // Applications disponibles
  applications = [
    {
      id: 'dashboard',
      name: 'Tableau de bord',
      description: 'Vue d\'ensemble et statistiques',
      icon: 'M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z',
      route: '/dashboard',
      color: '#3B82F6'
    },
    {
      id: 'patients',
      name: 'Patients',
      description: 'Gestion des patients',
      icon: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z',
      route: '/patients',
      color: '#10B981'
    },
    {
      id: 'medecins',
      name: 'Médecins',
      description: 'Validation et gestion des médecins',
      icon: 'M22 12h-4l-3 9L9 3l-3 9H2',
      route: '/medecins',
      color: '#F59E0B'
    },
    {
      id: 'dossiers',
      name: 'Dossiers Médicaux',
      description: 'Consultation des dossiers',
      icon: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8',
      route: '/dossiers',
      color: '#8B5CF6'
    },
    {
      id: 'messagerie',
      name: 'Messagerie',
      description: 'Communication avec les médecins',
      icon: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
      route: '/messagerie',
      color: '#EF4444'
    },
    {
      id: 'parametres',
      name: 'Paramètres',
      description: 'Configuration de l\'application',
      icon: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z',
      route: '/parametres',
      color: '#6B7280'
    }
  ];



  ngOnInit() {
    // Initialiser le thème
    this.themeService.initTheme();
    
    // Écouter les changements d'utilisateur
    this.authService.authState$
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        this.currentUser.set(state.user);
        
        // Update computed values
        const user = state.user;
        this.isAdmin.set(user?.role === 'ADMIN');
        this.userDisplayName.set(user ? `${user.firstName} ${user.lastName}` : 'Utilisateur');
        this.userEmail.set(user?.email || '');
        
        // Update user role display
        let roleDisplay = 'Utilisateur';
        if (user?.role === 'ADMIN') roleDisplay = 'Administrateur';
        else if (user?.role === 'TEACHER') roleDisplay = 'Enseignant';
        this.userRole.set(roleDisplay);
        
        // Update search placeholder
        this.searchPlaceholder.set(
          user?.role === 'ADMIN' 
            ? 'Rechercher enseignant, cours...' 
            : 'Rechercher cours...'
        );

        // Load pending requests count
        if (user) {
          this.loadPendingRequestsCount();
        }
      });
    
    // Configurer la recherche avec debounce
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => {
        this.isSearching.set(true);
        return this.searchService.globalSearch(query);
      }),
      takeUntil(this.destroy$)
    ).subscribe(results => {
      this.searchResults.set(results);
      this.isSearching.set(false);
      this.showSearchResults.set(true);
    });

    // Charger les suggestions rapides
    this.searchService.getQuickSuggestions().pipe(
      takeUntil(this.destroy$)
    ).subscribe(suggestions => {
      this.quickSuggestions.set(suggestions);
    });

    // Fermer les résultats de recherche quand on clique ailleurs
    document.addEventListener('click', this.handleDocumentClick.bind(this));
  }

  loadPendingRequestsCount() {
    this.appointmentService.getReceivedAppointments(AppointmentStatus.PENDING)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.pendingRequestsCount.set(response.data?.length || 0);
        },
        error: (error) => {
          console.error('❌ Erreur chargement demandes en attente:', error);
          this.pendingRequestsCount.set(0);
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    document.removeEventListener('click', this.handleDocumentClick.bind(this));
  }

  get isDarkMode() {
    return this.themeService.darkMode();
  }

  onSearch(event: Event): void {
    const target = event.target as HTMLInputElement;
    const query = target.value;
    this.searchQuery.set(query);
    
    if (query.trim().length >= 2) {
      this.searchSubject.next(query);
    } else {
      this.showSearchResults.set(false);
      this.searchResults.set({
        patients: [],
        medecins: [],
        dossiers: [],
        messages: [],
        total: 0
      });
    }
  }

  onSearchFocus(): void {
    if (this.searchQuery().trim().length >= 2) {
      this.showSearchResults.set(true);
    }
  }

  selectSearchResult(result: SearchResult): void {
    this.showSearchResults.set(false);
    this.searchQuery.set('');
    
    // Naviguer vers la page appropriée
    this.router.navigate([result.route]);
    
    // Optionnel : émettre un événement pour filtrer/sélectionner l'élément
    const event = new CustomEvent('searchResultSelected', { 
      detail: result 
    });
    window.dispatchEvent(event);
  }

  selectQuickSuggestion(suggestion: SearchResult): void {
    this.selectSearchResult(suggestion);
  }

  clearSearch(): void {
    this.searchQuery.set('');
    this.showSearchResults.set(false);
    this.searchResults.set({
      patients: [],
      medecins: [],
      dossiers: [],
      messages: [],
      total: 0
    });
  }

  private handleDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    const searchContainer = target.closest('.search-section');
    const appsContainer = target.closest('.apps-btn, .apps-dropdown');
    
    if (!searchContainer) {
      this.showSearchResults.set(false);
    }
    
    if (!appsContainer) {
      this.showAppsMenu.set(false);
    }
  }

  getResultIcon(type: string): string {
    switch (type) {
      case 'patient': return 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z';
      case 'medecin': return 'M22 12h-4l-3 9L9 3l-3 9H2';
      case 'dossier': return 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8';
      case 'message': return 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z';
      default: return 'M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0z';
    }
  }

  navigateToRequests(): void {
    this.router.navigate(['/reservations'], { 
      queryParams: { view: 'received-requests' } 
    });
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  toggleApps(): void {
    this.showAppsMenu.set(!this.showAppsMenu());
  }

  selectApp(app: any): void {
    this.showAppsMenu.set(false);
    this.router.navigate([app.route]);
  }

  toggleMobileMenu(): void {
    // Émettre un événement pour ouvrir/fermer la sidebar mobile
    const event = new CustomEvent('toggleMobileSidebar');
    window.dispatchEvent(event);
  }

  toggleProfileMenu(): void {
    this.showProfileMenu.set(!this.showProfileMenu());
  }

  logout(): void {
    this.isLoggingOut.set(true);
    this.showProfileMenu.set(false);
    
    this.authService.logout()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          console.log('✅ Déconnexion réussie');
          this.router.navigate(['/login']);
        },
        error: (error) => {
          console.error('❌ Erreur lors de la déconnexion:', error);
          // Rediriger quand même vers la page de connexion
          this.router.navigate(['/login']);
        },
        complete: () => {
          this.isLoggingOut.set(false);
        }
      });
  }
}
