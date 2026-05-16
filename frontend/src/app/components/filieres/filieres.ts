import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FieldOfStudy, FieldOfStudyRequest } from '../../models/field-of-study';
import { School } from '../../models/school';
import { FieldOfStudyService } from '../../services/field-of-study.service';
import { SchoolService } from '../../services/school.service';

@Component({
  selector: 'app-filieres',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './filieres.html',
  styleUrls: ['./filieres.scss']
})
export class FilieresComponent implements OnInit {
  fieldsOfStudy: FieldOfStudy[] = [];
  filteredFieldsOfStudy: FieldOfStudy[] = [];
  schools: School[] = [];
  searchTerm = '';
  isLoading = false;
  error = '';
  
  showModal = false;
  isEditMode = false;
  currentFieldOfStudy: FieldOfStudy | null = null;
  
  formData: FieldOfStudyRequest = {
    label: '',
    schoolId: ''
  };

  constructor(
    private fieldOfStudyService: FieldOfStudyService,
    private schoolService: SchoolService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadSchools();
    this.loadFieldsOfStudy();
  }

  loadSchools(): void {
    this.schoolService.getAll().subscribe({
      next: (data) => {
        this.schools = data;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur lors du chargement des écoles', err);
        this.cdr.detectChanges();
      }
    });
  }

  loadFieldsOfStudy(): void {
    this.isLoading = true;
    this.error = '';
    this.cdr.detectChanges();
    
    this.fieldOfStudyService.getAll().subscribe({
      next: (data) => {
        this.fieldsOfStudy = data;
        this.filteredFieldsOfStudy = data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des filières';
        this.isLoading = false;
        this.cdr.detectChanges();
        console.error(err);
      }
    });
  }

  onSearch(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredFieldsOfStudy = this.fieldsOfStudy.filter(field =>
      field.name.toLowerCase().includes(term) ||
      field.label.toLowerCase().includes(term) ||
      field.school.name.toLowerCase().includes(term)
    );
  }

  openCreateModal(): void {
    this.isEditMode = false;
    this.currentFieldOfStudy = null;
    this.formData = {
      label: '',
      schoolId: ''
    };
    this.showModal = true;
  }

  openEditModal(field: FieldOfStudy): void {
    this.isEditMode = true;
    this.currentFieldOfStudy = field;
    this.formData = {
      label: field.label,
      schoolId: field.school.id
    };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.currentFieldOfStudy = null;
    this.error = '';
  }

  onSubmit(): void {
    if (!this.formData.label || !this.formData.schoolId) {
      this.error = 'Tous les champs sont obligatoires';
      this.cdr.detectChanges();
      return;
    }

    this.isLoading = true;
    this.error = '';
    this.cdr.detectChanges();

    if (this.isEditMode && this.currentFieldOfStudy) {
      this.fieldOfStudyService.update(this.currentFieldOfStudy.id, this.formData).subscribe({
        next: () => {
          this.loadFieldsOfStudy();
          this.closeModal();
        },
        error: (err) => {
          this.error = 'Erreur lors de la modification';
          this.isLoading = false;
          this.cdr.detectChanges();
          console.error(err);
        }
      });
    } else {
      this.fieldOfStudyService.create(this.formData).subscribe({
        next: () => {
          this.loadFieldsOfStudy();
          this.closeModal();
        },
        error: (err) => {
          this.error = 'Erreur lors de la création';
          this.isLoading = false;
          this.cdr.detectChanges();
          console.error(err);
        }
      });
    }
  }

  deleteFieldOfStudy(field: FieldOfStudy): void {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer la filière "${field.name}" ?`)) {
      return;
    }

    this.isLoading = true;
    this.cdr.detectChanges();
    
    this.fieldOfStudyService.delete(field.id).subscribe({
      next: () => {
        this.loadFieldsOfStudy();
      },
      error: (err) => {
        this.error = 'Erreur lors de la suppression';
        this.isLoading = false;
        this.cdr.detectChanges();
        console.error(err);
      }
    });
  }
}
