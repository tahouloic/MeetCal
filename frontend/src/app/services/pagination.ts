/**
 * SERVICE DE PAGINATION GÉNÉRIQUE
 * Réutilisable pour toutes les listes (Patients, Médecins, Dossiers)
 * 
 * Fonctionnalités :
 * - Pagination avec taille de page configurable
 * - Navigation (première, précédente, suivante, dernière)
 * - Calcul automatique des pages
 */

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface PaginationState<T> {
  items: T[];              // Éléments de la page courante
  totalItems: number;      // Total d'éléments
  currentPage: number;     // Page actuelle (commence à 1)
  pageSize: number;        // Taille de la page
  totalPages: number;      // Nombre total de pages
}

@Injectable({
  providedIn: 'root'
})
export class PaginationService {

  constructor() { }

  /**
   * Crée un état de pagination
   */
  createPaginationState<T>(
    allItems: T[],
    currentPage: number = 1,
    pageSize: number = 10
  ): PaginationState<T> {
    const totalItems = allItems.length;
    const totalPages = Math.ceil(totalItems / pageSize);

    // S'assurer que currentPage est valide
    currentPage = Math.max(1, Math.min(currentPage, totalPages || 1));

    // Calculer les indices
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;

    // Extraire les items de la page
    const items = allItems.slice(startIndex, endIndex);

    return {
      items,
      totalItems,
      currentPage,
      pageSize,
      totalPages
    };
  }

  /**
   * Génère les numéros de pages à afficher
   * Exemple : [1, 2, 3, ..., 10] ou [1, ..., 5, 6, 7, ..., 20]
   */
  getPageNumbers(currentPage: number, totalPages: number, maxVisible: number = 7): (number | string)[] {
    if (totalPages <= maxVisible) {
      // Afficher toutes les pages
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | string)[] = [];
    const halfVisible = Math.floor(maxVisible / 2);

    // Toujours afficher la première page
    pages.push(1);

    let start = Math.max(2, currentPage - halfVisible);
    let end = Math.min(totalPages - 1, currentPage + halfVisible);

    // Ajuster si on est près du début
    if (currentPage <= halfVisible + 1) {
      end = maxVisible - 1;
    }

    // Ajuster si on est près de la fin
    if (currentPage >= totalPages - halfVisible) {
      start = totalPages - maxVisible + 2;
    }

    // Ajouter "..." si nécessaire
    if (start > 2) {
      pages.push('...');
    }

    // Ajouter les pages du milieu
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    // Ajouter "..." si nécessaire
    if (end < totalPages - 1) {
      pages.push('...');
    }

    // Toujours afficher la dernière page
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  }

  /**
   * Calcule les infos d'affichage (ex: "Affichage de 1 à 10 sur 50")
   */
  getDisplayInfo(state: PaginationState<any>): string {
    if (state.totalItems === 0) {
      return 'Aucun élément';
    }

    const start = (state.currentPage - 1) * state.pageSize + 1;
    const end = Math.min(state.currentPage * state.pageSize, state.totalItems);

    return `Affichage de ${start} à ${end} sur ${state.totalItems}`;
  }
}