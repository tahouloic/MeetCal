import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClassGroupService } from '../../services/class-group.service';
import { FieldOfStudyService } from '../../services/field-of-study.service';
import { ClassGroup, ClassGroupRequest, Language } from '../../models/class-group';
import { FieldOfStudy } from '../../models/field-of-study';

@Component({
  selector: 'app-classes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './classes.html',
  styleUrls: ['./classes.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClassesComponent implements OnInit {
  classGroups: ClassGroup[] = [];
  fieldsOfStudy: FieldOfStudy[] = [];
  loading = false;
  loadingFields = false;
  showModal = false;
  isEditMode = false;
  
  classForm: ClassGroupRequest = {
    fieldOfStudyId: '',
    level: '',
    language: Language.NONE
  };
  
  selectedClassId: string | null = null;
  errorMessage = '';
  successMessage = '';

  // Options pour les langues
  languages = [
    { value: Language.FR, label: 'Français' },
    { value: Language.EN, label: 'Anglais' },
    { value: Language.NONE, label: 'Aucune' }
  ];

  constructor(
    private classGroupService: ClassGroupService,
    private fieldOfStudyService: FieldOfStudyService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadFieldsOfStudy();
    this.loadClassGroups();
  }

  loadFieldsOfStudy(): void {
    this.loadingFields = true;
    this.cdr.detectChanges();
    
    this.fieldOfStudyService.getAll().subscribe({
      next: (fields) => {
        this.fieldsOfStudy = fields;
        this.loadingFields = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Erreur chargement filières:', error);
        this.loadingFields = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadClassGroups(): void {
    this.loading = true;
    this.cdr.detectChanges();
    
    this.classGroupService.getAllClassGroups().subscribe({
      next: (response) => {
        if (response.success) {
          this.classGroups = response.data;
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Erreur chargement classes:', error);
        this.errorMessage = 'Erreur lors du chargement des classes';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  openCreateModal(): void {
    this.isEditMode = false;
    this.classForm = {
      fieldOfStudyId: '',
      level: '',
      language: Language.NONE
    };
    this.selectedClassId = null;
    this.showModal = true;
    this.errorMessage = '';
    this.successMessage = '';
  }

  openEditModal(classGroup: ClassGroup): void {
    this.isEditMode = true;
    this.classForm = {
      fieldOfStudyId: classGroup.fieldOfStudyId || '',
      level: classGroup.level,
      language: classGroup.language
    };
    this.selectedClassId = classGroup.id;
    this.showModal = true;
    this.errorMessage = '';
    this.successMessage = '';
  }

  closeModal(): void {
    this.showModal = false;
    this.classForm = {
      fieldOfStudyId: '',
      level: '',
      language: Language.NONE
    };
    this.selectedClassId = null;
    this.errorMessage = '';
    this.successMessage = '';
  }

  saveClass(): void {
    if (!this.classForm.fieldOfStudyId || !this.classForm.level.trim()) {
      this.errorMessage = 'La filière et le niveau sont obligatoires';
      this.cdr.detectChanges();
      return;
    }

    this.loading = true;
    this.cdr.detectChanges();
    
    if (this.isEditMode && this.selectedClassId) {
      this.classGroupService.updateClassGroup(this.selectedClassId, this.classForm).subscribe({
        next: (response) => {
          if (response.success) {
            this.successMessage = 'Classe modifiée avec succès';
            this.loadClassGroups();
            setTimeout(() => this.closeModal(), 1500);
          }
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Erreur modification classe:', error);
          this.errorMessage = error.error?.message || 'Erreur lors de la modification';
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
    } else {
      this.classGroupService.createClassGroup(this.classForm).subscribe({
        next: (response) => {
          if (response.success) {
            this.successMessage = 'Classe créée avec succès';
            this.loadClassGroups();
            setTimeout(() => this.closeModal(), 1500);
          }
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Erreur création classe:', error);
          this.errorMessage = error.error?.message || 'Erreur lors de la création';
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
    }
  }

  deleteClass(classGroup: ClassGroup): void {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer la classe "${classGroup.name}" ?`)) {
      return;
    }

    this.loading = true;
    this.cdr.detectChanges();
    
    this.classGroupService.deleteClassGroup(classGroup.id).subscribe({
      next: (response) => {
        if (response.success) {
          this.successMessage = 'Classe supprimée avec succès';
          this.loadClassGroups();
          setTimeout(() => {
            this.successMessage = '';
            this.cdr.detectChanges();
          }, 3000);
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Erreur suppression classe:', error);
        this.errorMessage = error.error?.message || 'Erreur lors de la suppression';
        this.loading = false;
        this.cdr.detectChanges();
        setTimeout(() => {
          this.errorMessage = '';
          this.cdr.detectChanges();
        }, 3000);
      }
    });
  }

  getLanguageLabel(language: Language): string {
    if (language === Language.NONE) return '';
    const labels: { [key: string]: string } = {
      'FR': 'FR',
      'EN': 'EN'
    };
    return labels[language] || language;
  }
}
