/**
 * SERVICE DE RECHERCHE GLOBALE
 * 
 * Permet de rechercher à travers toute l'application :
 * - Patients
 * - Médecins  
 * - Dossiers médicaux
 * - Messages
 */

import { Injectable, inject } from '@angular/core';
import { Observable, combineLatest, map, of, debounceTime, distinctUntilChanged } from 'rxjs';
import { PatientService } from './patient';
import { MedecinService } from './medecin';
import { DossierService } from './dossier';
import { MessagerieService } from './message';

export interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  type: 'patient' | 'medecin' | 'dossier' | 'message';
  route: string;
  icon: string;
  data?: any;
}

export interface SearchResults {
  patients: SearchResult[];
  medecins: SearchResult[];
  dossiers: SearchResult[];
  messages: SearchResult[];
  total: number;
}

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private patientService = inject(PatientService);
  private medecinService = inject(MedecinService);
  private dossierService = inject(DossierService);
  private messageService = inject(MessagerieService);

  /**
   * Recherche globale dans toute l'application
   */
  globalSearch(query: string): Observable<SearchResults> {
    if (!query || query.trim().length < 2) {
      return of({
        patients: [],
        medecins: [],
        dossiers: [],
        messages: [],
        total: 0
      });
    }

    const searchTerm = query.toLowerCase().trim();

    return combineLatest([
      this.searchPatients(searchTerm),
      this.searchMedecins(searchTerm),
      this.searchDossiers(searchTerm),
      this.searchMessages(searchTerm)
    ]).pipe(
      map(([patients, medecins, dossiers, messages]) => ({
        patients,
        medecins,
        dossiers,
        messages,
        total: patients.length + medecins.length + dossiers.length + messages.length
      }))
    );
  }

  /**
   * Recherche dans les patients
   */
  private searchPatients(query: string): Observable<SearchResult[]> {
    return this.patientService.getPatients().pipe(
      map(patients => 
        patients
          .filter(patient => 
            patient.nom.toLowerCase().includes(query) ||
            patient.prenom.toLowerCase().includes(query) ||
            patient.email.toLowerCase().includes(query) ||
            patient.telephone.includes(query) ||
            patient.id.toLowerCase().includes(query)
          )
          .slice(0, 5) // Limiter à 5 résultats
          .map(patient => ({
            id: patient.id,
            title: `${patient.prenom} ${patient.nom}`,
            subtitle: `Patient • ${patient.email}`,
            type: 'patient' as const,
            route: '/patients',
            icon: 'user',
            data: patient
          }))
      )
    );
  }

  /**
   * Recherche dans les médecins
   */
  private searchMedecins(query: string): Observable<SearchResult[]> {
    return this.medecinService.getMedecins().pipe(
      map(medecins => 
        medecins
          .filter(medecin => 
            medecin.nom.toLowerCase().includes(query) ||
            medecin.prenom.toLowerCase().includes(query) ||
            medecin.email.toLowerCase().includes(query) ||
            medecin.specialite.toLowerCase().includes(query) ||
            medecin.numeroOrdre.toLowerCase().includes(query)
          )
          .slice(0, 5)
          .map(medecin => ({
            id: medecin.id,
            title: `Dr. ${medecin.prenom} ${medecin.nom}`,
            subtitle: `Médecin • ${medecin.specialite}`,
            type: 'medecin' as const,
            route: '/medecins',
            icon: 'stethoscope',
            data: medecin
          }))
      )
    );
  }

  /**
   * Recherche dans les dossiers médicaux
   */
  private searchDossiers(query: string): Observable<SearchResult[]> {
    return this.dossierService.getDossiers().pipe(
      map(dossiers => 
        dossiers
          .filter(dossier => 
            dossier.id.toLowerCase().includes(query) ||
            dossier.patientNom.toLowerCase().includes(query) ||
            (dossier.diagnosticPrincipal && dossier.diagnosticPrincipal.toLowerCase().includes(query)) ||
            dossier.medecinNom.toLowerCase().includes(query)
          )
          .slice(0, 5)
          .map(dossier => ({
            id: dossier.id,
            title: `Dossier ${dossier.id}`,
            subtitle: `${dossier.patientNom} • ${dossier.diagnosticPrincipal || 'Diagnostic en cours'}`,
            type: 'dossier' as const,
            route: '/dossiers',
            icon: 'file-medical',
            data: dossier
          }))
      )
    );
  }

  /**
   * Recherche dans les messages
   */
  private searchMessages(query: string): Observable<SearchResult[]> {
    return this.messageService.getConversations().pipe(
      map(conversations => {
        const results: SearchResult[] = [];
        
        conversations.forEach(conversation => {
          conversation.messages.forEach(message => {
            if (message.content.toLowerCase().includes(query) ||
                conversation.participantName.toLowerCase().includes(query)) {
              results.push({
                id: message.id,
                title: `Message de ${conversation.participantName}`,
                subtitle: message.content.substring(0, 60) + '...',
                type: 'message' as const,
                route: '/messagerie',
                icon: 'message',
                data: { conversation, message }
              });
            }
          });
        });

        return results.slice(0, 5);
      })
    );
  }

  /**
   * Recherche avec suggestions rapides
   */
  getQuickSuggestions(): Observable<SearchResult[]> {
    return combineLatest([
      this.patientService.getPatients(),
      this.medecinService.getMedecins()
    ]).pipe(
      map(([patients, medecins]) => {
        const suggestions: SearchResult[] = [];

        // Derniers patients ajoutés
        patients.slice(0, 3).forEach(patient => {
          suggestions.push({
            id: patient.id,
            title: `${patient.prenom} ${patient.nom}`,
            subtitle: 'Patient récent',
            type: 'patient',
            route: '/patients',
            icon: 'user',
            data: patient
          });
        });

        // Médecins en attente de validation
        medecins
          .filter(m => m.statut === 'en attente')
          .slice(0, 2)
          .forEach(medecin => {
            suggestions.push({
              id: medecin.id,
              title: `Dr. ${medecin.prenom} ${medecin.nom}`,
              subtitle: 'En attente de validation',
              type: 'medecin',
              route: '/medecins',
              icon: 'stethoscope',
              data: medecin
            });
          });

        return suggestions;
      })
    );
  }
}