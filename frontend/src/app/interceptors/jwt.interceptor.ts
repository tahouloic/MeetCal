import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, switchMap, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.accessToken;

  console.log('🔐 JwtInterceptor: Requête vers', req.url);
  console.log('🔑 JwtInterceptor: Token disponible:', !!token);

  // Ne pas ajouter le token pour les endpoints publics
  const publicEndpoints = ['/auth/login', '/auth/register', '/auth/verify-2fa', '/health'];
  const isPublicEndpoint = publicEndpoints.some(endpoint => req.url.includes(endpoint));

  if (isPublicEndpoint) {
    console.log('🌐 JwtInterceptor: Endpoint public, pas de token ajouté');
    return next(req);
  }

  // Ajouter le token si disponible
  if (token) {
    console.log('✅ JwtInterceptor: Ajout du token Bearer');
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  } else {
    console.log('⚠️ JwtInterceptor: Pas de token disponible');
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      console.error('❌ JwtInterceptor: Erreur HTTP:', error.status, error.message);
      
      // Si erreur 401 (Unauthorized), essayer de rafraîchir le token
      if (error.status === 401 && !req.url.includes('/auth/refresh')) {
        console.log('🔄 JwtInterceptor: Token expiré, tentative de rafraîchissement');
        
        return authService.refreshToken().pipe(
          switchMap(() => {
            // Réessayer la requête avec le nouveau token
            const newToken = authService.accessToken;
            if (newToken) {
              console.log('✅ JwtInterceptor: Token rafraîchi, nouvelle tentative');
              const clonedReq = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${newToken}`
                }
              });
              return next(clonedReq);
            }
            return throwError(() => error);
          }),
          catchError(refreshError => {
            console.error('❌ JwtInterceptor: Échec du rafraîchissement, déconnexion');
            authService.logout().subscribe();
            return throwError(() => refreshError);
          })
        );
      }

      return throwError(() => error);
    })
  );
};
