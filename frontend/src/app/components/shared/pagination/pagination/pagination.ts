/**
 * COMPOSANT DE PAGINATION RÉUTILISABLE
 * 
 * Usage :
 * <app-pagination 
 *   [currentPage]="1" 
 *   [totalPages]="10"
 *   (pageChange)="onPageChange($event)"
 * ></app-pagination>
 */

// ========== pagination.ts ==========
import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaginationService } from '../../../../services/pagination';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pagination.html',
  styleUrl: './pagination.scss'
})
export class PaginationComponent {
  private paginationService = inject(PaginationService);

  @Input() currentPage: number = 1;
  @Input() totalPages: number = 1;
  @Input() pageSize: number = 10;
  @Input() totalItems: number = 0;

  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();

  get pageNumbers(): (number | string)[] {
    return this.paginationService.getPageNumbers(this.currentPage, this.totalPages);
  }

  get displayInfo(): string {
    if (this.totalItems === 0) return 'Aucun élément';

    const start = (this.currentPage - 1) * this.pageSize + 1;
    const end = Math.min(this.currentPage * this.pageSize, this.totalItems);

    return `Affichage de ${start} à ${end} sur ${this.totalItems}`;
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.pageChange.emit(page);
    }
  }

  onPageSizeChange(size: string): void {
    this.pageSizeChange.emit(+size);
  }
}