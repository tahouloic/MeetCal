/**
 * EXPLICATION :
 * Les paramètres permettent de configurer l'application.
 * 
 * Sections :
 * - Profil Admin
 * - Notifications
 * - Sécurité
 * - Apparence
 * - Système
 */

// Interface pour le profil admin
export interface AdminProfile {
    id: string;
    nom: string;
    prenom: string;
    email: string;
    telephone: string;
    role: string;
    avatar?: string;
    dateCreation: string;
}

// Interface pour les paramètres de notification
export interface NotificationSettings {
    emailNotifications: boolean;          // Notifications par email
    pushNotifications: boolean;            // Notifications push
    nouveauPatient: boolean;               // Nouveau patient inscrit
    nouveauMedecin: boolean;               // Nouveau médecin
    nouveauMessage: boolean;               // Nouveau message
    rendezVousProche: boolean;             // RDV proche (24h)
    rapportQuotidien: boolean;             // Rapport quotidien
    alertesSysteme: boolean;               // Alertes système
}

// Interface pour les paramètres de sécurité
export interface SecuritySettings {
    doubleAuthentification: boolean;      // 2FA activé
    sessionTimeout: number;                // Délai expiration session (minutes)
    historiqueConnexions: boolean;         // Garder historique
    verrouillageAutomatique: boolean;      // Verrouillage auto
    connexionsSimultanees: number;         // Nombre max connexions
    forcePasswordChange: boolean;          // Forcer changement mot de passe
}

// Interface pour les paramètres d'apparence
export interface AppearanceSettings {
    theme: 'light' | 'dark' | 'auto';     // Thème de l'interface
    langue: string;                        // Langue de l'interface
    fuseau: string;                        // Fuseau horaire
    formatDate: string;                    // Format de date
    compactMode: boolean;                  // Mode compact
    animations: boolean;                   // Animations activées
}

// Interface pour les paramètres système
export interface SystemSettings {
    backupAutomatique: boolean;            // Sauvegarde auto
    backupFrequence: 'daily' | 'weekly' | 'monthly';  // Fréquence backup
    maintenanceMode: boolean;              // Mode maintenance
    logsActive: boolean;                   // Logs activés
    analyticsActive: boolean;              // Analytics activé
    versionApp: string;                    // Version de l'app
}

// Interface globale pour tous les paramètres
export interface AppSettings {
    notifications: NotificationSettings;
    security: SecuritySettings;
    appearance: AppearanceSettings;
    system: SystemSettings;
}

// Options pour les langues
export const LANGUES = [
    { code: 'fr', label: 'Français' },
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Español' }
];

// Options pour les fuseaux horaires
export const FUSEAUX_HORAIRES = [
    { value: 'Africa/Douala', label: 'Afrique/Douala (GMT+1)' },
    { value: 'Europe/Paris', label: 'Europe/Paris (GMT+1)' },
    { value: 'America/New_York', label: 'America/New York (GMT-5)' }
];

// Options pour les formats de date
export const FORMATS_DATE = [
    { value: 'DD/MM/YYYY', label: 'JJ/MM/AAAA (25/12/2024)' },
    { value: 'MM/DD/YYYY', label: 'MM/JJ/AAAA (12/25/2024)' },
    { value: 'YYYY-MM-DD', label: 'AAAA-MM-JJ (2024-12-25)' }
];