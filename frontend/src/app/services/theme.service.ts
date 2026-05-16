import { Injectable, signal, effect } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private isDarkMode = signal(false);

  constructor() {
    // Vérifier le thème sauvegardé ou la préférence système
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      this.setDarkMode(true);
    }

    // Écouter les changements de préférence système
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem('theme')) {
        this.setDarkMode(e.matches);
      }
    });
  }

  get darkMode() {
    return this.isDarkMode;
  }

  toggleTheme(): void {
    this.setDarkMode(!this.isDarkMode());
  }

  setDarkMode(isDark: boolean): void {
    this.isDarkMode.set(isDark);
    
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }

    // Émettre un événement pour notifier les autres composants
    window.dispatchEvent(new CustomEvent('themeChanged', { 
      detail: { isDark } 
    }));
  }

  // Méthode pour initialiser le thème au démarrage de l'app
  initTheme(): void {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      this.setDarkMode(true);
    }
  }
}