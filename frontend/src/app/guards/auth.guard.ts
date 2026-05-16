import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, take, tap } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { AuthState } from '../models/auth';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  console.log('🔒 AuthGuard: Vérification de l\'authentification pour:', state.url);

  return authService.authState$.pipe(
    take(1),
    tap((authState: AuthState) => {
      console.log('🔒 AuthGuard: État d\'authentification:', {
        isAuthenticated: authState.isAuthenticated,
        user: authState.user,
        role: authState.user?.role
      });
    }),
    map((authState: AuthState) => {
      if (authState.isAuthenticated && authState.user) {
        console.log('✅ AuthGuard: Accès autorisé');
        return true;
      }

      console.log('❌ AuthGuard: Accès refusé, redirection vers /login');
      // Rediriger vers la page de connexion
      router.navigate(['/login'], { 
        queryParams: { returnUrl: state.url } 
      });
      return false;
    })
  );
};

export const loginGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  console.log('🔓 LoginGuard: Vérification si déjà connecté');

  return authService.authState$.pipe(
    take(1),
    tap((authState: AuthState) => {
      console.log('🔓 LoginGuard: État d\'authentification:', {
        isAuthenticated: authState.isAuthenticated,
        user: authState.user
      });
    }),
    map((authState: AuthState) => {
      if (authState.isAuthenticated) {
        console.log('✅ LoginGuard: Déjà connecté, redirection vers /dashboard');
        // Déjà connecté, rediriger vers le dashboard
        router.navigate(['/dashboard']);
        return false;
      }
      console.log('✅ LoginGuard: Pas connecté, accès à la page de connexion autorisé');
      return true;
    })
  );
};