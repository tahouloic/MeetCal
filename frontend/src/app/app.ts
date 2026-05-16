import { Component, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { SidebarComponent } from './components/layout/sidebar/sidebar';
import { Header } from './components/layout/header/header';
import { ThemeService } from './services/theme.service';
import { AuthService } from './services/auth.service';
import { AuthState } from './models/auth';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, Header, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit, OnDestroy {
  protected readonly title = signal('Med Connect Admin');
  private themeService = inject(ThemeService);
  private authService = inject(AuthService);
  private destroy$ = new Subject<void>();

  // État d'authentification
  isAuthenticated = signal(false);
  authState = signal<AuthState | null>(null);

  ngOnInit() {
    // Initialiser le thème global au démarrage de l'application
    this.themeService.initTheme();

    // Écouter les changements d'état d'authentification
    this.authService.authState$
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        this.authState.set(state);
        this.isAuthenticated.set(state.isAuthenticated);
        console.log('🔐 App: État d\'authentification mis à jour:', {
          isAuthenticated: state.isAuthenticated,
          user: state.user?.email
        });
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
