import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { take } from 'rxjs';

@Component({
  selector: 'app-redirect',
  standalone: true,
  template: `
    <div style="display: flex; justify-content: center; align-items: center; height: 100vh; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
      <div style="text-align: center; color: white;">
        <div style="font-size: 48px; margin-bottom: 16px;">🔄</div>
        <h2>Redirection en cours...</h2>
        <p>Vérification de votre authentification</p>
      </div>
    </div>
  `
})
export class RedirectComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  ngOnInit(): void {
    console.log('🔄 RedirectComponent: Vérification de l\'authentification');
    
    this.authService.authState$.pipe(take(1)).subscribe(authState => {
      console.log('🔄 RedirectComponent: État d\'authentification:', authState);
      
      if (authState.isAuthenticated && authState.user?.role === 'ADMIN') {
        console.log('✅ RedirectComponent: Utilisateur connecté, redirection vers dashboard');
        this.router.navigate(['/dashboard']);
      } else {
        console.log('❌ RedirectComponent: Utilisateur non connecté, redirection vers login');
        this.router.navigate(['/login']);
      }
    });
  }
}