import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-parametres',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './parametres.html',
  styleUrl: './parametres.scss'
})
export class ParametresComponent implements OnInit, OnDestroy {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private themeService = inject(ThemeService);
  private router = inject(Router);
  private readonly API_URL = environment.apiUrl;

  // Onglet actif
  activeTab: 'profil' | 'securite' | 'apparence' = 'profil';

  // Utilisateur actuel
  currentUser: any = null;
  isAdmin = false;

  // Formulaire de changement de mot de passe
  passwordForm = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  // États UI
  isChangingPassword = false;
  isLoggingOut = false;
  passwordError = '';
  passwordSuccess = '';
  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;

  // Validation du mot de passe
  passwordStrength = {
    hasMinLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false
  };

  get isDarkMode() {
    return this.themeService.darkMode();
  }

  ngOnInit(): void {
    this.authService.authState$.subscribe(state => {
      if (state.user) {
        this.currentUser = state.user;
        this.isAdmin = state.user.role === 'ADMIN';
      }
    });
  }

  ngOnDestroy(): void {
    // Nettoyage si nécessaire
  }

  switchTab(tab: 'profil' | 'securite' | 'apparence'): void {
    this.activeTab = tab;
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  // Validation du mot de passe en temps réel
  validatePassword(): void {
    const password = this.passwordForm.newPassword;
    
    this.passwordStrength = {
      hasMinLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
  }

  get isPasswordValid(): boolean {
    return Object.values(this.passwordStrength).every(v => v === true);
  }

  get passwordsMatch(): boolean {
    return this.passwordForm.newPassword === this.passwordForm.confirmPassword;
  }

  changePassword(): void {
    this.passwordError = '';
    this.passwordSuccess = '';

    // Validation
    if (!this.passwordForm.currentPassword) {
      this.passwordError = 'Veuillez entrer votre mot de passe actuel';
      return;
    }

    if (!this.passwordForm.newPassword) {
      this.passwordError = 'Veuillez entrer un nouveau mot de passe';
      return;
    }

    if (!this.isPasswordValid) {
      this.passwordError = 'Le mot de passe ne respecte pas les critères de sécurité';
      return;
    }

    if (!this.passwordsMatch) {
      this.passwordError = 'Les mots de passe ne correspondent pas';
      return;
    }

    if (this.passwordForm.currentPassword === this.passwordForm.newPassword) {
      this.passwordError = 'Le nouveau mot de passe doit être différent de l\'ancien';
      return;
    }

    this.isChangingPassword = true;

    const payload = {
      currentPassword: this.passwordForm.currentPassword,
      newPassword: this.passwordForm.newPassword
    };

    this.http.post(`${this.API_URL}/auth/change-password`, payload).subscribe({
      next: (response: any) => {
        this.passwordSuccess = 'Mot de passe modifié avec succès ! Déconnexion dans 3 secondes...';
        this.passwordForm = {
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        };
        this.passwordStrength = {
          hasMinLength: false,
          hasUpperCase: false,
          hasLowerCase: false,
          hasNumber: false,
          hasSpecialChar: false
        };
        this.isChangingPassword = false;
        
        // Déconnexion automatique après 3 secondes
        setTimeout(() => {
          this.isLoggingOut = true;
          console.log('🚪 Déconnexion en cours...');
          
          // Déconnecter via le service (nettoie localStorage, sessionStorage, et l'état)
          this.authService.logout().subscribe({
            next: () => {
              console.log('✅ Déconnexion réussie, redirection vers login');
              // Petit délai pour laisser le temps au service de nettoyer
              setTimeout(() => {
                this.router.navigate(['/login'], { replaceUrl: true });
              }, 100);
            },
            error: () => {
              console.log('⚠️ Erreur déconnexion, redirection quand même');
              // Même en cas d'erreur, rediriger vers login
              setTimeout(() => {
                this.router.navigate(['/login'], { replaceUrl: true });
              }, 100);
            }
          });
        }, 3000);
      },
      error: (error) => {
        console.error('Erreur changement mot de passe:', error);
        this.passwordError = error.error?.message || 'Erreur lors du changement de mot de passe';
        this.isChangingPassword = false;
      }
    });
  }

  togglePasswordVisibility(field: 'current' | 'new' | 'confirm'): void {
    switch (field) {
      case 'current':
        this.showCurrentPassword = !this.showCurrentPassword;
        break;
      case 'new':
        this.showNewPassword = !this.showNewPassword;
        break;
      case 'confirm':
        this.showConfirmPassword = !this.showConfirmPassword;
        break;
    }
  }
}