import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { 
  AvailabilityService, 
  SaveAvailabilitiesRequest, 
  AvailabilitySlotResponse 
} from '../../services/availability.service';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';

interface DayInfo {
  value: string;
  label: string;
}

@Component({
  selector: 'app-disponibilites',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './disponibilites.html',
  styleUrls: ['./disponibilites.scss']
})
export class DisponibilitesComponent implements OnInit {
  // Jours de la semaine
  days: DayInfo[] = [
    { value: 'MONDAY', label: 'Lundi' },
    { value: 'TUESDAY', label: 'Mardi' },
    { value: 'WEDNESDAY', label: 'Mercredi' },
    { value: 'THURSDAY', label: 'Jeudi' },
    { value: 'FRIDAY', label: 'Vendredi' },
    { value: 'SATURDAY', label: 'Samedi' }
  ];

  // Heures (8h à 20h)
  hours: number[] = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

  // Créneaux sélectionnés (format: "MONDAY-8", "TUESDAY-9")
  selectedSlots = new Set<string>();

  // État
  isAdmin = signal(false);
  selectedTeacherId = signal('');
  teachers = signal<any[]>([]);
  isSaving = signal(false);
  isLoading = signal(false);
  message = signal('');
  messageType = signal<'success' | 'error' | ''>('');

  constructor(
    private availabilityService: AvailabilityService,
    private authService: AuthService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    // Vérifier le rôle de l'utilisateur
    this.authService.authState$.subscribe(authState => {
      if (authState.user) {
        this.isAdmin.set(authState.user.role === 'ADMIN');
        
        if (this.isAdmin()) {
          // Charger la liste des enseignants pour l'admin
          this.loadTeachers();
        } else {
          // Charger les disponibilités de l'enseignant connecté
          this.loadMyAvailabilities();
        }
      }
    });
  }

  loadTeachers() {
    this.isLoading.set(true);
    // Charger la liste des enseignants validés
    this.http.get<any>(`${environment.apiUrl}/admin/teachers?status=ACTIVE`).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.teachers.set(response.data.content || response.data);
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des enseignants:', error);
        this.isLoading.set(false);
      }
    });
  }

  onTeacherChange() {
    const teacherId = this.selectedTeacherId();
    if (teacherId) {
      this.loadTeacherAvailabilities(teacherId);
    } else {
      this.selectedSlots.clear();
    }
  }

  loadMyAvailabilities() {
    this.isLoading.set(true);
    this.availabilityService.getMyAvailabilities().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.populateSlotsFromResponse(response.data.availabilities);
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des disponibilités:', error);
        this.isLoading.set(false);
      }
    });
  }

  loadTeacherAvailabilities(teacherId: string) {
    this.isLoading.set(true);
    this.availabilityService.getTeacherAvailabilities(teacherId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.populateSlotsFromResponse(response.data.availabilities);
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des disponibilités:', error);
        this.isLoading.set(false);
      }
    });
  }

  populateSlotsFromResponse(availabilities: AvailabilitySlotResponse[]) {
    this.selectedSlots.clear();
    availabilities.forEach(slot => {
      const hour = parseInt(slot.startTime.split(':')[0]);
      this.selectedSlots.add(`${slot.dayOfWeek}-${hour}`);
    });
  }

  toggleSlot(day: string, hour: number) {
    if (this.isAdmin()) return; // Admin ne peut pas cliquer

    const key = `${day}-${hour}`;
    if (this.selectedSlots.has(key)) {
      this.selectedSlots.delete(key);
    } else {
      this.selectedSlots.add(key);
    }
  }

  isSlotSelected(day: string, hour: number): boolean {
    return this.selectedSlots.has(`${day}-${hour}`);
  }

  isSlotDisabled(hour: number): boolean {
    return false; // Tous les créneaux sont maintenant disponibles
  }

  saveAvailabilities() {
    this.isSaving.set(true);
    this.message.set('');

    // Convertir les slots sélectionnés en format API
    const availabilities = Array.from(this.selectedSlots).map(key => {
      const [day, hourStr] = key.split('-');
      const hour = parseInt(hourStr);
      return {
        dayOfWeek: day,
        startTime: `${hour.toString().padStart(2, '0')}:00`,
        endTime: `${(hour + 1).toString().padStart(2, '0')}:00`,
        isAvailable: true
      };
    });

    const request: SaveAvailabilitiesRequest = { availabilities };

    this.availabilityService.saveAvailabilities(request).subscribe({
      next: (response) => {
        this.isSaving.set(false);
        if (response.success) {
          this.message.set('Disponibilités enregistrées avec succès!');
          this.messageType.set('success');
          setTimeout(() => this.message.set(''), 3000);
        }
      },
      error: (error) => {
        this.isSaving.set(false);
        this.message.set('Erreur lors de l\'enregistrement des disponibilités');
        this.messageType.set('error');
        console.error('Erreur:', error);
      }
    });
  }

  getSelectedTeacherName(): string {
    const teacherId = this.selectedTeacherId();
    if (!teacherId) return '';
    
    const teacher = this.teachers().find(t => t.id === teacherId);
    if (teacher) {
      return `${teacher.user?.firstName || ''} ${teacher.user?.lastName || ''}`.trim();
    }
    return '';
  }
}
