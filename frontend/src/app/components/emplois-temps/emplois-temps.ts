import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ScheduleService } from '../../services/schedule.service';
import { AuthService } from '../../services/auth.service';
import { ClassGroupService } from '../../services/class-group.service';
import { CourseService } from '../../services/course.service';
import { TeacherService } from '../../services/teacher.service';
import { RoomService } from '../../services/room.service';
import { WeeklySchedule, TimeSlot } from '../../models/schedule';

type DayOfWeek = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';

@Component({
  selector: 'app-emplois-temps',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './emplois-temps.html',
  styleUrls: ['./emplois-temps.scss']
})
export class EmploisTempsComponent implements OnInit {
  // État
  isLoading = false;
  isAdmin = false;
  currentUserId: string | null = null;
  teacherId: string | null = null;
  
  // Données
  schedules: WeeklySchedule[] = [];
  selectedSchedule: WeeklySchedule | null = null;
  
  // Sélection de semaine
  selectedWeekNumber: number;
  selectedYear: number;
  availableWeeks: { weekNumber: number; year: number; label: string }[] = [];
  
  // Génération (Admin)
  showGenerateModal = false;
  isGenerating = false;
  
  // Édition (Admin)
  showEditModal = false;
  editingSlot: TimeSlot | null = null;
  courses: any[] = [];
  teachers: any[] = [];
  rooms: any[] = [];
  
  // Grille horaire
  timeSlots = ['08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'];
  days: DayOfWeek[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
  
  // Messages
  successMessage = '';
  errorMessage = '';

  constructor(
    private scheduleService: ScheduleService,
    private authService: AuthService,
    private classGroupService: ClassGroupService,
    private courseService: CourseService,
    private teacherService: TeacherService,
    private roomService: RoomService,
    private cdr: ChangeDetectorRef
  ) {
    this.selectedWeekNumber = this.scheduleService.getCurrentWeekNumber();
    this.selectedYear = this.scheduleService.getCurrentYear();
  }

  ngOnInit(): void {
    this.checkUserRole();
    this.initializeWeeks();
    
    // Charger les emplois du temps seulement si admin
    // Pour les enseignants, le chargement se fait après récupération du teacherId
    if (this.isAdmin) {
      this.loadSchedules();
    }
    
    if (this.isAdmin) {
      this.loadCourses();
      this.loadTeachers();
      this.loadRooms();
    }
  }

  checkUserRole(): void {
    const user = this.authService.currentUser;
    if (user) {
      this.isAdmin = user.role === 'ADMIN';
      this.currentUserId = user.id;
      
      if (!this.isAdmin) {
        // Récupérer l'ID de l'enseignant
        this.teacherService.getTeacherByUserId(user.id).subscribe({
          next: (response) => {
            if (response.success && response.data) {
              this.teacherId = response.data.id;
              this.cdr.detectChanges();
              // Charger les emplois du temps après avoir récupéré l'ID de l'enseignant
              this.loadSchedules();
            }
          },
          error: (error) => {
            console.error('Erreur lors de la récupération de l\'enseignant:', error);
            this.errorMessage = 'Erreur lors de la récupération des informations de l\'enseignant';
            this.isLoading = false;
            this.cdr.detectChanges();
          }
        });
      }
    }
  }

  initializeWeeks(): void {
    const currentYear = this.selectedYear;
    const currentWeek = this.selectedWeekNumber;
    
    // Générer les 10 dernières semaines et les 4 prochaines
    for (let i = -10; i <= 4; i++) {
      let weekNum = currentWeek + i;
      let year = currentYear;
      
      if (weekNum < 1) {
        weekNum += 52;
        year--;
      } else if (weekNum > 52) {
        weekNum -= 52;
        year++;
      }
      
      const weekStart = this.scheduleService.getWeekStartDate(weekNum, year);
      const label = `Semaine ${weekNum} - ${year} (${this.formatDate(weekStart)})`;
      
      this.availableWeeks.push({ weekNumber: weekNum, year, label });
    }
  }

  loadSchedules(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    if (this.isAdmin) {
      this.scheduleService.getAllSchedules(this.selectedWeekNumber, this.selectedYear).subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.schedules = response.data;
            if (this.schedules.length > 0) {
              this.selectedSchedule = this.schedules[0];
            }
          }
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Erreur lors du chargement des emplois du temps:', error);
          this.errorMessage = 'Erreur lors du chargement des emplois du temps';
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
    } else if (this.teacherId) {
      console.log('🔍 Chargement des emplois du temps pour l\'enseignant:', this.teacherId);
      this.scheduleService.getTeacherSchedules(
        this.teacherId,
        this.selectedWeekNumber,
        this.selectedYear
      ).subscribe({
        next: (response) => {
          console.log('📅 Réponse emplois du temps enseignant:', response);
          if (response.success && response.data) {
            this.schedules = response.data;
            if (this.schedules.length > 0) {
              this.selectedSchedule = this.schedules[0];
              console.log('✅ Emploi du temps sélectionné:', this.selectedSchedule);
            } else {
              console.log('ℹ️ Aucun emploi du temps trouvé pour cette semaine');
            }
          }
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('❌ Erreur lors du chargement des emplois du temps:', error);
          this.errorMessage = 'Erreur lors du chargement des emplois du temps';
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
    } else {
      console.warn('⚠️ Impossible de charger les emplois du temps: teacherId non défini');
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  onWeekChange(): void {
    this.loadSchedules();
  }

  selectSchedule(schedule: WeeklySchedule): void {
    this.selectedSchedule = schedule;
    this.cdr.detectChanges();
  }

  // Génération d'emploi du temps (Admin)
  openGenerateModal(): void {
    this.showGenerateModal = true;
    this.cdr.detectChanges();
  }

  closeGenerateModal(): void {
    this.showGenerateModal = false;
    this.cdr.detectChanges();
  }

  generateSchedule(): void {
    this.isGenerating = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.scheduleService.generateAllSchedules(this.selectedWeekNumber, this.selectedYear).subscribe({
      next: (response) => {
        if (response.success) {
          this.successMessage = response.message || 'Emplois du temps générés avec succès';
          this.closeGenerateModal();
          this.loadSchedules();
          setTimeout(() => this.clearMessages(), 5000);
        } else {
          this.errorMessage = response.message || 'Erreur lors de la génération';
        }
        this.isGenerating = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Erreur lors de la génération:', error);
        this.errorMessage = error.error?.message || 'Erreur lors de la génération';
        this.isGenerating = false;
        this.cdr.detectChanges();
      }
    });
  }

  // Édition de créneau (Admin)
  onCellClick(day: DayOfWeek, time: string): void {
    if (!this.isAdmin) return;
    
    const existingSlot = this.getSlotForDayAndTime(day, time);
    
    if (existingSlot) {
      // Modifier un créneau existant
      this.openEditModal(existingSlot);
    } else {
      // Créer un nouveau créneau
      this.openCreateModal(day, time);
    }
  }

  openCreateModal(day: DayOfWeek, time: string): void {
    if (!this.selectedSchedule) return;
    
    // Créer un créneau vide avec le jour et l'heure
    const endTime = this.calculateEndTime(time);
    
    this.editingSlot = {
      id: '',
      dayOfWeek: day,
      startTime: time,
      endTime: endTime,
      courseId: this.courses.length > 0 ? this.courses[0].id : '',
      courseName: '',
      courseCode: '',
      teacherId: this.teachers.length > 0 ? this.teachers[0].id : '',
      teacherName: '',
      teacherEmail: '',
      roomId: this.rooms.length > 0 ? this.rooms[0].id : '',
      roomCode: '',
      roomCapacity: 0,
      isManuallySet: true
    };
    
    this.showEditModal = true;
    this.cdr.detectChanges();
  }

  openEditModal(slot: TimeSlot): void {
    this.editingSlot = { ...slot };
    this.showEditModal = true;
    this.cdr.detectChanges();
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.editingSlot = null;
    this.cdr.detectChanges();
  }

  saveTimeSlot(): void {
    if (!this.editingSlot || !this.selectedSchedule) return;

    if (this.editingSlot.id) {
      // Modifier un créneau existant
      this.scheduleService.updateTimeSlot(this.editingSlot.id, {
        courseId: this.editingSlot.courseId,
        teacherId: this.editingSlot.teacherId,
        roomId: this.editingSlot.roomId
      }).subscribe({
        next: (response) => {
          if (response.success) {
            this.successMessage = 'Créneau modifié avec succès';
            this.closeEditModal();
            this.loadSchedules();
            this.clearMessages();
          }
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Erreur lors de la modification:', error);
          this.errorMessage = error.error?.message || 'Erreur lors de la modification';
          this.cdr.detectChanges();
        }
      });
    } else {
      // Créer un nouveau créneau
      this.scheduleService.createTimeSlot({
        scheduleId: this.selectedSchedule.id,
        dayOfWeek: this.editingSlot.dayOfWeek,
        startTime: this.editingSlot.startTime,
        endTime: this.editingSlot.endTime,
        courseId: this.editingSlot.courseId,
        teacherId: this.editingSlot.teacherId,
        roomId: this.editingSlot.roomId
      }).subscribe({
        next: (response) => {
          if (response.success) {
            this.successMessage = 'Créneau créé avec succès';
            this.closeEditModal();
            this.loadSchedules();
            this.clearMessages();
          }
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Erreur lors de la création:', error);
          this.errorMessage = error.error?.message || 'Erreur lors de la création';
          this.cdr.detectChanges();
        }
      });
    }
  }

  calculateEndTime(startTime: string): string {
    const [hours, minutes] = startTime.split(':').map(Number);
    const endHours = hours + 1;
    return `${endHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  // Chargement des données
  loadCourses(): void {
    this.courseService.getAllCourses().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.courses = response.data;
        }
      }
    });
  }

  loadTeachers(): void {
    this.teacherService.getAllTeachers().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.teachers = response.data;
        }
      }
    });
  }

  loadRooms(): void {
    this.roomService.getAllRooms().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.rooms = response.data;
        }
      }
    });
  }

  // Utilitaires pour la grille
  getSlotForDayAndTime(day: DayOfWeek, time: string): TimeSlot | null {
    if (!this.selectedSchedule) return null;
    
    return this.selectedSchedule.timeSlots.find(slot => 
      slot.dayOfWeek === day && slot.startTime.startsWith(time)
    ) || null;
  }

  isTeacherSlot(slot: TimeSlot): boolean {
    return slot.teacherId === this.teacherId;
  }

  getTeacherColor(teacherId: string): string {
    // Palette de couleurs unies (pas de dégradés)
    const colors = [
      '#667eea', // Violet
      '#f093fb', // Rose
      '#4facfe', // Bleu clair
      '#43e97b', // Vert
      '#fa709a', // Rose foncé
      '#feca57', // Jaune
      '#ff6b6b', // Rouge
      '#48dbfb', // Cyan
      '#ff9ff3', // Rose clair
      '#54a0ff', // Bleu
      '#00d2d3', // Turquoise
      '#ff6348', // Orange-rouge
      '#5f27cd', // Violet foncé
      '#00b894', // Vert menthe
      '#fdcb6e', // Jaune doré
    ];
    
    // Générer un index basé sur le teacherId pour avoir toujours la même couleur
    let hash = 0;
    for (let i = 0; i < teacherId.length; i++) {
      hash = teacherId.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    
    return colors[index];
  }

  getDayLabel(day: DayOfWeek): string {
    return this.scheduleService.getDayLabel(day);
  }

  formatTime(time: string): string {
    return this.scheduleService.formatTime(time);
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
  }

  clearMessages(): void {
    setTimeout(() => {
      this.successMessage = '';
      this.errorMessage = '';
      this.cdr.detectChanges();
    }, 5000);
  }
}
