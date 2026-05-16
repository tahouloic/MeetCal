import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { School, SchoolRequest } from '../../models/school';
import { SchoolService } from '../../services/school.service';

@Component({
  selector: 'app-ecoles',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ecoles.html',
  styleUrls: ['./ecoles.scss']
})
export class EcolesComponent implements OnInit {
  schools: School[] = [];
  filteredSchools: School[] = [];
  searchTerm = '';
  isLoading = false;
  error = '';
  
  showModal = false;
  isEditMode = false;
  currentSchool: School | null = null;
  
  formData: SchoolRequest = {
    code: '',
    name: '',
    abbreviation: ''
  };

  constructor(
    private schoolService: SchoolService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadSchools();
  }

  loadSchools(): void {
    this.isLoading = true;
    this.cdr.detectChanges();
    
    this.schoolService.getAll().subscribe({
      next: (data) => {
        this.schools = data;
        this.filteredSchools = data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des écoles';
        this.isLoading = false;
        this.cdr.detectChanges();
        console.error(err);
      }
    });
  }

  onSearch(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredSchools = this.schools.filter(school =>
      school.name.toLowerCase().includes(term) ||
      school.code.toLowerCase().includes(term) ||
      school.abbreviation.toLowerCase().includes(term)
    );
  }

  openCreateModal(): void {
    this.isEditMode = false;
    this.currentSchool = null;
    this.formData = {
      code: '',
      name: '',
      abbreviation: ''
    };
    this.showModal = true;
  }

  openEditModal(school: School): void {
    this.isEditMode = true;
    this.currentSchool = school;
    this.formData = {
      code: school.code,
      name: school.name,
      abbreviation: school.abbreviation
    };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.currentSchool = null;
    this.error = '';
  }

  onSubmit(): void {
    if (!this.formData.code || !this.formData.name || !this.formData.abbreviation) {
      this.error = 'Tous les champs sont obligatoires';
      this.cdr.detectChanges();
      return;
    }

    this.isLoading = true;
    this.error = '';
    this.cdr.detectChanges();

    if (this.isEditMode && this.currentSchool) {
      this.schoolService.update(this.currentSchool.id, this.formData).subscribe({
        next: () => {
          this.loadSchools();
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
      this.schoolService.create(this.formData).subscribe({
        next: () => {
          this.loadSchools();
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

  deleteSchool(school: School): void {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer l'école "${school.name}" ?`)) {
      return;
    }

    this.isLoading = true;
    this.cdr.detectChanges();
    
    this.schoolService.delete(school.id).subscribe({
      next: () => {
        this.loadSchools();
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
