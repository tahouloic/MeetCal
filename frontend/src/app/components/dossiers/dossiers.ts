/**
 * EXPLICATION :
 * Ce composant gère l'affichage et les actions sur les dossiers médicaux.
 * 
 * Particularités :
 * - Gère 3 services : DossierService, PatientService, MedecinService
 * - 2 modals : Création dossier + Ajout consultation
 * - Affichage détaillé d'un dossier avec historique consultations
 */

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { DossierService } from '../../services/dossier';
import { PatientService } from '../../services/patient';
import { MedecinService } from '../../services/medecin';
import { ThemeService } from '../../services/theme.service';
import {
  DossierMedical,
  DossierForm,
  ConsultationForm,
  GROUPES_SANGUINS
} from '../../models/dossier';
import { Patient } from '../../models/patient';
import { Medecin } from '../../models/medecin';

@Component({
  selector: 'app-dossiers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dossiers.html',
  styleUrl: './dossiers.scss'
})
export class DossiersComponent implements OnInit {
  // Injection des services
  private dossierService = inject(DossierService);
  private patientService = inject(PatientService);
  private medecinService = inject(MedecinService);
  private themeService = inject(ThemeService);

  // Observables pour les données
  dossiers$!: Observable<DossierMedical[]>;
  patients$!: Observable<Patient[]>;
  medecins$!: Observable<Medecin[]>;
  statistics$!: Observable<any>;

  // État de l'interface
  showDossierForm: boolean = false;
  showConsultationForm: boolean = false;
  showDetailModal: boolean = false;
  selectedDossier: DossierMedical | null = null;

  // Formulaires
  dossierForm: DossierForm = this.getEmptyDossierForm();
  consultationForm: ConsultationForm = this.getEmptyConsultationForm();

  // Filtres et recherche
  searchQuery: string = '';
  selectedStatut: string = '';

  // Données auxiliaires
  groupesSanguins = GROUPES_SANGUINS;
  newAllergie: string = '';
  newAntecedent: string = '';

  // Accès au service de thème
  get isDarkMode() {
    return this.themeService.darkMode;
  }

  ngOnInit(): void {
    this.loadData();
  }

  /**
   * Charge toutes les données nécessaires
   */
  loadData(): void {
    this.loadDossiers();
    this.patients$ = this.patientService.getPatients();
    this.medecins$ = this.medecinService.getMedecins();
    this.statistics$ = this.dossierService.getStatistics();
  }

  /**
   * Charge les dossiers avec filtres
   */
  loadDossiers(): void {
    if (this.searchQuery.trim()) {
      this.dossiers$ = this.dossierService.searchDossiers(this.searchQuery);
    } else if (this.selectedStatut) {
      this.dossiers$ = this.dossierService.filterByStatut(this.selectedStatut);
    } else {
      this.dossiers$ = this.dossierService.getDossiers();
    }
  }

  /**
   * Recherche
   */
  onSearch(): void {
    this.loadDossiers();
  }

  /**
   * Filtre par statut
   */
  onFilterByStatut(): void {
    this.loadDossiers();
  }

  /**
   * Réinitialise les filtres
   */
  resetFilters(): void {
    this.searchQuery = '';
    this.selectedStatut = '';
    this.loadDossiers();
  }

  // ========== GESTION DES DOSSIERS ==========

  /**
   * Ouvre le formulaire de création de dossier
   */
  openDossierForm(): void {
    this.showDossierForm = true;
    this.dossierForm = this.getEmptyDossierForm();
  }

  /**
   * Ferme le formulaire de dossier
   */
  closeDossierForm(): void {
    this.showDossierForm = false;
    this.dossierForm = this.getEmptyDossierForm();
  }

  /**
   * Soumet le formulaire de création de dossier
   */
  onSubmitDossier(): void {
    if (!this.validateDossierForm()) {
      alert('Veuillez sélectionner un patient et un médecin');
      return;
    }

    this.dossierService.addDossier(this.dossierForm);
    alert('Dossier médical créé avec succès !');
    this.closeDossierForm();
    this.loadDossiers();
  }

  /**
   * Ajoute une allergie au formulaire
   */
  addAllergie(): void {
    if (this.newAllergie.trim()) {
      if (!this.dossierForm.allergies) {
        this.dossierForm.allergies = [];
      }
      this.dossierForm.allergies.push(this.newAllergie.trim());
      this.newAllergie = '';
    }
  }

  /**
   * Retire une allergie
   */
  removeAllergie(index: number): void {
    this.dossierForm.allergies?.splice(index, 1);
  }

  /**
   * Ajoute un antécédent médical
   */
  addAntecedent(): void {
    if (this.newAntecedent.trim()) {
      if (!this.dossierForm.antecedentsMedicaux) {
        this.dossierForm.antecedentsMedicaux = [];
      }
      this.dossierForm.antecedentsMedicaux.push(this.newAntecedent.trim());
      this.newAntecedent = '';
    }
  }

  /**
   * Retire un antécédent
   */
  removeAntecedent(index: number): void {
    this.dossierForm.antecedentsMedicaux?.splice(index, 1);
  }

  /**
   * Supprime un dossier
   */
  deleteDossier(dossier: DossierMedical): void {
    const confirmation = confirm(
      `Êtes-vous sûr de vouloir supprimer le dossier de ${dossier.patientPrenom} ${dossier.patientNom} ?`
    );

    if (confirmation) {
      this.dossierService.deleteDossier(dossier.id);
      alert('Dossier supprimé avec succès !');
      this.loadDossiers();
    }
  }

  /**
   * Change le statut d'un dossier
   */
  changeStatut(dossier: DossierMedical, newStatut: 'ouvert' | 'fermé' | 'archivé'): void {
    this.dossierService.changeStatut(dossier.id, newStatut);
  }

  // ========== GESTION DES CONSULTATIONS ==========

  /**
   * Ouvre le formulaire d'ajout de consultation
   */
  openConsultationForm(dossier: DossierMedical): void {
    this.selectedDossier = dossier;
    this.showConsultationForm = true;
    this.consultationForm = this.getEmptyConsultationForm();
    this.consultationForm.dossierId = dossier.id;
  }

  /**
   * Ferme le formulaire de consultation
   */
  closeConsultationForm(): void {
    this.showConsultationForm = false;
    this.selectedDossier = null;
    this.consultationForm = this.getEmptyConsultationForm();
  }

  /**
   * Soumet le formulaire de consultation
   */
  onSubmitConsultation(): void {
    if (!this.validateConsultationForm()) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    this.dossierService.addConsultation(this.consultationForm);
    alert('Consultation ajoutée avec succès !');
    this.closeConsultationForm();
    this.loadDossiers();
  }

  // ========== DÉTAILS DU DOSSIER ==========

  /**
   * Affiche les détails d'un dossier
   */
  viewDetails(dossier: DossierMedical): void {
    this.selectedDossier = dossier;
    this.showDetailModal = true;
  }

  /**
   * Ferme le modal de détails
   */
  closeDetailModal(): void {
    this.showDetailModal = false;
    this.selectedDossier = null;
  }

  // ========== VALIDATIONS ==========

  /**
   * Valide le formulaire de dossier
   */
  private validateDossierForm(): boolean {
    return !!(
      this.dossierForm.patientId &&
      this.dossierForm.medecinId
    );
  }

  /**
   * Valide le formulaire de consultation
   */
  private validateConsultationForm(): boolean {
    return !!(
      this.consultationForm.motif &&
      this.consultationForm.diagnostic
    );
  }

  // ========== FORMULAIRES VIDES ==========

  /**
   * Retourne un formulaire de dossier vide
   */
  private getEmptyDossierForm(): DossierForm {
    return {
      patientId: '',
      medecinId: '',
      diagnosticPrincipal: '',
      allergies: [],
      antecedentsMedicaux: [],
      groupeSanguin: ''
    };
  }

  /**
   * Retourne un formulaire de consultation vide
   */
  private getEmptyConsultationForm(): ConsultationForm {
    return {
      dossierId: '',
      motif: '',
      diagnostic: '',
      prescription: '',
      notes: '',
      examens: []
    };
  }

  /**
   * Badge de couleur selon le statut
   */
  getStatutClass(statut: string): string {
    switch (statut) {
      case 'ouvert': return 'status-open';
      case 'fermé': return 'status-closed';
      case 'archivé': return 'status-archived';
      default: return '';
    }
  }
}