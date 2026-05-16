/**
 * EXPLICATION :
 * Un dossier médical relie un PATIENT et un MÉDECIN.
 * Il contient l'historique des consultations, diagnostics, prescriptions.
 * 
 * Relations :
 * - 1 Patient peut avoir plusieurs dossiers
 * - 1 Médecin peut gérer plusieurs dossiers
 * - 1 Dossier = 1 Patient + 1 Médecin + Consultations
 */

// Interface principale pour un Dossier Médical
export interface DossierMedical {
    id: string;                      // Identifiant unique (ex: "D001")
    patientId: string;               // ID du patient lié
    patientNom: string;              // Nom du patient (pour affichage rapide)
    patientPrenom: string;           // Prénom du patient
    medecinId: string;               // ID du médecin responsable
    medecinNom: string;              // Nom du médecin
    medecinPrenom: string;           // Prénom du médecin
    dateCreation: string;            // Date de création du dossier
    dateModification: string;        // Dernière modification
    statut: 'ouvert' | 'fermé' | 'archivé';  // État du dossier
    consultations: Consultation[];   // Liste des consultations
    diagnosticPrincipal?: string;    // Diagnostic principal actuel
    allergies?: string[];            // Liste des allergies du patient
    antecedentsMedicaux?: string[];  // Antécédents médicaux
    groupeSanguin?: string;          // Groupe sanguin
    nombreConsultations: number;     // Compteur de consultations
}

// Interface pour une Consultation
export interface Consultation {
    id: string;                      // ID de la consultation
    date: string;                    // Date de la consultation
    motif: string;                   // Motif de consultation
    diagnostic: string;              // Diagnostic posé
    prescription?: string;           // Prescription médicale
    notes?: string;                  // Notes du médecin
    examens?: string[];              // Examens demandés
    documentAttache?: string;        // URL du document (ordonnance, résultat)
}

// Interface pour le formulaire de création/modification de dossier
export interface DossierForm {
    patientId: string;
    medecinId: string;
    diagnosticPrincipal?: string;
    allergies?: string[];
    antecedentsMedicaux?: string[];
    groupeSanguin?: string;
}

// Interface pour le formulaire de consultation
export interface ConsultationForm {
    dossierId: string;
    motif: string;
    diagnostic: string;
    prescription?: string;
    notes?: string;
    examens?: string[];
}

// Options pour le groupe sanguin
export const GROUPES_SANGUINS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

// Statuts possibles
export const STATUTS_DOSSIER = ['ouvert', 'fermé', 'archivé'] as const;