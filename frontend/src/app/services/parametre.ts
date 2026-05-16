/**
 * EXPLICATION :
 * Ce service gère tous les paramètres de l'application.
 * 
 * Fonctionnalités :
 * - Chargement/sauvegarde des paramètres
 * - Mise à jour en temps réel
 * - Profil admin
 * - Configuration système
 * 
 * En production, ces données seraient sauvegardées en base de données
 * et dans localStorage pour persistance côté client.
 */

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  AdminProfile,
  AppSettings,
  NotificationSettings,
  SecuritySettings,
  AppearanceSettings,
  SystemSettings
} from '../models/parametre';

@Injectable({
  providedIn: 'root'
})
export class ParametreService {

  /**
   * Profil de l'administrateur connecté
   */
  private adminProfile$: BehaviorSubject<AdminProfile> = new BehaviorSubject<AdminProfile>({
    id: 'ADMIN001',
    nom: 'Administrateur',
    prenom: 'Med-Connect',
    email: 'admin@medconnect.com',
    telephone: '+237 6 90 00 00 00',
    role: 'Super Admin',
    dateCreation: '2024-01-01'
  });

  /**
   * Paramètres de notifications
   */
  private notificationSettings$: BehaviorSubject<NotificationSettings> =
    new BehaviorSubject<NotificationSettings>({
      emailNotifications: true,
      pushNotifications: true,
      nouveauPatient: true,
      nouveauMedecin: true,
      nouveauMessage: true,
      rendezVousProche: true,
      rapportQuotidien: false,
      alertesSysteme: true
    });

  /**
   * Paramètres de sécurité
   */
  private securitySettings$: BehaviorSubject<SecuritySettings> =
    new BehaviorSubject<SecuritySettings>({
      doubleAuthentification: false,
      sessionTimeout: 30,
      historiqueConnexions: true,
      verrouillageAutomatique: true,
      connexionsSimultanees: 3,
      forcePasswordChange: false
    });

  /**
   * Paramètres d'apparence
   */
  private appearanceSettings$: BehaviorSubject<AppearanceSettings> =
    new BehaviorSubject<AppearanceSettings>({
      theme: 'light',
      langue: 'fr',
      fuseau: 'Africa/Douala',
      formatDate: 'DD/MM/YYYY',
      compactMode: false,
      animations: true
    });

  /**
   * Paramètres système
   */
  private systemSettings$: BehaviorSubject<SystemSettings> =
    new BehaviorSubject<SystemSettings>({
      backupAutomatique: true,
      backupFrequence: 'daily',
      maintenanceMode: false,
      logsActive: true,
      analyticsActive: true,
      versionApp: '1.0.0'
    });

  constructor() {
    // Charger depuis localStorage si disponible
    this.loadFromLocalStorage();
  }

  // ========== PROFIL ADMIN ==========

  getAdminProfile(): Observable<AdminProfile> {
    return this.adminProfile$.asObservable();
  }

  updateAdminProfile(profile: Partial<AdminProfile>): void {
    const current = this.adminProfile$.value;
    const updated = { ...current, ...profile };
    this.adminProfile$.next(updated);
    this.saveToLocalStorage('adminProfile', updated);
  }

  // ========== NOTIFICATIONS ==========

  getNotificationSettings(): Observable<NotificationSettings> {
    return this.notificationSettings$.asObservable();
  }

  updateNotificationSettings(settings: Partial<NotificationSettings>): void {
    const current = this.notificationSettings$.value;
    const updated = { ...current, ...settings };
    this.notificationSettings$.next(updated);
    this.saveToLocalStorage('notificationSettings', updated);
  }

  // ========== SÉCURITÉ ==========

  getSecuritySettings(): Observable<SecuritySettings> {
    return this.securitySettings$.asObservable();
  }

  updateSecuritySettings(settings: Partial<SecuritySettings>): void {
    const current = this.securitySettings$.value;
    const updated = { ...current, ...settings };
    this.securitySettings$.next(updated);
    this.saveToLocalStorage('securitySettings', updated);
  }

  // ========== APPARENCE ==========

  getAppearanceSettings(): Observable<AppearanceSettings> {
    return this.appearanceSettings$.asObservable();
  }

  updateAppearanceSettings(settings: Partial<AppearanceSettings>): void {
    const current = this.appearanceSettings$.value;
    const updated = { ...current, ...settings };
    this.appearanceSettings$.next(updated);
    this.saveToLocalStorage('appearanceSettings', updated);

    // Appliquer le thème immédiatement
    if (settings.theme) {
      this.applyTheme(settings.theme);
    }
  }

  // ========== SYSTÈME ==========

  getSystemSettings(): Observable<SystemSettings> {
    return this.systemSettings$.asObservable();
  }

  updateSystemSettings(settings: Partial<SystemSettings>): void {
    const current = this.systemSettings$.value;
    const updated = { ...current, ...settings };
    this.systemSettings$.next(updated);
    this.saveToLocalStorage('systemSettings', updated);
  }

  // ========== TOUS LES PARAMÈTRES ==========

  getAllSettings(): Observable<AppSettings> {
    return new BehaviorSubject<AppSettings>({
      notifications: this.notificationSettings$.value,
      security: this.securitySettings$.value,
      appearance: this.appearanceSettings$.value,
      system: this.systemSettings$.value
    }).asObservable();
  }

  // ========== ACTIONS SPÉCIFIQUES ==========

  /**
   * Change le mot de passe admin
   */
  changePassword(oldPassword: string, newPassword: string): Observable<boolean> {
    // Simulation - En production, appel API
    return new BehaviorSubject<boolean>(true).asObservable();
  }

  /**
   * Active/Désactive le mode maintenance
   */
  toggleMaintenanceMode(active: boolean): void {
    this.updateSystemSettings({ maintenanceMode: active });
  }

  /**
   * Lance une sauvegarde manuelle
   */
  triggerBackup(): Observable<boolean> {
    console.log('🔄 Sauvegarde en cours...');
    // Simulation - En production, appel API
    return new BehaviorSubject<boolean>(true).asObservable();
  }

  /**
   * Réinitialise tous les paramètres par défaut
   */
  resetToDefaults(): void {
    const confirmation = confirm('Réinitialiser tous les paramètres ? Cette action est irréversible.');

    if (confirmation) {
      // Réinitialiser notifications
      this.notificationSettings$.next({
        emailNotifications: true,
        pushNotifications: true,
        nouveauPatient: true,
        nouveauMedecin: true,
        nouveauMessage: true,
        rendezVousProche: true,
        rapportQuotidien: false,
        alertesSysteme: true
      });

      // Réinitialiser sécurité
      this.securitySettings$.next({
        doubleAuthentification: false,
        sessionTimeout: 30,
        historiqueConnexions: true,
        verrouillageAutomatique: true,
        connexionsSimultanees: 3,
        forcePasswordChange: false
      });

      // Réinitialiser apparence
      this.appearanceSettings$.next({
        theme: 'light',
        langue: 'fr',
        fuseau: 'Africa/Douala',
        formatDate: 'DD/MM/YYYY',
        compactMode: false,
        animations: true
      });

      // Nettoyer localStorage
      localStorage.removeItem('medconnect_settings');

      alert('Paramètres réinitialisés avec succès !');
    }
  }

  /**
   * Exporte les paramètres en JSON
   */
  exportSettings(): void {
    const settings = {
      notifications: this.notificationSettings$.value,
      security: this.securitySettings$.value,
      appearance: this.appearanceSettings$.value,
      system: this.systemSettings$.value
    };

    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `medconnect-settings-${new Date().toISOString()}.json`;
    link.click();

    URL.revokeObjectURL(url);
  }

  // ========== PERSISTANCE LOCALE ==========

  /**
   * Sauvegarde dans localStorage
   */
  private saveToLocalStorage(key: string, value: any): void {
    try {
      const allSettings = JSON.parse(localStorage.getItem('medconnect_settings') || '{}');
      allSettings[key] = value;
      localStorage.setItem('medconnect_settings', JSON.stringify(allSettings));
    } catch (error) {
      console.error('Erreur sauvegarde localStorage:', error);
    }
  }

  /**
   * Charge depuis localStorage
   */
  private loadFromLocalStorage(): void {
    try {
      const stored = localStorage.getItem('medconnect_settings');
      if (stored) {
        const settings = JSON.parse(stored);

        if (settings.adminProfile) {
          this.adminProfile$.next(settings.adminProfile);
        }
        if (settings.notificationSettings) {
          this.notificationSettings$.next(settings.notificationSettings);
        }
        if (settings.securitySettings) {
          this.securitySettings$.next(settings.securitySettings);
        }
        if (settings.appearanceSettings) {
          this.appearanceSettings$.next(settings.appearanceSettings);
        }
        if (settings.systemSettings) {
          this.systemSettings$.next(settings.systemSettings);
        }
      }
    } catch (error) {
      console.error('Erreur chargement localStorage:', error);
    }
  }

  /**
   * Applique le thème sélectionné
   */
  private applyTheme(theme: 'light' | 'dark' | 'auto'): void {
    // En production, ajouter/retirer une classe sur <body>
    // ou charger un fichier CSS différent

    if (theme === 'dark') {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }

  /**
   * Obtient les statistiques d'utilisation
   */
  getUsageStats(): Observable<any> {
    return new BehaviorSubject({
      storageUsed: '45 MB',
      storageTotal: '1 GB',
      lastBackup: '2024-12-02 08:30',
      activeUsers: 12,
      uptime: '99.9%'
    }).asObservable();
  }
}