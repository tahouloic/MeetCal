
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Patient, PatientForm } from '../models/patient';

@Injectable({
  providedIn: 'root'
})
export class PatientService {
  // BehaviorSubject pour la liste des patients (programmation réactive)
  private patients$: BehaviorSubject<Patient[]> = new BehaviorSubject<Patient[]>([
    {
      id: 'P001',
      nom: 'Dubois',
      prenom: 'Marie',
      dateNaissance: '1985-03-15',
      sexe: 'F',
      telephone: '+237 6 70 12 34 56',
      email: 'marie.dubois@email.com',
      adresse: 'Yaoundé, Bastos',
      numeroSecuriteSociale: '1850315789012',
      groupeSanguin: 'A+',
      dateInscription: '2024-01-15',
      statut: 'actif',
      derniereConsultation: '2024-01-10',
      condition: 'Hypertension'
    },
    {
      id: 'P002',
      nom: 'Martin',
      prenom: 'Jean',
      dateNaissance: '1978-07-22',
      sexe: 'M',
      telephone: '+237 6 90 23 45 67',
      email: 'jean.martin@email.com',
      adresse: 'Douala, Akwa',
      numeroSecuriteSociale: '1780722456789',
      groupeSanguin: 'O+',
      dateInscription: '2024-02-20',
      statut: 'urgent',
      derniereConsultation: '2024-01-05',
      condition: 'Diabète'
    },
    {
      id: 'P003',
      nom: 'Laurent',
      prenom: 'Sophie',
      dateNaissance: '1992-11-08',
      sexe: 'F',
      telephone: '+237 6 55 34 56 78',
      email: 'sophie.laurent@email.com',
      adresse: 'Yaoundé, Essos',
      numeroSecuriteSociale: '1921108234567',
      groupeSanguin: 'B+',
      dateInscription: '2024-03-10',
      statut: 'actif',
      derniereConsultation: '2024-01-08',
      condition: 'Asthme'
    },
    {
      id: 'P004',
      nom: 'Bernard',
      prenom: 'Pierre',
      dateNaissance: '1965-05-30',
      sexe: 'M',
      telephone: '+237 6 77 45 67 89',
      email: 'pierre.bernard@email.com',
      adresse: 'Douala, Bonamoussadi',
      numeroSecuriteSociale: '1650530890123',
      groupeSanguin: 'AB+',
      dateInscription: '2024-01-25',
      statut: 'inactif',
      derniereConsultation: '2023-12-15',
      condition: 'Arthrite'
    },
    {
      id: 'P005',
      nom: 'Petit',
      prenom: 'Claire',
      dateNaissance: '1988-09-12',
      sexe: 'F',
      telephone: '+237 6 80 56 78 90',
      email: 'claire.petit@email.com',
      adresse: 'Yaoundé, Melen',
      numeroSecuriteSociale: '1880912567890',
      groupeSanguin: 'O-',
      dateInscription: '2024-04-05',
      statut: 'urgent',
      derniereConsultation: '2024-01-12',
      condition: 'Migraine chronique'
    }
  ]);

  constructor() { }

  // Récupérer tous les patients
  getPatients(): Observable<Patient[]> {
    return this.patients$.asObservable();
  }

  // Récupérer un patient par ID
  getPatientById(id: string): Patient | undefined {
    return this.patients$.value.find(p => p.id === id);
  }

  // Ajouter un nouveau patient
  addPatient(patientForm: PatientForm): void {
    const newPatient: Patient = {
      id: this.generateId(),
      ...patientForm,
      sexe: patientForm.sexe as 'M' | 'F',
      dateInscription: new Date().toISOString().split('T')[0],
      statut: 'actif'
    };

    const currentPatients = this.patients$.value;
    this.patients$.next([newPatient, ...currentPatients]);
  }

  // Mettre à jour un patient
  updatePatient(id: string, updatedPatient: Partial<Patient>): void {
    const currentPatients = this.patients$.value;
    const index = currentPatients.findIndex(p => p.id === id);

    if (index !== -1) {
      currentPatients[index] = { ...currentPatients[index], ...updatedPatient };
      this.patients$.next([...currentPatients]);
    }
  }

  // Supprimer un patient
  deletePatient(id: string): void {
    const currentPatients = this.patients$.value;
    this.patients$.next(currentPatients.filter(p => p.id !== id));
  }

  // Changer le statut d'un patient (cycle entre actif, inactif, urgent)
  togglePatientStatus(id: string): void {
    const patient = this.getPatientById(id);
    if (patient) {
      let newStatut: 'actif' | 'inactif' | 'urgent';
      
      switch (patient.statut) {
        case 'actif':
          newStatut = 'inactif';
          break;
        case 'inactif':
          newStatut = 'urgent';
          break;
        case 'urgent':
          newStatut = 'actif';
          break;
        default:
          newStatut = 'actif';
      }
      
      this.updatePatient(id, { statut: newStatut });
    }
  }

  // Générer un ID unique
  private generateId(): string {
    const lastPatient = this.patients$.value[0];
    if (!lastPatient) return 'P001';

    const lastNumber = parseInt(lastPatient.id.substring(1));
    const newNumber = lastNumber + 1;
    return `P${newNumber.toString().padStart(3, '0')}`;
  }

  // Rechercher des patients
  searchPatients(query: string): Observable<Patient[]> {
    const filteredPatients = this.patients$.value.filter(patient => {
      const searchTerm = query.toLowerCase();
      return (
        patient.nom.toLowerCase().includes(searchTerm) ||
        patient.prenom.toLowerCase().includes(searchTerm) ||
        patient.email.toLowerCase().includes(searchTerm) ||
        patient.telephone.includes(searchTerm)
      );
    });

    return new BehaviorSubject(filteredPatients).asObservable();
  }

  // Filtrer par statut
  getPatientsByStatut(statut: string): Observable<Patient[]> {
    const filtered = this.patients$.value.filter(p => p.statut === statut);
    return new BehaviorSubject(filtered).asObservable();
  }

  // Filtrer par condition
  getPatientsByCondition(condition: string): Observable<Patient[]> {
    const filtered = this.patients$.value.filter(p => p.condition === condition);
    return new BehaviorSubject(filtered).asObservable();
  }

  // Filtrer par statut ET condition
  getFilteredPatients(statut: string, condition: string): Observable<Patient[]> {
    const filtered = this.patients$.value.filter(p => 
      p.statut === statut && p.condition === condition
    );
    return new BehaviorSubject(filtered).asObservable();
  }
}