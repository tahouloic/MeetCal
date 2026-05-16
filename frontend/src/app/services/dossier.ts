
/**
 * EXPLICATION :
 * Ce service gère toute la logique pour les dossiers médicaux.
 * 
 * Particularité : Il doit gérer les RELATIONS entre :
 * - Patients
 * - Médecins
 * - Consultations
 * 
 * On utilise BehaviorSubject pour la programmation réactive.
 */

import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest, map } from 'rxjs';
import { DossierMedical, DossierForm, Consultation, ConsultationForm } from '../models/dossier';
import { PatientService } from './patient';
import { MedecinService } from './medecin';

@Injectable({
  providedIn: 'root'
})
export class DossierService {
  // Injection des services Patient et Médecin
  private patientService = inject(PatientService);
  private medecinService = inject(MedecinService);

  /**
   * BehaviorSubject pour stocker tous les dossiers médicaux
   * Programmation réactive (CHAP 3)
   */
  private dossiers$: BehaviorSubject<DossierMedical[]> = new BehaviorSubject<DossierMedical[]>([
    {
      id: 'D001',
      patientId: 'P001',
      patientNom: 'Dubois',
      patientPrenom: 'Marie',
      medecinId: 'M001',
      medecinNom: 'Martin',
      medecinPrenom: 'Jean',
      dateCreation: '2024-01-15',
      dateModification: '2024-11-20',
      statut: 'ouvert',
      diagnosticPrincipal: 'Hypertension artérielle',
      allergies: ['Pénicilline', 'Pollen'],
      antecedentsMedicaux: ['Diabète type 2', 'Asthme'],
      groupeSanguin: 'A+',
      nombreConsultations: 5,
      consultations: [
        {
          id: 'C001',
          date: '2024-11-20',
          motif: 'Contrôle tension artérielle',
          diagnostic: 'Hypertension contrôlée',
          prescription: 'Amlodipine 5mg - 1 comprimé/jour',
          notes: 'Patient stable, continuer le traitement',
          examens: ['Prise de tension', 'ECG']
        },
        {
          id: 'C002',
          date: '2024-10-15',
          motif: 'Douleurs thoraciques',
          diagnostic: 'Stress, pas de problème cardiaque',
          prescription: 'Repos recommandé',
          notes: 'Rassurer le patient',
          examens: ['Radiographie thorax']
        }
      ]
    },
    {
      id: 'D002',
      patientId: 'P002',
      patientNom: 'Martin',
      patientPrenom: 'Jean',
      medecinId: 'M002',
      medecinNom: 'Laurent',
      medecinPrenom: 'Sophie',
      dateCreation: '2024-02-20',
      dateModification: '2024-11-25',
      statut: 'ouvert',
      diagnosticPrincipal: 'Suivi pédiatrique',
      allergies: [],
      antecedentsMedicaux: ['Aucun'],
      groupeSanguin: 'O+',
      nombreConsultations: 3,
      consultations: [
        {
          id: 'C003',
          date: '2024-11-25',
          motif: 'Vaccination routine',
          diagnostic: 'Enfant en bonne santé',
          prescription: 'Vaccin DTCoq',
          notes: 'Prochaine vaccination dans 6 mois'
        }
      ]
    },
    {
      id: 'D003',
      patientId: 'P003',
      patientNom: 'Laurent',
      patientPrenom: 'Sophie',
      medecinId: 'M003',
      medecinNom: 'Dubois',
      medecinPrenom: 'Pierre',
      dateCreation: '2024-03-10',
      dateModification: '2024-11-28',
      statut: 'ouvert',
      diagnosticPrincipal: 'Eczéma chronique',
      allergies: ['Nickel'],
      antecedentsMedicaux: ['Dermatite atopique'],
      groupeSanguin: 'B+',
      nombreConsultations: 7,
      consultations: [
        {
          id: 'C004',
          date: '2024-11-28',
          motif: 'Poussée d\'eczéma',
          diagnostic: 'Eczéma en phase active',
          prescription: 'Crème corticoïde - Application 2x/jour',
          notes: 'Éviter les irritants, revoir dans 2 semaines'
        }
      ]
    }
  ]);

  constructor() { }

  /**
   * Récupère tous les dossiers médicaux
   */
  getDossiers(): Observable<DossierMedical[]> {
    return this.dossiers$.asObservable();
  }

  /**
   * Récupère un dossier par son ID
   */
  getDossierById(id: string): DossierMedical | undefined {
    return this.dossiers$.value.find(d => d.id === id);
  }

  /**
   * Récupère les dossiers d'un patient spécifique
   */
  getDossiersByPatient(patientId: string): Observable<DossierMedical[]> {
    return this.dossiers$.pipe(
      map(dossiers => dossiers.filter(d => d.patientId === patientId))
    );
  }

  /**
   * Récupère les dossiers gérés par un médecin
   */
  getDossiersByMedecin(medecinId: string): Observable<DossierMedical[]> {
    return this.dossiers$.pipe(
      map(dossiers => dossiers.filter(d => d.medecinId === medecinId))
    );
  }

  /**
   * Ajoute un nouveau dossier médical
   * 
   * IMPORTANT : Récupère les infos du patient et du médecin
   * pour les stocker dans le dossier (dénormalisation)
   */
  addDossier(dossierForm: DossierForm): void {
    // Récupère les infos du patient
    const patient = this.patientService.getPatientById(dossierForm.patientId);
    // Récupère les infos du médecin
    const medecin = this.medecinService.getMedecinById(dossierForm.medecinId);

    if (!patient || !medecin) {
      alert('Patient ou Médecin introuvable !');
      return;
    }

    const newDossier: DossierMedical = {
      id: this.generateId(),
      patientId: patient.id,
      patientNom: patient.nom,
      patientPrenom: patient.prenom,
      medecinId: medecin.id,
      medecinNom: medecin.nom,
      medecinPrenom: medecin.prenom,
      dateCreation: new Date().toISOString().split('T')[0],
      dateModification: new Date().toISOString().split('T')[0],
      statut: 'ouvert',
      diagnosticPrincipal: dossierForm.diagnosticPrincipal,
      allergies: dossierForm.allergies || [],
      antecedentsMedicaux: dossierForm.antecedentsMedicaux || [],
      groupeSanguin: dossierForm.groupeSanguin,
      nombreConsultations: 0,
      consultations: []
    };

    const currentDossiers = this.dossiers$.value;
    this.dossiers$.next([newDossier, ...currentDossiers]);
  }

  /**
   * Met à jour un dossier existant
   */
  updateDossier(id: string, updatedData: Partial<DossierMedical>): void {
    const currentDossiers = this.dossiers$.value;
    const index = currentDossiers.findIndex(d => d.id === id);

    if (index !== -1) {
      currentDossiers[index] = {
        ...currentDossiers[index],
        ...updatedData,
        dateModification: new Date().toISOString().split('T')[0]
      };
      this.dossiers$.next([...currentDossiers]);
    }
  }

  /**
   * Supprime un dossier
   */
  deleteDossier(id: string): void {
    const currentDossiers = this.dossiers$.value;
    this.dossiers$.next(currentDossiers.filter(d => d.id !== id));
  }

  /**
   * Change le statut d'un dossier
   */
  changeStatut(id: string, newStatut: 'ouvert' | 'fermé' | 'archivé'): void {
    this.updateDossier(id, { statut: newStatut });
  }

  /**
   * Ajoute une consultation à un dossier
   * 
   * IMPORTANT : Incrémente le compteur de consultations
   */
  addConsultation(consultationForm: ConsultationForm): void {
    const dossier = this.getDossierById(consultationForm.dossierId);

    if (!dossier) {
      alert('Dossier introuvable !');
      return;
    }

    const newConsultation: Consultation = {
      id: this.generateConsultationId(dossier.consultations.length),
      date: new Date().toISOString().split('T')[0],
      motif: consultationForm.motif,
      diagnostic: consultationForm.diagnostic,
      prescription: consultationForm.prescription,
      notes: consultationForm.notes,
      examens: consultationForm.examens || []
    };

    // Ajoute la consultation et incrémente le compteur
    this.updateDossier(dossier.id, {
      consultations: [newConsultation, ...dossier.consultations],
      nombreConsultations: dossier.nombreConsultations + 1
    });
  }

  /**
   * Recherche de dossiers par nom de patient ou médecin
   */
  searchDossiers(query: string): Observable<DossierMedical[]> {
    const filtered = this.dossiers$.value.filter(dossier => {
      const searchTerm = query.toLowerCase();
      return (
        dossier.patientNom.toLowerCase().includes(searchTerm) ||
        dossier.patientPrenom.toLowerCase().includes(searchTerm) ||
        dossier.medecinNom.toLowerCase().includes(searchTerm) ||
        dossier.medecinPrenom.toLowerCase().includes(searchTerm) ||
        dossier.diagnosticPrincipal?.toLowerCase().includes(searchTerm)
      );
    });

    return new BehaviorSubject(filtered).asObservable();
  }

  /**
   * Filtre par statut
   */
  filterByStatut(statut: string): Observable<DossierMedical[]> {
    if (!statut) return this.getDossiers();

    return this.dossiers$.pipe(
      map(dossiers => dossiers.filter(d => d.statut === statut))
    );
  }

  /**
   * Génère un ID unique pour un dossier
   */
  private generateId(): string {
    const dossiers = this.dossiers$.value;
    if (dossiers.length === 0) return 'D001';

    const lastId = dossiers[0].id;
    const lastNumber = parseInt(lastId.substring(1));
    const newNumber = lastNumber + 1;

    return `D${newNumber.toString().padStart(3, '0')}`;
  }

  /**
   * Génère un ID unique pour une consultation
   */
  private generateConsultationId(count: number): string {
    const newNumber = count + 1;
    return `C${newNumber.toString().padStart(3, '0')}`;
  }

  /**
   * Statistiques des dossiers
   */
  getStatistics(): Observable<any> {
    return this.dossiers$.pipe(
      map(dossiers => ({
        total: dossiers.length,
        ouverts: dossiers.filter(d => d.statut === 'ouvert').length,
        fermes: dossiers.filter(d => d.statut === 'fermé').length,
        archives: dossiers.filter(d => d.statut === 'archivé').length,
        totalConsultations: dossiers.reduce((sum, d) => sum + d.nombreConsultations, 0)
      }))
    );
  }
}