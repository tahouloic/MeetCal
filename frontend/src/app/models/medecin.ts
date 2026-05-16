/**
 * EXPLICATION : 
 * Ce fichier définit la structure des données pour un médecin.
 * C'est le "MODEL" dans l'architecture MVC.
 * 
 * Les interfaces TypeScript permettent de typer nos données
 * et éviter les erreurs lors du développement.
 */

// Interface principale pour un Médecin
export interface Medecin {
    id: string;                    // Identifiant unique (ex: "M001")
    nom: string;                   // Nom de famille
    prenom: string;                // Prénom
    specialite: string;            // Spécialité médicale
    telephone: string;             // Numéro de téléphone
    email: string;                 // Adresse email
    dateNaissance: string;         // Date de naissance (format: YYYY-MM-DD)
    numeroOrdre: string;           // Numéro d'ordre du médecin
    adresse: string;               // Adresse complète
    dateInscription: string;       // Date d'inscription sur la plateforme
    statut: 'actif' | 'inactif' | 'en attente' | 'suspendu';  // Statut du compte
    verified: boolean;             // Compte vérifié ou non
    experience: number;            // Années d'expérience
}

// Interface pour le formulaire d'ajout/modification
// Elle est similaire à Medecin mais sans les champs auto-générés (id, dateInscription)
export interface MedecinForm {
    nom: string;
    prenom: string;
    specialite: string;
    telephone: string;
    email: string;
    numeroOrdre: string;
    // Champs optionnels (non requis dans le formulaire)
    dateNaissance?: string;
    adresse?: string;
    experience?: number;
}

// Liste des spécialités médicales disponibles
export const SPECIALITES = [
    'Cardiologie',
    'Dermatologie',
    'Gastro-entérologie',
    'Gynécologie',
    'Neurologie',
    'Ophtalmologie',
    'Pédiatrie',
    'Psychiatrie',
    'Radiologie',
    'Chirurgie générale',
    'Médecine générale',
    'Orthopédie',
    'ORL',
    'Urologie'
];