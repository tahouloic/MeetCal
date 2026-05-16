import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ProfileService } from '../../services/profile.service';
import { AppointmentService } from '../../services/appointment.service';
import { AvailabilityService } from '../../services/availability.service';
import { AuthService } from '../../services/auth.service';
import { UserProfile } from '../../models/profile';
import { 
  AppointmentRequest, 
  AppointmentStatus,
  CreateAppointmentRequest,
  AvailableSlot
} from '../../models/appointment';
import { debounceTime, Subject } from 'rxjs';

@Component({
  selector: 'app-reservations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reservations.html',
  styleUrls: ['./reservations.scss'],
  styles: [`
    /* Styles inline pour forcer l'affichage du modal */
    :host ::ng-deep .modal-overlay {
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      right: 0 !important;
      bottom: 0 !important;
      background: rgba(0, 0, 0, 0.85) !important;
      z-index: 99999 !important;
      backdrop-filter: blur(6px) !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
    }
    
    :host ::ng-deep .modal-content {
      background: #ffffff !important;
      box-shadow: 0 25px 80px rgba(0, 0, 0, 0.7) !important;
      z-index: 100000 !important;
      position: relative !important;
      border: 1px solid #e5e7eb !important;
    }
    
    :host-context(.dark) ::ng-deep .modal-content {
      background: #1f2937 !important;
      border: 1px solid #4b5563 !important;
    }
    
    /* Forcer l'opacité sur tous les éléments du modal */
    :host ::ng-deep .modal-overlay * {
      opacity: 1 !important;
    }
  `]
})
export class ReservationsComponent implements OnInit {
  // Navigation
  currentView: 'search' | 'profile' | 'my-requests' | 'received-requests' = 'search';
  
  // Recherche de profils
  searchQuery = '';
  searchResults: UserProfile[] = [];
  isSearching = false;
  private searchSubject = new Subject<string>();
  
  // Profil consulté
  selectedProfile: UserProfile | null = null;
  profileAvailabilities: AvailableSlot[] = [];
  isLoadingProfile = false;
  
  // Formulaire de demande
  showRequestForm = false;
  requestForm: CreateAppointmentRequest = {
    recipientId: '',
    slotTime: '',
    message: ''
  };
  selectedDate = '';
  selectedTime = '';
  selectedSlot: AvailableSlot | null = null;
  availableSlotsForDate: AvailableSlot[] = [];
  isSendingRequest = false;
  isTimeValid = false;
  timeValidationMessage = '';
  
  // Mes demandes
  myRequests: AppointmentRequest[] = [];
  isLoadingRequests = false;
  selectedStatus: AppointmentStatus | 'ALL' = 'ALL';
  
  // Demandes reçues
  receivedRequests: AppointmentRequest[] = [];
  isLoadingReceivedRequests = false;
  selectedReceivedStatus: AppointmentStatus | 'ALL' = 'ALL';
  
  // Modal réponse
  showResponseModal = false;
  selectedRequestForResponse: AppointmentRequest | null = null;
  responseAction: 'ACCEPT' | 'REJECT' = 'ACCEPT';
  responseMessage = '';
  isRespondingToRequest = false;
  
  // Messages
  message = '';
  messageType: 'success' | 'error' | '' = '';
  
  // Enum pour le template
  AppointmentStatus = AppointmentStatus;
  
  // Utilisateur connecté
  currentUserId = '';
  
  constructor(
    private profileService: ProfileService,
    private appointmentService: AppointmentService,
    private availabilityService: AvailabilityService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}
  
  ngOnInit() {
    // Récupérer l'utilisateur connecté
    this.authService.authState$.subscribe(state => {
      if (state.user) {
        this.currentUserId = state.user.id;
      }
    });
    
    // Vérifier les query params pour navigation directe
    this.route.queryParams.subscribe(params => {
      if (params['view'] === 'received-requests') {
        this.showReceivedRequestsView();
      }
    });
    
    // Configurer le debounce pour la recherche
    this.searchSubject.pipe(
      debounceTime(300)
    ).subscribe(query => {
      this.performSearch(query);
    });
    
    // Charger les demandes par défaut
    this.loadMyRequests();
  }
  
  // ========== Navigation ==========
  
  showSearchView() {
    this.currentView = 'search';
    this.selectedProfile = null;
    this.showRequestForm = false;
    this.cdr.detectChanges();
  }
  
  showMyRequestsView() {
    this.currentView = 'my-requests';
    this.selectedProfile = null;
    this.showRequestForm = false;
    this.loadMyRequests();
    this.cdr.detectChanges();
  }
  
  showReceivedRequestsView() {
    this.currentView = 'received-requests';
    this.selectedProfile = null;
    this.showRequestForm = false;
    this.loadReceivedRequests();
    this.cdr.detectChanges();
  }
  
  // ========== Recherche de profils ==========
  
  onSearchInput() {
    if (this.searchQuery.trim().length < 2) {
      this.searchResults = [];
      return;
    }
    this.searchSubject.next(this.searchQuery);
  }
  
  performSearch(query: string) {
    if (query.trim().length < 2) {
      this.searchResults = [];
      return;
    }
    
    this.isSearching = true;
    this.cdr.detectChanges();
    
    this.profileService.searchProfiles(query).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          // Exclure l'utilisateur connecté des résultats
          this.searchResults = response.data.filter(
            profile => profile.id !== this.currentUserId
          );
        }
        this.isSearching = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Erreur recherche profils:', error);
        this.showMessage('Erreur lors de la recherche', 'error');
        this.isSearching = false;
        this.cdr.detectChanges();
      }
    });
  }
  
  // ========== Vue profil ==========
  
  viewProfile(profile: UserProfile) {
    this.selectedProfile = profile;
    this.currentView = 'profile';
    this.isLoadingProfile = true;
    this.cdr.detectChanges();
    
    // Charger les disponibilités du profil (7 prochains jours)
    const startDate = new Date().toISOString().split('T')[0];
    const endDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    this.appointmentService.getAvailableSlots(profile.id, startDate, endDate).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.profileAvailabilities = response.data;
        }
        this.isLoadingProfile = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Erreur chargement disponibilités:', error);
        this.showMessage('Erreur lors du chargement des disponibilités', 'error');
        this.isLoadingProfile = false;
        this.cdr.detectChanges();
      }
    });
  }
  
  // ========== Demande de rendez-vous ==========
  
  openRequestForm() {
    if (!this.selectedProfile) return;
    
    this.showRequestForm = true;
    this.requestForm = {
      recipientId: this.selectedProfile.id,
      slotTime: '',
      message: ''
    };
    this.selectedDate = '';
    this.selectedTime = '';
    this.selectedSlot = null;
    this.availableSlotsForDate = [];
    this.isTimeValid = false;
    this.timeValidationMessage = '';
    this.cdr.detectChanges();
  }
  
  closeRequestForm() {
    this.showRequestForm = false;
    this.requestForm = {
      recipientId: '',
      slotTime: '',
      message: ''
    };
    this.selectedDate = '';
    this.selectedTime = '';
    this.selectedSlot = null;
    this.availableSlotsForDate = [];
    this.isTimeValid = false;
    this.timeValidationMessage = '';
    this.cdr.detectChanges();
  }
  
  onDateSelected() {
    if (!this.selectedDate) {
      this.availableSlotsForDate = [];
      this.isTimeValid = false;
      this.timeValidationMessage = '';
      return;
    }
    
    // Filtrer les créneaux pour la date sélectionnée
    this.availableSlotsForDate = this.profileAvailabilities.filter(
      slot => slot.date === this.selectedDate && slot.isAvailable
    );
    
    // Revalider l'heure si elle est déjà sélectionnée
    if (this.selectedTime) {
      this.validateTime();
    }
    
    this.cdr.detectChanges();
  }
  
  onTimeSelected() {
    this.validateTime();
  }
  
  validateTime() {
    if (!this.selectedDate || !this.selectedTime) {
      this.isTimeValid = false;
      this.timeValidationMessage = '';
      return;
    }
    
    // Vérifier si l'heure correspond à un créneau disponible
    const timeMatch = this.availableSlotsForDate.find(slot => {
      const slotStart = slot.startTime.substring(0, 5); // Format HH:mm
      const slotEnd = slot.endTime.substring(0, 5);
      return this.selectedTime >= slotStart && this.selectedTime < slotEnd;
    });
    
    if (timeMatch) {
      this.isTimeValid = true;
      this.timeValidationMessage = `✓ Créneau disponible: ${timeMatch.startTime} - ${timeMatch.endTime}`;
      this.selectedSlot = timeMatch;
      // Format ISO 8601 complet avec secondes
      this.requestForm.slotTime = `${this.selectedDate}T${this.selectedTime}:00`;
    } else {
      this.isTimeValid = false;
      this.timeValidationMessage = '✗ Cette heure ne correspond à aucun créneau disponible';
      this.selectedSlot = null;
      this.requestForm.slotTime = '';
    }
    
    this.cdr.detectChanges();
  }
  
  selectSlot(slot: AvailableSlot) {
    this.selectedSlot = slot;
    this.selectedTime = slot.startTime.substring(0, 5);
    this.isTimeValid = true;
    this.timeValidationMessage = `✓ Créneau sélectionné: ${slot.startTime} - ${slot.endTime}`;
    this.requestForm.slotTime = `${slot.date}T${slot.startTime}:00`;
    this.cdr.detectChanges();
  }
  
  submitRequest() {
    if (!this.requestForm.recipientId || !this.requestForm.slotTime || !this.isTimeValid) {
      this.showMessage('Veuillez sélectionner une date et une heure valides', 'error');
      return;
    }
    
    this.isSendingRequest = true;
    this.cdr.detectChanges();
    
    this.appointmentService.createAppointment(this.requestForm).subscribe({
      next: (response) => {
        if (response.success) {
          this.showMessage('Demande de rendez-vous envoyée avec succès!', 'success');
          this.closeRequestForm();
          this.showMyRequestsView();
        }
        this.isSendingRequest = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Erreur envoi demande:', error);
        this.showMessage(
          error.error?.message || 'Erreur lors de l\'envoi de la demande',
          'error'
        );
        this.isSendingRequest = false;
        this.cdr.detectChanges();
      }
    });
  }
  
  // ========== Mes demandes ==========
  
  loadMyRequests() {
    this.isLoadingRequests = true;
    this.cdr.detectChanges();
    
    const status = this.selectedStatus === 'ALL' ? undefined : this.selectedStatus;
    
    this.appointmentService.getSentAppointments(status).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.myRequests = response.data;
        }
        this.isLoadingRequests = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Erreur chargement demandes:', error);
        this.showMessage('Erreur lors du chargement des demandes', 'error');
        this.isLoadingRequests = false;
        this.cdr.detectChanges();
      }
    });
  }
  
  onStatusFilterChange() {
    this.loadMyRequests();
  }
  
  // ========== Demandes reçues ==========
  
  loadReceivedRequests() {
    this.isLoadingReceivedRequests = true;
    this.cdr.detectChanges();
    
    const status = this.selectedReceivedStatus === 'ALL' ? undefined : this.selectedReceivedStatus;
    
    this.appointmentService.getReceivedAppointments(status).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.receivedRequests = response.data;
        }
        this.isLoadingReceivedRequests = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Erreur chargement demandes reçues:', error);
        this.showMessage('Erreur lors du chargement des demandes reçues', 'error');
        this.isLoadingReceivedRequests = false;
        this.cdr.detectChanges();
      }
    });
  }
  
  onReceivedStatusFilterChange() {
    this.loadReceivedRequests();
  }
  
  openAcceptModal(request: AppointmentRequest) {
    this.selectedRequestForResponse = request;
    this.responseAction = 'ACCEPT';
    this.responseMessage = '';
    this.showResponseModal = true;
    this.cdr.detectChanges();
  }
  
  openRejectModal(request: AppointmentRequest) {
    this.selectedRequestForResponse = request;
    this.responseAction = 'REJECT';
    this.responseMessage = '';
    this.showResponseModal = true;
    this.cdr.detectChanges();
  }
  
  closeResponseModal() {
    this.showResponseModal = false;
    this.selectedRequestForResponse = null;
    this.responseMessage = '';
    this.cdr.detectChanges();
  }
  
  submitResponse() {
    if (!this.selectedRequestForResponse) return;
    
    this.isRespondingToRequest = true;
    this.cdr.detectChanges();
    
    const appointmentId = this.selectedRequestForResponse.id;
    
    if (this.responseAction === 'ACCEPT') {
      this.appointmentService.acceptAppointment(appointmentId).subscribe({
        next: (response) => {
          if (response.success) {
            this.showMessage('Demande acceptée avec succès!', 'success');
            this.closeResponseModal();
            this.loadReceivedRequests();
          }
          this.isRespondingToRequest = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Erreur acceptation:', error);
          this.showMessage('Erreur lors de l\'acceptation', 'error');
          this.isRespondingToRequest = false;
          this.cdr.detectChanges();
        }
      });
    } else {
      this.appointmentService.rejectAppointment(appointmentId, this.responseMessage).subscribe({
        next: (response) => {
          if (response.success) {
            this.showMessage('Demande rejetée', 'success');
            this.closeResponseModal();
            this.loadReceivedRequests();
          }
          this.isRespondingToRequest = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Erreur rejet:', error);
          this.showMessage('Erreur lors du rejet', 'error');
          this.isRespondingToRequest = false;
          this.cdr.detectChanges();
        }
      });
    }
  }
  
  // ========== Utilitaires ==========
  
  getFullName(profile: UserProfile): string {
    return this.profileService.getFullName(profile);
  }
  
  getAccountTypeLabel(accountType: 'INDIVIDUAL' | 'BUSINESS'): string {
    return this.profileService.getAccountTypeLabel(accountType);
  }
  
  getStatusLabel(status: AppointmentStatus): string {
    return this.appointmentService.getStatusLabel(status);
  }
  
  getStatusClass(status: AppointmentStatus): string {
    return this.appointmentService.getStatusClass(status);
  }
  
  getStatusIcon(status: AppointmentStatus): string {
    return this.appointmentService.getStatusIcon(status);
  }
  
  formatDate(date: Date | string): string {
    return this.appointmentService.formatDate(date);
  }
  
  formatTime(date: Date | string): string {
    return this.appointmentService.formatTime(date);
  }
  
  getTimeUntilExpiration(expiresAt: Date | string): string {
    return this.appointmentService.getTimeUntilExpiration(expiresAt);
  }
  
  showMessage(text: string, type: 'success' | 'error') {
    this.message = text;
    this.messageType = type;
    this.cdr.detectChanges();
    
    setTimeout(() => {
      this.message = '';
      this.messageType = '';
      this.cdr.detectChanges();
    }, 5000);
  }
  
  // Obtenir la date minimale (aujourd'hui)
  getMinDate(): string {
    return new Date().toISOString().split('T')[0];
  }
  
  // Obtenir la date maximale (7 jours)
  getMaxDate(): string {
    return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  }
  
  // Grouper les disponibilités par jour
  getAvailabilitiesByDay(): { [key: string]: AvailableSlot[] } {
    const grouped: { [key: string]: AvailableSlot[] } = {};
    
    this.profileAvailabilities.forEach(slot => {
      if (!grouped[slot.date]) {
        grouped[slot.date] = [];
      }
      grouped[slot.date].push(slot);
    });
    
    return grouped;
  }
  
  getDayLabel(date: string): string {
    const d = new Date(date);
    return d.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  }
}
