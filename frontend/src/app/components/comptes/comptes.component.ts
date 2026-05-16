import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Subject, takeUntil } from 'rxjs';
import { environment } from '../../../environments/environment';

interface UserAccount {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role: string;
  status: string;
  createdAt: string;
  lastConnection?: string;
}

interface PageResponse {
  content: UserAccount[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

@Component({
  selector: 'app-comptes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './comptes.component.html',
  styleUrls: ['./comptes.component.scss']
})
export class ComptesComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  users: UserAccount[] = [];
  loading = false;
  error: string | null = null;
  
  // Pagination
  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  totalPages = 0;
  
  // Search
  searchTerm = '';
  
  // Sort
  sortBy = 'createdAt';
  sortDirection: 'ASC' | 'DESC' = 'DESC';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadUsers(): void {
    this.loading = true;
    this.error = null;

    const params: any = {
      page: this.currentPage.toString(),
      size: this.pageSize.toString(),
      sortBy: this.sortBy,
      sortDirection: this.sortDirection
    };

    if (this.searchTerm) {
      params.search = this.searchTerm;
    }

    this.http.get<any>(`${environment.apiUrl}/admin/users`, { params })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.users = response.data.content;
            this.totalElements = response.data.totalElements;
            this.totalPages = response.data.totalPages;
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Erreur lors du chargement des utilisateurs:', error);
          this.error = 'Impossible de charger les utilisateurs';
          this.loading = false;
        }
      });
  }

  onSearch(): void {
    this.currentPage = 0;
    this.loadUsers();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadUsers();
  }

  blockUser(userId: string): void {
    if (!confirm('Êtes-vous sûr de vouloir bloquer cet utilisateur ?')) {
      return;
    }

    this.http.put<any>(`${environment.apiUrl}/admin/users/${userId}/block`, {})
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            alert('Utilisateur bloqué avec succès');
            this.loadUsers();
          }
        },
        error: (error) => {
          console.error('Erreur lors du blocage:', error);
          alert(error.error?.error?.message || 'Erreur lors du blocage de l\'utilisateur');
        }
      });
  }

  unblockUser(userId: string): void {
    if (!confirm('Êtes-vous sûr de vouloir débloquer cet utilisateur ?')) {
      return;
    }

    this.http.put<any>(`${environment.apiUrl}/admin/users/${userId}/unblock`, {})
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            alert('Utilisateur débloqué avec succès');
            this.loadUsers();
          }
        },
        error: (error) => {
          console.error('Erreur lors du déblocage:', error);
          alert(error.error?.error?.message || 'Erreur lors du déblocage de l\'utilisateur');
        }
      });
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'ACTIVE': return 'badge-success';
      case 'BLOCKED': return 'badge-danger';
      case 'PENDING': return 'badge-warning';
      case 'REJECTED': return 'badge-secondary';
      default: return 'badge-secondary';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'ACTIVE': return 'Actif';
      case 'BLOCKED': return 'Bloqué';
      case 'PENDING': return 'En attente';
      case 'REJECTED': return 'Rejeté';
      default: return status;
    }
  }

  getRoleLabel(role: string): string {
    switch (role) {
      case 'ADMIN': return 'Administrateur';
      case 'TEACHER': return 'Enseignant';
      case 'STUDENT': return 'Étudiant';
      case 'USER': return 'Utilisateur';
      default: return role;
    }
  }

  formatDate(date: string | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getFullName(user: UserAccount): string {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.email;
  }
}
