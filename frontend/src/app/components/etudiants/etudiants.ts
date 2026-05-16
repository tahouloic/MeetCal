import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StudentService } from '../../services/student.service';
import { ClassGroupService } from '../../services/class-group.service';
import { Student, StudentRequest, Gender } from '../../models/student';
import { ClassGroup } from '../../models/class-group';
import { SchoolEnum } from '../../models/school.enum';

@Component({
  selector: 'app-etudiants',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './etudiants.html',
  styleUrls: ['./etudiants.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EtudiantsComponent implements OnInit {
  students: Student[] = [];
  classGroups: ClassGroup[] = [];
  loading = false;
  showModal = false;
  showImportModal = false;
  isEditMode = false;
  
  studentForm: StudentRequest = {
    firstName: '',
    lastName: '',
    gender: Gender.MALE,
    dateOfBirth: '',
    classGroupId: '',
    school: SchoolEnum.SJI
  };
  
  selectedStudentId: string | null = null;
  selectedFile: File | null = null;
  errorMessage = '';
  successMessage = '';
  importResult: any = null;

  // Options pour les dropdowns
  genders = [
    { value: Gender.MALE, label: 'Masculin' },
    { value: Gender.FEMALE, label: 'Féminin' },
    { value: Gender.OTHER, label: 'Autre' }
  ];

  schools = [
    { value: SchoolEnum.SJI, label: 'SJI' },
    { value: SchoolEnum.SJM, label: 'SJM' },
    { value: SchoolEnum.PREPA_VOGT, label: 'Prépa Vogt' },
    { value: SchoolEnum.CPGE, label: 'CPGE' }
  ];

  constructor(
    private studentService: StudentService,
    private classGroupService: ClassGroupService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadStudents();
    this.loadClassGroups();
  }

  loadStudents(): void {
    this.loading = true;
    this.cdr.detectChanges();
    
    this.studentService.getAllStudents().subscribe({
      next: (response) => {
        if (response.success) {
          this.students = response.data;
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Erreur chargement étudiants:', error);
        this.errorMessage = 'Erreur lors du chargement des étudiants';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadClassGroups(): void {
    this.classGroupService.getAllClassGroups().subscribe({
      next: (response) => {
        if (response.success) {
          this.classGroups = response.data;
          this.cdr.detectChanges();
        }
      },
      error: (error) => {
        console.error('Erreur chargement classes:', error);
      }
    });
  }

  openCreateModal(): void {
    this.isEditMode = false;
    this.studentForm = {
      firstName: '',
      lastName: '',
      gender: Gender.MALE,
      dateOfBirth: '',
      classGroupId: '',
      school: SchoolEnum.SJI
    };
    this.selectedStudentId = null;
    this.showModal = true;
    this.errorMessage = '';
    this.successMessage = '';
  }

  openEditModal(student: Student): void {
    this.isEditMode = true;
    this.studentForm = {
      firstName: student.firstName,
      lastName: student.lastName,
      gender: student.gender,
      dateOfBirth: student.dateOfBirth,
      classGroupId: student.classGroup.id,
      school: student.school
    };
    this.selectedStudentId = student.id;
    this.showModal = true;
    this.errorMessage = '';
    this.successMessage = '';
  }

  openImportModal(): void {
    this.showImportModal = true;
    this.selectedFile = null;
    this.importResult = null;
    this.errorMessage = '';
    this.successMessage = '';
  }

  closeModal(): void {
    this.showModal = false;
    this.studentForm = {
      firstName: '',
      lastName: '',
      gender: Gender.MALE,
      dateOfBirth: '',
      classGroupId: '',
      school: SchoolEnum.SJI
    };
    this.selectedStudentId = null;
    this.errorMessage = '';
    this.successMessage = '';
  }

  closeImportModal(): void {
    this.showImportModal = false;
    this.selectedFile = null;
    this.importResult = null;
    this.errorMessage = '';
    this.successMessage = '';
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      if (!file.name.endsWith('.csv')) {
        this.errorMessage = 'Le fichier doit être au format CSV';
        this.selectedFile = null;
        this.cdr.detectChanges();
        return;
      }
      this.selectedFile = file;
      this.errorMessage = '';
      this.cdr.detectChanges();
    }
  }

  importCsv(): void {
    if (!this.selectedFile) {
      this.errorMessage = 'Veuillez sélectionner un fichier CSV';
      this.cdr.detectChanges();
      return;
    }

    this.loading = true;
    this.cdr.detectChanges();
    
    this.studentService.importStudentsFromCsv(this.selectedFile).subscribe({
      next: (response) => {
        if (response.success) {
          this.importResult = response.data;
          this.successMessage = `Import terminé: ${response.data.successCount} succès, ${response.data.errorCount} erreurs`;
          this.loadStudents();
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Erreur import CSV:', error);
        this.errorMessage = error.error?.message || 'Erreur lors de l\'import';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  saveStudent(): void {
    if (!this.studentForm.firstName.trim() || !this.studentForm.lastName.trim()) {
      this.errorMessage = 'Le nom et le prénom sont obligatoires';
      this.cdr.detectChanges();
      return;
    }
    if (!this.studentForm.dateOfBirth) {
      this.errorMessage = 'La date de naissance est obligatoire';
      this.cdr.detectChanges();
      return;
    }
    if (!this.studentForm.classGroupId) {
      this.errorMessage = 'La classe est obligatoire';
      this.cdr.detectChanges();
      return;
    }

    this.loading = true;
    this.cdr.detectChanges();
    
    if (this.isEditMode && this.selectedStudentId) {
      this.studentService.updateStudent(this.selectedStudentId, this.studentForm).subscribe({
        next: (response) => {
          if (response.success) {
            this.successMessage = 'Étudiant modifié avec succès';
            this.loadStudents();
            setTimeout(() => this.closeModal(), 1500);
          }
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Erreur modification étudiant:', error);
          this.errorMessage = error.error?.message || 'Erreur lors de la modification';
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
    } else {
      this.studentService.createStudent(this.studentForm).subscribe({
        next: (response) => {
          if (response.success) {
            this.successMessage = 'Étudiant créé avec succès';
            this.loadStudents();
            setTimeout(() => this.closeModal(), 1500);
          }
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Erreur création étudiant:', error);
          this.errorMessage = error.error?.message || 'Erreur lors de la création';
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
    }
  }

  deleteStudent(student: Student): void {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer l'étudiant "${student.firstName} ${student.lastName}" ?`)) {
      return;
    }

    this.loading = true;
    this.cdr.detectChanges();
    
    this.studentService.deleteStudent(student.id).subscribe({
      next: (response) => {
        if (response.success) {
          this.successMessage = 'Étudiant supprimé avec succès';
          this.loadStudents();
          setTimeout(() => {
            this.successMessage = '';
            this.cdr.detectChanges();
          }, 3000);
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Erreur suppression étudiant:', error);
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

  getGenderLabel(gender: Gender): string {
    const g = this.genders.find(gen => gen.value === gender);
    return g ? g.label : gender;
  }

  getLanguageLabel(language: string): string {
    const languages: { [key: string]: string } = {
      'FR': 'FR',
      'EN': 'EN',
      'NONE': ''
    };
    return languages[language] || language;
  }

  downloadCsvTemplate(): void {
    const csvContent = 'firstName,lastName,gender,dateOfBirth,classCode\n' +
                       'Jean,Dupont,MALE,2000-05-15,CLS-SJI-4-FR-001\n' +
                       'Marie,Martin,FEMALE,2001-03-20,CLS-SJI-4-FR-001';
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'template_etudiants.csv';
    link.click();
    window.URL.revokeObjectURL(url);
  }
}
