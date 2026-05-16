import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Teacher } from '../../models/schedule';
import { TeacherService } from '../../services/teacher.service';

@Component({
  selector: 'app-enseignants',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Gestion des Enseignants</h1>
        <p>Gérez les enseignants actifs de l'IUSJC</p>
      </div>

      <div class="content-section">
        <div class="section-header">
          <h2>Enseignants Actifs ({{ teachers.length }})</h2>
        </div>

        <div class="teachers-grid" *ngIf="teachers.length > 0 && !loading; else noTeachers">
          <div class="teacher-card" *ngFor="let teacher of teachers">
            <div class="teacher-header">
              <div class="teacher-avatar">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="2"/>
                  <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
                </svg>
              </div>
              <div class="teacher-info">
                <h3>{{ getTeacherTitle(teacher) }} {{ getTeacherFirstName(teacher) }} {{ getTeacherLastName(teacher) }}</h3>
                <p class="specialty">{{ teacher.specialty }}</p>
                <p class="email">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" stroke-width="2"/>
                    <polyline points="22,6 12,13 2,6" stroke="currentColor" stroke-width="2"/>
                  </svg>
                  {{ getTeacherEmail(teacher) }}
                </p>
              </div>
            </div>
            
            <div class="teacher-details">
              <div class="detail-item">
                <span class="detail-label">Écoles:</span>
                <div class="schools">
                  <span class="school-tag" *ngFor="let school of teacher.schools">
                    {{ getSchoolName(school) }}
                  </span>
                </div>
              </div>
              
              <div class="detail-item" *ngIf="getTeacherCreatedAt(teacher)">
                <span class="detail-label">Membre depuis:</span>
                <span class="detail-value">{{ formatDate(getTeacherCreatedAt(teacher)) }}</span>
              </div>
              
              <div class="detail-item">
                <span class="detail-label">Statut:</span>
                <span class="status-badge active">
                  <svg width="8" height="8" viewBox="0 0 8 8">
                    <circle cx="4" cy="4" r="4" fill="currentColor"/>
                  </svg>
                  Actif
                </span>
              </div>
            </div>

            <div class="teacher-actions">
              <button class="btn btn-edit" (click)="editTeacher(teacher)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                Modifier
              </button>
              <button class="btn btn-delete" (click)="deleteTeacher(teacher)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <line x1="10" y1="11" x2="10" y2="17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  <line x1="14" y1="11" x2="14" y2="17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
                Supprimer
              </button>
            </div>
          </div>
        </div>

        <ng-template #noTeachers>
          <div class="empty-state" *ngIf="!loading">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
              <path d="M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="currentColor" stroke-width="2"/>
              <path d="M12 14C8.13401 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z" stroke="currentColor" stroke-width="2"/>
            </svg>
            <h3>Aucun enseignant trouvé</h3>
            <p>Les enseignants approuvés apparaîtront ici</p>
          </div>
          
          <div class="loading-state" *ngIf="loading">
            <div class="spinner"></div>
            <p>Chargement des enseignants...</p>
          </div>
        </ng-template>
      </div>
    </div>

    <!-- Modal de modification -->
    <div class="modal-overlay" *ngIf="showEditModal" (click)="closeEditModal()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>Modifier l'enseignant</h2>
          <button class="close-btn" (click)="closeEditModal()">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>

        <div class="modal-body">
          <div class="form-row">
            <div class="form-group">
              <label>Prénom</label>
              <input type="text" [(ngModel)]="editForm.firstName" class="form-input" />
            </div>
            <div class="form-group">
              <label>Nom</label>
              <input type="text" [(ngModel)]="editForm.lastName" class="form-input" />
            </div>
          </div>

          <div class="form-group">
            <label>Email</label>
            <input type="email" [(ngModel)]="editForm.email" class="form-input" />
          </div>

          <div class="form-group">
            <label>Téléphone</label>
            <input type="tel" [(ngModel)]="editForm.phone" class="form-input" />
          </div>

          <div class="form-group">
            <label>Spécialité</label>
            <input type="text" [(ngModel)]="editForm.specialty" class="form-input" />
          </div>

          <div class="form-group">
            <label>Titre</label>
            <select [(ngModel)]="editForm.title" class="form-input">
              <option value="NONE">Aucun</option>
              <option value="ENGINEER">Ingénieur</option>
              <option value="DOCTOR">Docteur</option>
              <option value="PROFESSOR">Professeur</option>
            </select>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-outline" (click)="closeEditModal()">Annuler</button>
          <button class="btn btn-primary" (click)="saveTeacher()">Enregistrer</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      padding: 2rem;
    }

    .page-header {
      margin-bottom: 2rem;
    }

    .page-header h1 {
      font-size: 2rem;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 0.5rem;
    }

    .page-header p {
      color: var(--text-secondary);
    }

    .section-header {
      margin-bottom: 1.5rem;
    }

    .section-header h2 {
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--text-primary);
    }

    .teachers-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
      gap: 1.5rem;
    }

    .teacher-card {
      background: var(--bg-primary);
      border-radius: 0.75rem;
      padding: 1.5rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      border: 1px solid var(--border-color);
      transition: all 0.2s ease;
    }

    .teacher-card:hover {
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      transform: translateY(-2px);
    }

    .teacher-header {
      display: flex;
      gap: 1rem;
      margin-bottom: 1.5rem;
      padding-bottom: 1.5rem;
      border-bottom: 1px solid var(--border-color);
    }

    .teacher-avatar {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: var(--bg-secondary);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      color: var(--text-secondary);
    }

    .teacher-info {
      flex: 1;
      min-width: 0;
    }

    .teacher-info h3 {
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0 0 0.25rem 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .specialty {
      color: #3b82f6;
      font-weight: 500;
      font-size: 0.875rem;
      margin: 0 0 0.5rem 0;
    }

    .email {
      color: var(--text-secondary);
      font-size: 0.875rem;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .email svg {
      flex-shrink: 0;
    }

    .teacher-details {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .detail-item {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .detail-label {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .detail-value {
      font-size: 0.875rem;
      color: var(--text-primary);
    }

    .schools {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .school-tag {
      background-color: var(--bg-secondary);
      color: var(--text-primary);
      padding: 0.25rem 0.75rem;
      border-radius: 0.375rem;
      font-size: 0.75rem;
      font-weight: 500;
      border: 1px solid var(--border-color);
    }

    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.25rem 0.75rem;
      border-radius: 0.375rem;
      font-size: 0.75rem;
      font-weight: 500;
      width: fit-content;
    }

    .status-badge.active {
      background-color: #ecfdf5;
      color: #059669;
    }

    :host-context(.dark) .status-badge.active {
      background-color: rgba(5, 150, 105, 0.1);
      color: #10b981;
    }

    .teacher-actions {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.5rem;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.625rem 1rem;
      border-radius: 0.5rem;
      font-weight: 500;
      font-size: 0.875rem;
      text-decoration: none;
      border: none;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-outline {
      background-color: var(--bg-primary);
      color: var(--text-primary);
      border: 1px solid var(--border-color);
    }

    .btn-outline:hover {
      background-color: var(--bg-secondary);
      border-color: #3b82f6;
    }

    .btn-edit {
      background-color: #eff6ff;
      color: #3b82f6;
      border: 1px solid #bfdbfe;
    }

    .btn-edit:hover {
      background-color: #dbeafe;
      border-color: #3b82f6;
    }

    :host-context(.dark) .btn-edit {
      background-color: rgba(59, 130, 246, 0.1);
      color: #60a5fa;
      border-color: rgba(59, 130, 246, 0.3);
    }

    :host-context(.dark) .btn-edit:hover {
      background-color: rgba(59, 130, 246, 0.2);
      border-color: #3b82f6;
    }

    .btn-delete {
      background-color: #fef2f2;
      color: #dc2626;
      border: 1px solid #fecaca;
    }

    .btn-delete:hover {
      background-color: #fee2e2;
      border-color: #dc2626;
    }

    :host-context(.dark) .btn-delete {
      background-color: rgba(220, 38, 38, 0.1);
      color: #f87171;
      border-color: rgba(220, 38, 38, 0.3);
    }

    :host-context(.dark) .btn-delete:hover {
      background-color: rgba(220, 38, 38, 0.2);
      border-color: #dc2626;
    }

    .empty-state,
    .loading-state {
      text-align: center;
      padding: 4rem 2rem;
      color: var(--text-secondary);
    }

    .empty-state svg,
    .loading-state svg {
      margin: 0 auto 1.5rem;
      opacity: 0.5;
      color: var(--text-secondary);
    }

    .empty-state h3 {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0 0 0.5rem 0;
    }

    .empty-state p,
    .loading-state p {
      font-size: 0.875rem;
      color: var(--text-secondary);
      margin: 0;
    }

    .spinner {
      width: 48px;
      height: 48px;
      border: 4px solid var(--border-color);
      border-top-color: #3b82f6;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 1rem;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    @media (max-width: 768px) {
      .page-container {
        padding: 1rem;
      }

      .teachers-grid {
        grid-template-columns: 1fr;
      }

      .teacher-actions {
        grid-template-columns: 1fr;
      }
    }

    /* Modal styles */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 1rem;
    }

    .modal-content {
      background: var(--card-bg);
      border-radius: 1rem;
      width: 100%;
      max-width: 600px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    }

    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1.5rem;
      border-bottom: 1px solid var(--border-color);
    }

    .modal-header h2 {
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0;
    }

    .close-btn {
      background: none;
      border: none;
      color: var(--text-secondary);
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 0.5rem;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .close-btn:hover {
      background: var(--bg-secondary);
      color: var(--text-primary);
    }

    .modal-body {
      padding: 1.5rem;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .form-group {
      margin-bottom: 1rem;
    }

    .form-group label {
      display: block;
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 0.5rem;
    }

    .form-input {
      width: 100%;
      padding: 0.625rem 0.875rem;
      border: 1px solid var(--border-color);
      border-radius: 0.5rem;
      font-size: 0.875rem;
      color: var(--text-primary);
      background: var(--input-bg);
      transition: all 0.2s;
    }

    .form-input:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .modal-footer {
      display: flex;
      gap: 0.75rem;
      padding: 1.5rem;
      border-top: 1px solid var(--border-color);
      justify-content: flex-end;
    }

    .btn-primary {
      background-color: #3b82f6;
      color: white;
      border: 1px solid #3b82f6;
    }

    .btn-primary:hover {
      background-color: #2563eb;
      border-color: #2563eb;
    }

    @media (max-width: 640px) {
      .form-row {
        grid-template-columns: 1fr;
      }

      .modal-footer {
        flex-direction: column-reverse;
      }

      .modal-footer .btn {
        width: 100%;
      }
    }
  `]
})
export class EnseignantsComponent implements OnInit {
  teachers: Teacher[] = [];
  loading = false;
  deletingTeacherId: string | null = null;
  
  // Modal de modification
  showEditModal = false;
  editingTeacher: Teacher | null = null;
  editForm = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    specialty: '',
    title: 'NONE'
  };

  constructor(
    private teacherService: TeacherService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadTeachers();
  }

  loadTeachers() {
    this.loading = true;
    this.cdr.detectChanges();
    
    // Utiliser getAllActiveTeachers qui appelle /api/admin/teachers
    this.teacherService.getAllActiveTeachers().subscribe({
      next: (response) => {
        console.log('📚 Enseignants reçus:', response);
        this.teachers = response.data || [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('❌ Erreur lors du chargement des enseignants:', error);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  getTeacherTitle(teacher: Teacher): string {
    const title = (teacher as any).title || (teacher as any).user?.title;
    
    if (!title || title === 'NONE') {
      return '';
    }
    
    const titles: { [key: string]: string } = {
      'ENGINEER': 'Ing.',
      'DOCTOR': 'Dr.',
      'PROFESSOR': 'Pr.'
    };
    
    return titles[title] || '';
  }

  getTeacherFirstName(teacher: Teacher): string {
    return teacher.firstName || (teacher as any).user?.firstName || '';
  }

  getTeacherLastName(teacher: Teacher): string {
    return teacher.lastName || (teacher as any).user?.lastName || '';
  }

  getTeacherEmail(teacher: Teacher): string {
    return teacher.email || (teacher as any).user?.email || '';
  }

  getTeacherCreatedAt(teacher: Teacher): string | Date | undefined {
    return teacher.createdAt || (teacher as any).user?.createdAt;
  }

  getSchoolName(school: any): string {
    // Si school est un objet avec une propriété name
    if (typeof school === 'object' && school !== null) {
      return school.name || school.schoolName || 'École inconnue';
    }
    
    // Si school est une chaîne (enum)
    if (typeof school === 'string') {
      const schoolNames: { [key: string]: string } = {
        'SAINT_JEAN_INGENIEUR': 'SJI',
        'SAINT_JEAN_MANAGEMENT': 'SJM',
        'PREPAVOGT': 'Prépa Vogt',
        'CPGE': 'CPGE'
      };
      
      return schoolNames[school] || school;
    }
    
    return 'École inconnue';
  }

  formatDate(dateString: string | Date | undefined): string {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long'
    };
    return date.toLocaleDateString('fr-FR', options);
  }

  viewDetails(teacher: Teacher) {
    console.log('Voir détails:', teacher);
    // TODO: Navigate to teacher details page or open modal
  }

  viewAvailability(teacher: Teacher) {
    console.log('Voir disponibilités:', teacher);
    // TODO: Navigate to availability page with teacher filter
  }

  editTeacher(teacher: Teacher) {
    console.log('Modifier enseignant:', teacher);
    this.editingTeacher = teacher;
    this.editForm = {
      firstName: this.getTeacherFirstName(teacher),
      lastName: this.getTeacherLastName(teacher),
      email: this.getTeacherEmail(teacher),
      phone: (teacher as any).phone || (teacher as any).user?.phone || '',
      specialty: teacher.specialty || '',
      title: (teacher as any).title || (teacher as any).user?.title || 'NONE'
    };
    this.showEditModal = true;
    this.cdr.detectChanges();
  }

  closeEditModal() {
    this.showEditModal = false;
    this.editingTeacher = null;
    this.cdr.detectChanges();
  }

  saveTeacher() {
    if (!this.editingTeacher) return;

    const teacherId = (this.editingTeacher as any).id || this.editingTeacher.teacherId || this.editingTeacher.id;
    
    if (!teacherId) {
      alert('Impossible de modifier cet enseignant : ID manquant');
      return;
    }

    const updateData = {
      firstName: this.editForm.firstName,
      lastName: this.editForm.lastName,
      email: this.editForm.email,
      phone: this.editForm.phone,
      specialty: this.editForm.specialty,
      title: this.editForm.title
    };

    this.teacherService.updateTeacher(teacherId, updateData).subscribe({
      next: (response) => {
        console.log('✅ Enseignant modifié:', response);
        alert('Enseignant modifié avec succès');
        this.closeEditModal();
        this.loadTeachers();
      },
      error: (error) => {
        console.error('❌ Erreur lors de la modification:', error);
        alert(`Erreur lors de la modification : ${error.error?.message || error.message || 'Erreur inconnue'}`);
      }
    });
  }

  deleteTeacher(teacher: Teacher) {
    const teacherName = `${this.getTeacherFirstName(teacher)} ${this.getTeacherLastName(teacher)}`;
    
    if (!confirm(`Êtes-vous sûr de vouloir supprimer l'enseignant ${teacherName} ?\n\nCette action est irréversible.`)) {
      return;
    }

    // Le backend renvoie un objet avec 'id' (teacher ID) et 'user' (objet user)
    // Essayer d'abord l'ID direct, puis teacherId, puis l'ID dans l'objet teacher
    const teacherId = (teacher as any).id || teacher.teacherId || teacher.id;
    
    console.log('🔍 Debug - Teacher object:', teacher);
    console.log('🔍 Debug - Teacher ID extrait:', teacherId);
    
    if (!teacherId) {
      alert('Impossible de supprimer cet enseignant : ID manquant');
      return;
    }

    this.deletingTeacherId = teacherId;
    this.cdr.detectChanges();

    this.teacherService.deleteTeacher(teacherId).subscribe({
      next: (response) => {
        console.log('✅ Enseignant supprimé:', response);
        alert(`L'enseignant ${teacherName} a été supprimé avec succès`);
        
        // Recharger la liste
        this.loadTeachers();
        this.deletingTeacherId = null;
      },
      error: (error) => {
        console.error('❌ Erreur lors de la suppression:', error);
        alert(`Erreur lors de la suppression de l'enseignant : ${error.error?.message || error.message || 'Erreur inconnue'}`);
        this.deletingTeacherId = null;
        this.cdr.detectChanges();
      }
    });
  }
}