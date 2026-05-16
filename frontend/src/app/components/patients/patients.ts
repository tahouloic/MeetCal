
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PatientService } from '../../services/patient';
import { ThemeService } from '../../services/theme.service';
import { Observable } from 'rxjs';
import { Patient, PatientForm } from '../../models/patient';

@Component({
  selector: 'app-patients',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './patients.html',
  styleUrl: './patients.scss'
})
export class PatientsComponent implements OnInit {
  private patientService = inject(PatientService);
  private themeService = inject(ThemeService);

  // Observables
  patients$!: Observable<Patient[]>;

  // Statistiques
  totalPatients: number = 0;
  activePatients: number = 0;
  inactivePatients: number = 0;
  urgentPatients: number = 0;

  // Accès au service de thème
  get isDarkMode() {
    return this.themeService.darkMode;
  }

  // État du formulaire
  showForm: boolean = false;
  isEditing: boolean = false;
  editingPatientId: string | null = null;

  // Formulaire
  patientForm: PatientForm = this.getEmptyForm();

  // Recherche
  searchQuery: string = '';

  // Filtres
  selectedStatut: string = '';
  selectedCondition: string = '';

  // Mode d'affichage
  viewMode: 'table' | 'cards' = 'table';

  ngOnInit(): void {
    this.loadPatients();
    this.calculateStatistics();
  }

  // Charger la liste des patients
  loadPatients(): void {
    if (this.searchQuery.trim()) {
      this.patients$ = this.patientService.searchPatients(this.searchQuery);
    } else if (this.selectedStatut && this.selectedCondition) {
      // Filtrer par statut ET condition
      this.patients$ = this.patientService.getFilteredPatients(this.selectedStatut, this.selectedCondition);
    } else if (this.selectedStatut) {
      // Filtrer par statut seulement
      this.patients$ = this.patientService.getPatientsByStatut(this.selectedStatut);
    } else if (this.selectedCondition) {
      // Filtrer par condition seulement
      this.patients$ = this.patientService.getPatientsByCondition(this.selectedCondition);
    } else {
      // Tous les patients
      this.patients$ = this.patientService.getPatients();
    }
    
    // Recalculer les statistiques après chaque chargement
    this.calculateStatistics();
  }

  // Calculer les statistiques
  calculateStatistics(): void {
    this.patientService.getPatients().subscribe(patients => {
      this.totalPatients = patients.length;
      this.activePatients = patients.filter(p => p.statut === 'actif').length;
      this.inactivePatients = patients.filter(p => p.statut === 'inactif').length;
      this.urgentPatients = patients.filter(p => p.statut === 'urgent').length;
    });
  }

  // Rechercher des patients
  onSearch(): void {
    this.loadPatients();
  }

  // Filtrer par statut et condition
  onFilterChange(): void {
    this.loadPatients();
  }

  // Réinitialiser les filtres
  resetFilters(): void {
    this.selectedStatut = '';
    this.selectedCondition = '';
    this.searchQuery = '';
    this.loadPatients();
  }

  // Changer le mode d'affichage
  setViewMode(mode: 'table' | 'cards'): void {
    this.viewMode = mode;
  }

  // Ouvrir le formulaire d'ajout
  openAddForm(): void {
    this.showForm = true;
    this.isEditing = false;
    this.patientForm = this.getEmptyForm();
  }

  // Fermer le formulaire
  closeForm(): void {
    this.showForm = false;
    this.isEditing = false;
    this.editingPatientId = null;
    this.patientForm = this.getEmptyForm();
  }

  // Soumettre le formulaire
  onSubmit(): void {
    // Validation basique
    if (!this.validateForm()) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (this.isEditing && this.editingPatientId) {
      // Mise à jour
      this.patientService.updatePatient(this.editingPatientId, this.patientForm as Patient);
      alert('Patient mis à jour avec succès !');
    } else {
      // Ajout
      this.patientService.addPatient(this.patientForm);
      alert('Patient ajouté avec succès !');
    }

    this.closeForm();
    this.loadPatients();
    this.calculateStatistics(); // Recalculer les stats après ajout/modification
  }

  // Éditer un patient
  editPatient(patient: Patient): void {
    this.showForm = true;
    this.isEditing = true;
    this.editingPatientId = patient.id;
    this.patientForm = {
      nom: patient.nom,
      prenom: patient.prenom,
      dateNaissance: patient.dateNaissance,
      sexe: patient.sexe,
      telephone: patient.telephone,
      email: patient.email,
      adresse: patient.adresse,
      numeroSecuriteSociale: patient.numeroSecuriteSociale,
      groupeSanguin: patient.groupeSanguin
    };
  }

  // Supprimer un patient
  deletePatient(patient: Patient): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer ${patient.prenom} ${patient.nom} ?`)) {
      this.patientService.deletePatient(patient.id);
      alert('Patient supprimé avec succès !');
      this.loadPatients();
      this.calculateStatistics(); // Recalculer les stats après suppression
    }
  }

  // Changer le statut
  toggleStatus(patient: Patient): void {
    this.patientService.togglePatientStatus(patient.id);
    this.calculateStatistics(); // Recalculer les stats après changement de statut
  }

  // Validation du formulaire
  private validateForm(): boolean {
    return !!(
      this.patientForm.nom &&
      this.patientForm.prenom &&
      this.patientForm.dateNaissance &&
      this.patientForm.sexe &&
      this.patientForm.telephone &&
      this.patientForm.email
    );
  }

  // Formulaire vide
  private getEmptyForm(): PatientForm {
    return {
      nom: '',
      prenom: '',
      dateNaissance: '',
      sexe: '',
      telephone: '',
      email: '',
      adresse: '',
      numeroSecuriteSociale: '',
      groupeSanguin: ''
    };
  }

  // Calculer l'âge
  calculateAge(dateNaissance: string): number {
    const today = new Date();
    const birthDate = new Date(dateNaissance);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  }
}