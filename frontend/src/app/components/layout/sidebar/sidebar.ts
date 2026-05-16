import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
  isActive?: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss'
})
export class SidebarComponent implements OnInit {
  currentUser: any = null;
  isAdmin = false;
  menuItems: MenuItem[] = [];
  
  // Informations utilisateur
  userInfo = {
    name: 'Utilisateur',
    email: 'user@iusjc.edu.cm'
  };

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // Récupérer les informations de l'utilisateur connecté
    this.authService.authState$.subscribe(authState => {
      if (authState.user) {
        this.currentUser = authState.user;
        this.isAdmin = authState.user.role === 'ADMIN';
        this.userInfo = {
          name: `${authState.user.firstName} ${authState.user.lastName}`,
          email: authState.user.email
        };
        
        // Update menu items based on role
        this.updateMenuItems();
      }
    });
  }

  private updateMenuItems(): void {
    // Menu simplifié pour l'admin: seulement Dashboard et Comptes
    if (this.isAdmin) {
      this.menuItems = [
        {
          label: 'Tableau de bord',
          icon: 'dashboard',
          route: '/dashboard'
        },
        {
          label: 'Comptes',
          icon: 'comptes',
          route: '/comptes'
        }
      ];
    } else {
      // Menu pour les utilisateurs non-admin
      this.menuItems = [
        {
          label: 'Tableau de bord',
          icon: 'dashboard',
          route: '/dashboard'
        },
        {
          label: 'Rendez-vous',
          icon: 'rendez-vous',
          route: '/rendez-vous'
        },
        {
          label: 'Disponibilités',
          icon: 'disponibilites',
          route: '/disponibilites'
        },
        {
          label: 'Demandes',
          icon: 'reservations',
          route: '/reservations'
        },
        {
          label: 'Paramètres',
          icon: 'parametres',
          route: '/parametres'
        }
      ];
    }
  }

  // Déconnexion
  logout(): void {
    console.log('🚪 Sidebar: Déconnexion en cours...');
    this.authService.logout().subscribe({
      next: () => {
        console.log('✅ Sidebar: Déconnexion réussie, redirection vers /login');
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('❌ Sidebar: Erreur lors de la déconnexion:', error);
        // Rediriger quand même vers la page de connexion
        this.router.navigate(['/login']);
      }
    });
  }
}