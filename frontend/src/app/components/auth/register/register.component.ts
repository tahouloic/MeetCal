import { Component, OnInit, inject, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

type AccountType = 'INDIVIDUAL' | 'BUSINESS';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RegisterComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  accountType: AccountType = 'INDIVIDUAL';
  registerForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  // Options pour les enums
  occupations = [
    { value: 'STUDENT', label: 'Étudiant' },
    { value: 'EMPLOYEE', label: 'Employé' },
    { value: 'SELF_EMPLOYED', label: 'Indépendant' },
    { value: 'UNEMPLOYED', label: 'Sans emploi' },
    { value: 'RETIRED', label: 'Retraité' },
    { value: 'OTHER', label: 'Autre' }
  ];

  educationLevels = [
    { value: 'NO_DIPLOMA', label: 'Sans diplôme' },
    { value: 'HIGH_SCHOOL', label: 'Baccalauréat' },
    { value: 'BACHELOR', label: 'Licence' },
    { value: 'MASTER', label: 'Master' },
    { value: 'PHD', label: 'Doctorat' },
    { value: 'OTHER', label: 'Autre' }
  ];

  businessSectors = [
    { value: 'TECHNOLOGY', label: 'Technologie' },
    { value: 'HEALTH', label: 'Santé' },
    { value: 'EDUCATION', label: 'Éducation' },
    { value: 'FINANCE', label: 'Finance' },
    { value: 'RETAIL', label: 'Commerce' },
    { value: 'SERVICES', label: 'Services' },
    { value: 'INDUSTRY', label: 'Industrie' },
    { value: 'OTHER', label: 'Autre' }
  ];

  legalStatuses = [
    { value: 'SOLE_PROPRIETORSHIP', label: 'Entreprise individuelle' },
    { value: 'LLC', label: 'SARL' },
    { value: 'CORPORATION', label: 'SA' },
    { value: 'PARTNERSHIP', label: 'SNC' },
    { value: 'COOPERATIVE', label: 'Coopérative' },
    { value: 'ASSOCIATION', label: 'Association' },
    { value: 'OTHER', label: 'Autre' }
  ];

  genders = [
    { value: 'MALE', label: 'Homme' },
    { value: 'FEMALE', label: 'Femme' },
    { value: 'OTHER', label: 'Autre' }
  ];

  constructor() {
    this.registerForm = this.createIndividualForm();
  }

  ngOnInit(): void {
    console.log('📝 RegisterComponent: Initialisation');
  }

  switchAccountType(type: AccountType): void {
    this.accountType = type;
    this.errorMessage = '';
    this.successMessage = '';
    
    if (type === 'INDIVIDUAL') {
      this.registerForm = this.createIndividualForm();
    } else {
      this.registerForm = this.createBusinessForm();
    }
    
    this.cdr.detectChanges();
  }

  private createIndividualForm(): FormGroup {
    return this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.minLength(9), Validators.maxLength(20)]],
      occupation: [null, [Validators.required]],
      educationLevel: [null, [Validators.required]],
      gender: [null, [Validators.required]]
    });
  }

  private createBusinessForm(): FormGroup {
    return this.fb.group({
      companyName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(200)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.minLength(9), Validators.maxLength(20)]],
      businessSector: [null, [Validators.required]],
      legalStatus: [null, [Validators.required]]
    });
  }

  onRegister(): void {
    if (this.registerForm.valid) {
      this.errorMessage = '';
      this.successMessage = '';
      this.isLoading = true;
      this.cdr.detectChanges();
      
      console.log('📝 RegisterComponent: Envoi de la demande d\'inscription');
      console.log('📋 Type:', this.accountType);
      console.log('📋 Données brutes:', this.registerForm.value);
      console.log('📋 Données JSON:', JSON.stringify(this.registerForm.value, null, 2));
      
      // Vérifier que tous les champs requis sont présents
      const formData = this.registerForm.value;
      if (this.accountType === 'INDIVIDUAL') {
        console.log('✅ Validation INDIVIDUAL:');
        console.log('  - firstName:', formData.firstName, '(length:', formData.firstName?.length, ')');
        console.log('  - lastName:', formData.lastName, '(length:', formData.lastName?.length, ')');
        console.log('  - email:', formData.email);
        console.log('  - phone:', formData.phone, '(length:', formData.phone?.length, ')');
        console.log('  - occupation:', formData.occupation);
        console.log('  - educationLevel:', formData.educationLevel);
        console.log('  - gender:', formData.gender);
        
        // Vérifier que les enums ne sont pas null
        if (!formData.occupation || !formData.educationLevel || !formData.gender) {
          console.error('❌ Erreur: Un ou plusieurs champs enum sont null');
          this.errorMessage = 'Veuillez remplir tous les champs obligatoires';
          this.isLoading = false;
          this.cdr.detectChanges();
          return;
        }
      }
      
      const registerObservable = this.accountType === 'INDIVIDUAL'
        ? this.authService.registerIndividual(this.registerForm.value)
        : this.authService.registerBusiness(this.registerForm.value);
      
      registerObservable.subscribe({
        next: (response) => {
          console.log('✅ RegisterComponent: Inscription réussie:', response);
          this.isLoading = false;
          
          if (response.success) {
            this.successMessage = 'Votre compte a été créé avec succès ! Un mot de passe a été envoyé à votre adresse email. Vous pouvez maintenant vous connecter.';
            this.registerForm.reset();
            this.cdr.detectChanges();
            
            // Rediriger vers la page de connexion après 5 secondes
            setTimeout(() => {
              this.router.navigate(['/login']);
            }, 5000);
          } else {
            this.errorMessage = response.message || 'Une erreur est survenue';
            this.cdr.detectChanges();
          }
        },
        error: (error) => {
          console.error('❌ RegisterComponent: Erreur d\'inscription:', error);
          this.isLoading = false;
          this.errorMessage = error.error?.message || error.error?.error || 'Une erreur est survenue lors de l\'inscription';
          this.cdr.detectChanges();
        }
      });
    } else {
      this.markFormGroupTouched(this.registerForm);
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  // Getters pour la validation des formulaires - INDIVIDUAL
  get firstName() { return this.registerForm.get('firstName'); }
  get lastName() { return this.registerForm.get('lastName'); }
  get occupation() { return this.registerForm.get('occupation'); }
  get educationLevel() { return this.registerForm.get('educationLevel'); }
  get gender() { return this.registerForm.get('gender'); }
  
  // Getters pour la validation des formulaires - BUSINESS
  get companyName() { return this.registerForm.get('companyName'); }
  get businessSector() { return this.registerForm.get('businessSector'); }
  get legalStatus() { return this.registerForm.get('legalStatus'); }
  
  // Getters communs
  get email() { return this.registerForm.get('email'); }
  get phone() { return this.registerForm.get('phone'); }
}
