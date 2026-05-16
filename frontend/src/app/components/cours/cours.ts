import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CourseService } from '../../services/course.service';
import { FieldOfStudyService } from '../../services/field-of-study.service';
import { Course, CourseRequest } from '../../models/course';
import { FieldOfStudy } from '../../models/field-of-study';

@Component({
  selector: 'app-cours',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cours.html',
  styleUrls: ['./cours.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CoursComponent implements OnInit {
  courses: Course[] = [];
  fieldsOfStudy: FieldOfStudy[] = [];
  loading = false;
  loadingFields = false;
  showModal = false;
  isEditMode = false;
  
  courseForm: CourseRequest = {
    label: '',
    fieldOfStudyId: ''
  };
  
  selectedCourseId: string | null = null;
  errorMessage = '';
  successMessage = '';

  constructor(
    private courseService: CourseService,
    private fieldOfStudyService: FieldOfStudyService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadFieldsOfStudy();
    this.loadCourses();
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

  loadCourses(): void {
    this.loading = true;
    this.cdr.detectChanges();
    
    this.courseService.getAllCourses().subscribe({
      next: (response) => {
        if (response.success) {
          this.courses = response.data;
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Erreur chargement cours:', error);
        this.errorMessage = 'Erreur lors du chargement des cours';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  openCreateModal(): void {
    this.isEditMode = false;
    this.courseForm = {
      label: '',
      fieldOfStudyId: ''
    };
    this.selectedCourseId = null;
    this.showModal = true;
    this.errorMessage = '';
    this.successMessage = '';
  }

  openEditModal(course: Course): void {
    this.isEditMode = true;
    this.courseForm = {
      label: course.label,
      fieldOfStudyId: course.fieldOfStudyId || ''
    };
    this.selectedCourseId = course.id;
    this.showModal = true;
    this.errorMessage = '';
    this.successMessage = '';
  }

  closeModal(): void {
    this.showModal = false;
    this.courseForm = {
      label: '',
      fieldOfStudyId: ''
    };
    this.selectedCourseId = null;
    this.errorMessage = '';
    this.successMessage = '';
  }

  saveCourse(): void {
    if (!this.courseForm.label.trim() || !this.courseForm.fieldOfStudyId) {
      this.errorMessage = 'Le libellé et la filière sont obligatoires';
      this.cdr.detectChanges();
      return;
    }

    this.loading = true;
    this.cdr.detectChanges();
    
    if (this.isEditMode && this.selectedCourseId) {
      this.courseService.updateCourse(this.selectedCourseId, this.courseForm).subscribe({
        next: (response) => {
          if (response.success) {
            this.successMessage = 'Cours modifié avec succès';
            this.loadCourses();
            setTimeout(() => this.closeModal(), 1500);
          }
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Erreur modification cours:', error);
          this.errorMessage = error.error?.message || 'Erreur lors de la modification';
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
    } else {
      this.courseService.createCourse(this.courseForm).subscribe({
        next: (response) => {
          if (response.success) {
            this.successMessage = 'Cours créé avec succès';
            this.loadCourses();
            setTimeout(() => this.closeModal(), 1500);
          }
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Erreur création cours:', error);
          this.errorMessage = error.error?.message || 'Erreur lors de la création';
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
    }
  }

  deleteCourse(course: Course): void {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le cours "${course.name}" ?`)) {
      return;
    }

    this.loading = true;
    this.cdr.detectChanges();
    
    this.courseService.deleteCourse(course.id).subscribe({
      next: (response) => {
        if (response.success) {
          this.successMessage = 'Cours supprimé avec succès';
          this.loadCourses();
          setTimeout(() => {
            this.successMessage = '';
            this.cdr.detectChanges();
          }, 3000);
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Erreur suppression cours:', error);
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
}
