import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);

  loginForm: FormGroup;
  twoFactorForm: FormGroup;
  showPassword = false;
  isLoading = false;
  requiresVerification = false;
  pendingEmail: string | null = null;
  errorMessage = '';
  returnUrl = '';
  
  private destroy$ = new Subject<void>();

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });

    this.twoFactorForm = this.fb.group({
      code: ['', [Validators.required, Validators.pattern(/^\d{4}$/)]]
    });
  }

  ngOnInit(): void {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
    
    console.log('🔐 LoginComponent: Initialisation');
    
    // Écouter les changements d'état d'authentification
    this.authService.authState$
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        console.log('📊 LoginComponent: État d\'authentification:', state);
        this.isLoading = state.isLoading;
        this.requiresVerification = state.requiresVerification;
        this.pendingEmail = state.pendingEmail;
        
        console.log('🔍 LoginComponent: Variables locales mises à jour:', {
          requiresVerification: this.requiresVerification,
          pendingEmail: this.pendingEmail,
          isLoading: this.isLoading
        });
        
        // Forcer la détection de changement
        this.cdr.detectChanges();
        
        if (state.isAuthenticated) {
          console.log('✅ LoginComponent: Utilisateur authentifié, redirection vers', this.returnUrl);
          this.router.navigate([this.returnUrl]);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onLogin(): void {
    if (this.loginForm.valid) {
      this.errorMessage = '';
      console.log('🔐 LoginComponent: Tentative de connexion');
      
      this.authService.login(this.loginForm.value)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            console.log('📥 LoginComponent: Réponse de connexion:', response);
            if (!response.success) {
              this.errorMessage = response.error || response.message || 'Erreur de connexion';
            } else if (response.data?.requiresTwoFactor) {
              console.log('🔒 LoginComponent: Vérification 2FA requise');
            }
          },
          error: (error) => {
            console.error('❌ LoginComponent: Erreur de connexion:', error);
            this.errorMessage = error.error?.error || error.error?.message || 'Erreur de connexion';
          }
        });
    } else {
      this.markFormGroupTouched(this.loginForm);
    }
  }

  onVerifyTwoFactor(): void {
    if (this.twoFactorForm.valid && this.pendingEmail) {
      this.errorMessage = '';
      console.log('🔐 LoginComponent: Vérification du code 2FA');
      
      const request = {
        email: this.pendingEmail,
        code: this.twoFactorForm.value.code
      };

      this.authService.verifyTwoFactor(request)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            console.log('📥 LoginComponent: Réponse de vérification 2FA:', response);
            if (!response.success) {
              this.errorMessage = response.error || 'Code de vérification invalide';
            }
          },
          error: (error) => {
            console.error('❌ LoginComponent: Erreur de vérification 2FA:', error);
            this.errorMessage = error.error?.error || error.error?.message || 'Code de vérification invalide';
          }
        });
    } else {
      this.markFormGroupTouched(this.twoFactorForm);
    }
  }

  onResendCode(): void {
    if (this.pendingEmail) {
      console.log('📧 LoginComponent: Renvoi du code 2FA');
      this.authService.resendTwoFactorCode(this.pendingEmail)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            console.log('✅ LoginComponent: Code renvoyé avec succès');
            this.errorMessage = '';
          },
          error: (error) => {
            console.error('❌ LoginComponent: Erreur lors de l\'envoi du code:', error);
            this.errorMessage = 'Erreur lors de l\'envoi du code';
          }
        });
    }
  }

  onBackToLogin(): void {
    console.log('🔙 LoginComponent: Retour à la connexion');
    this.requiresVerification = false;
    this.pendingEmail = null;
    this.twoFactorForm.reset();
    this.errorMessage = '';
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  // Getters pour la validation des formulaires
  get email() { return this.loginForm.get('email'); }
  get password() { return this.loginForm.get('password'); }
  get code() { return this.twoFactorForm.get('code'); }
}