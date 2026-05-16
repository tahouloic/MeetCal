/**
 * EXPLICATION :
 * Ce service gère toute la logique métier pour les médecins.
 * Il utilise BehaviorSubject pour la programmation réactive (CHAP 3).
 * 
 * BehaviorSubject VS Observable :
 * - BehaviorSubject : Garde la dernière valeur émise et peut émettre de nouvelles valeurs
 * - Observable : Juste pour écouter les données
 * 
 * providedIn: 'root' : Ce service est un singleton accessible partout dans l'app
 */

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Medecin, MedecinForm } from '../models/medecin';

@Injectable({
  providedIn: 'root'  // Service singleton disponible dans toute l'application
})
export class MedecinService {

  /**
   * BehaviorSubject pour stocker la liste des médecins
   * C'est un flux de données réactif (programmation réactive - CHAP 3)
   * 
   * Quand on émet une nouvelle valeur avec .next(), tous les composants
   * qui sont abonnés reçoivent automatiquement la mise à jour
   */
  private medecins$: BehaviorSubject<Medecin[]> = new BehaviorSubject<Medecin[]>([
    {
      id: 'M001',
      nom: 'Martin',
      prenom: 'Jean',
      specialite: 'Cardiologie',
      telephone: '+237 6 90 23 45 67',
      email: 'dr.jean.martin@medconnect.com',
      dateNaissance: '1978-05-15',
      numeroOrdre: 'CNOM-2024-001',
      adresse: 'Yaoundé, Bastos',
      dateInscription: '2024-01-10',
      statut: 'actif',
      verified: true,
      experience: 15
    },
    {
      id: 'M002',
      nom: 'Laurent',
      prenom: 'Sophie',
      specialite: 'Pédiatrie',
      telephone: '+237 6 55 34 56 78',
      email: 'dr.sophie.laurent@medconnect.com',
      dateNaissance: '1985-09-22',
      numeroOrdre: 'CNOM-2024-002',
      adresse: 'Douala, Akwa',
      dateInscription: '2024-02-15',
      statut: 'actif',
      verified: true,
      experience: 10
    },
    {
      id: 'M003',
      nom: 'Dubois',
      prenom: 'Pierre',
      specialite: 'Dermatologie',
      telephone: '+237 6 77 45 67 89',
      email: 'dr.pierre.dubois@medconnect.com',
      dateNaissance: '1990-03-10',
      numeroOrdre: 'CNOM-2024-003',
      adresse: 'Yaoundé, Essos',
      dateInscription: '2024-03-20',
      statut: 'en attente',
      verified: false,
      experience: 5
    },
    {
      id: 'M004',
      nom: 'Bernard',
      prenom: 'Marie',
      specialite: 'Gynécologie',
      telephone: '+237 6 80 56 78 90',
      email: 'dr.marie.bernard@medconnect.com',
      dateNaissance: '1982-11-30',
      numeroOrdre: 'CNOM-2024-004',
      adresse: 'Douala, Bonamoussadi',
      dateInscription: '2024-01-25',
      statut: 'actif',
      verified: true,
      experience: 12
    },
    {
      id: 'M005',
      nom: 'Petit',
      prenom: 'Luc',
      specialite: 'Neurologie',
      telephone: '+237 6 65 67 89 01',
      email: 'dr.luc.petit@medconnect.com',
      dateNaissance: '1975-07-18',
      numeroOrdre: 'CNOM-2024-005',
      adresse: 'Yaoundé, Melen',
      dateInscription: '2024-02-05',
      statut: 'inactif',
      verified: true,
      experience: 20
    }
  ]);

  constructor() { }

  /**
   * Récupère la liste de tous les médecins
   * Retourne un Observable pour que les composants puissent s'abonner
   * 
   * Usage dans le composant :
   * this.medecins$ = this.medecinService.getMedecins();
   */
  getMedecins(): Observable<Medecin[]> {
    return this.medecins$.asObservable();
  }

  /**
   * Récupère un médecin spécifique par son ID
   * Retourne le médecin ou undefined s'il n'existe pas
   */
  getMedecinById(id: string): Medecin | undefined {
    return this.medecins$.value.find(m => m.id === id);
  }

  /**
   * Ajoute un nouveau médecin
   * 
   * 1. Crée un objet Medecin complet à partir du formulaire
   * 2. Génère un ID automatique
   * 3. Ajoute les champs par défaut (statut, verified, dateInscription)
   * 4. Émet la nouvelle liste avec .next()
   */
  addMedecin(medecinForm: MedecinForm): void {
    const newMedecin: Medecin = {
      id: this.generateId(),
      ...medecinForm,  // Spread operator : copie toutes les propriétés du formulaire
      // Valeurs par défaut pour les champs optionnels
      dateNaissance: medecinForm.dateNaissance || '',
      adresse: medecinForm.adresse || '',
      experience: medecinForm.experience || 0,
      // Champs système
      dateInscription: new Date().toISOString().split('T')[0],
      statut: 'en attente',  // Nouveau médecin doit être vérifié
      verified: false
    };

    // Récupère la liste actuelle
    const currentMedecins = this.medecins$.value;

    // Émet la nouvelle liste avec le nouveau médecin en premier
    this.medecins$.next([newMedecin, ...currentMedecins]);
  }

  /**
   * Met à jour un médecin existant
   * Utilise Partial<Medecin> : permet de ne mettre à jour que certains champs
   */
  updateMedecin(id: string, updatedMedecin: Partial<Medecin>): void {
    const currentMedecins = this.medecins$.value;
    const index = currentMedecins.findIndex(m => m.id === id);

    if (index !== -1) {
      // Fusionne l'ancien médecin avec les nouvelles données
      currentMedecins[index] = { ...currentMedecins[index], ...updatedMedecin };

      // Émet la liste mise à jour
      this.medecins$.next([...currentMedecins]);
    }
  }

  /**
   * Supprime un médecin
   * Utilise filter() pour créer une nouvelle liste sans ce médecin
   */
  deleteMedecin(id: string): void {
    const currentMedecins = this.medecins$.value;
    this.medecins$.next(currentMedecins.filter(m => m.id !== id));
  }

  /**
   * Change le statut d'un médecin (actif/inactif)
   */
  toggleMedecinStatus(id: string): void {
    const medecin = this.getMedecinById(id);
    if (medecin) {
      let newStatut: 'actif' | 'inactif' | 'en attente' | 'suspendu';
      
      // Cycle: actif → inactif → actif (suspendu ne change pas par toggle)
      if (medecin.statut === 'actif') {
        newStatut = 'inactif';
      } else if (medecin.statut === 'inactif') {
        newStatut = 'actif';
      } else {
        // Pour 'en attente' et 'suspendu', on ne change pas par toggle
        return;
      }
      
      this.updateMedecin(id, { statut: newStatut });
    }
  }

  /**
   * Vérifie un médecin (change verified à true et statut à actif)
   */
  verifyMedecin(id: string): void {
    this.updateMedecin(id, {
      verified: true,
      statut: 'actif'
    });
  }

  /**
   * Recherche des médecins par nom, prénom, email, spécialité
   * Retourne un Observable avec les résultats filtrés
   */
  searchMedecins(query: string): Observable<Medecin[]> {
    const filteredMedecins = this.medecins$.value.filter(medecin => {
      const searchTerm = query.toLowerCase();
      return (
        medecin.nom.toLowerCase().includes(searchTerm) ||
        medecin.prenom.toLowerCase().includes(searchTerm) ||
        medecin.email.toLowerCase().includes(searchTerm) ||
        medecin.specialite.toLowerCase().includes(searchTerm)
      );
    });

    return new BehaviorSubject(filteredMedecins).asObservable();
  }

  /**
   * Filtre les médecins par spécialité
   */
  getMedecinsBySpecialite(specialite: string): Observable<Medecin[]> {
    const filtered = this.medecins$.value.filter(m => m.specialite === specialite);
    return new BehaviorSubject(filtered).asObservable();
  }

  /**
   * Récupère les médecins en attente de validation
   */
  getPendingMedecins(): Observable<Medecin[]> {
    const pending = this.medecins$.value.filter(m => m.statut === 'en attente' && !m.verified);
    return new BehaviorSubject(pending).asObservable();
  }

  /**
   * Approuve un médecin en attente
   * Change le statut à 'actif' et verified à true
   */
  approveMedecin(id: string): void {
    this.updateMedecin(id, {
      verified: true,
      statut: 'actif'
    });
  }

  /**
   * Rejette un médecin en attente
   * Supprime le médecin de la base de données
   */
  rejectMedecin(id: string, reason: string = ''): void {
    // Dans une vraie application, on pourrait envoyer un email avec la raison
    console.log(`Médecin ${id} rejeté. Raison: ${reason}`);
    this.deleteMedecin(id);
  }

  /**
   * Suspend un médecin
   * Change le statut à 'suspendu'
   */
  suspendMedecin(id: string, reason: string = ''): void {
    console.log(`Médecin ${id} suspendu. Raison: ${reason}`);
    this.updateMedecin(id, { statut: 'suspendu' });
  }

  /**
   * Calcule les statistiques des médecins
   * Retourne le nombre de médecins par statut
   */
  getMedecinStats() {
    const medecins = this.medecins$.value;
    
    return {
      enAttente: medecins.filter(m => m.statut === 'en attente' && !m.verified).length,
      approuves: medecins.filter(m => m.verified && m.statut === 'actif').length,
      rejetes: 0, // Les médecins rejetés sont supprimés, donc toujours 0
      suspendus: medecins.filter(m => m.statut === 'suspendu').length,
      total: medecins.length
    };
  }

  /**
   * Génère un ID automatique pour un nouveau médecin
   * Format: M001, M002, M003, etc.
   */
  private generateId(): string {
    const medecins = this.medecins$.value;
    if (medecins.length === 0) return 'M001';

    // Récupère le dernier ID et incrémente
    const lastId = medecins[0].id;
    const lastNumber = parseInt(lastId.substring(1));
    const newNumber = lastNumber + 1;

    // Formate avec des zéros : M001, M002, etc.
    return `M${newNumber.toString().padStart(3, '0')}`;
  }
}