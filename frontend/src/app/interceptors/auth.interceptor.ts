import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  
  // Récupérer le token d'accès
  const accessToken = authService.accessToken;
  
  // Si nous avons un token et que la requête va vers notre API
  if (accessToken && req.url.includes('localhost:5000/api')) {
    // Cloner la requête et ajouter l'en-tête Authorization
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    
    console.log('🔐 Intercepteur: Token ajouté à la requête', req.url);
    
    return next(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        // Si erreur 401 (token expiré), essayer de rafraîchir le token
        if (error.status === 401 && !req.url.includes('/auth/login') && !req.url.includes('/auth/refresh')) {
          console.log('🔄 Intercepteur: Token expiré, tentative de refresh');
          
          return authService.refreshToken().pipe(
            switchMap(() => {
              // Retry la requête avec le nouveau token
              const newToken = authService.accessToken;
              const retryReq = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${newToken}`
                }
              });
              console.log('🔄 Intercepteur: Retry avec nouveau token');
              return next(retryReq);
            }),
            catchError((refreshError) => {
              // Si le refresh échoue, déconnecter l'utilisateur
              console.log('❌ Intercepteur: Refresh échoué, déconnexion');
              authService.logout().subscribe();
              return throwError(() => refreshError);
            })
          );
        }
        
        return throwError(() => error);
      })
    );
  }
  
  // Sinon, passer la requête sans modification
  return next(req);
};