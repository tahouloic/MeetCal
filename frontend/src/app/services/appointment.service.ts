import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { 
  AppointmentRequest, 
  AppointmentStatus,
  CreateAppointmentRequest,
  AppointmentResponse,
  AvailableSlot
} from '../models/appointment';
import { ApiResponse } from '../models/schedule';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private readonly API_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Créer une demande de rendez-vous
  createAppointment(request: CreateAppointmentRequest): Observable<ApiResponse<AppointmentRequest>> {
    return this.http.post<ApiResponse<AppointmentRequest>>(`${this.API_URL}/appointments`, request);
  }

  // Obtenir mes demandes envoyées
  getSentAppointments(status?: AppointmentStatus): Observable<ApiResponse<AppointmentRequest[]>> {
    let params = new HttpParams();
    if (status) {
      params = params.set('status', status);
    }
    return this.http.get<ApiResponse<AppointmentRequest[]>>(`${this.API_URL}/appointments/sent`, { params });
  }

  // Obtenir les demandes reçues
  getReceivedAppointments(status?: AppointmentStatus): Observable<ApiResponse<AppointmentRequest[]>> {
    let params = new HttpParams();
    if (status) {
      params = params.set('status', status);
    }
    return this.http.get<ApiResponse<AppointmentRequest[]>>(`${this.API_URL}/appointments/received`, { params });
  }

  // Obtenir les détails d'une demande
  getAppointmentDetails(appointmentId: string): Observable<ApiResponse<AppointmentRequest>> {
    return this.http.get<ApiResponse<AppointmentRequest>>(`${this.API_URL}/appointments/${appointmentId}`);
  }

  // Accepter une demande
  acceptAppointment(appointmentId: string): Observable<ApiResponse<void>> {
    return this.http.put<ApiResponse<void>>(`${this.API_URL}/appointments/${appointmentId}/accept`, {});
  }

  // Rejeter une demande
  rejectAppointment(appointmentId: string, reason?: string): Observable<ApiResponse<void>> {
    return this.http.put<ApiResponse<void>>(`${this.API_URL}/appointments/${appointmentId}/reject`, {
      rejectionReason: reason
    });
  }

  // Obtenir les créneaux disponibles d'un utilisateur
  getAvailableSlots(userId: string, startDate: string, endDate: string): Observable<ApiResponse<AvailableSlot[]>> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    return this.http.get<ApiResponse<AvailableSlot[]>>(`${this.API_URL}/availabilities/slots/${userId}`, { params });
  }

  // Utilitaires pour l'affichage
  getStatusLabel(status: AppointmentStatus): string {
    const labels: Record<AppointmentStatus, string> = {
      [AppointmentStatus.PENDING]: 'En attente',
      [AppointmentStatus.ACCEPTED]: 'Accepté',
      [AppointmentStatus.REJECTED]: 'Rejeté',
      [AppointmentStatus.EXPIRED]: 'Expiré'
    };
    return labels[status];
  }

  getStatusClass(status: AppointmentStatus): string {
    const classes: Record<AppointmentStatus, string> = {
      [AppointmentStatus.PENDING]: 'status-pending',
      [AppointmentStatus.ACCEPTED]: 'status-accepted',
      [AppointmentStatus.REJECTED]: 'status-rejected',
      [AppointmentStatus.EXPIRED]: 'status-expired'
    };
    return classes[status];
  }

  getStatusIcon(status: AppointmentStatus): string {
    const icons: Record<AppointmentStatus, string> = {
      [AppointmentStatus.PENDING]: '⏳',
      [AppointmentStatus.ACCEPTED]: '✅',
      [AppointmentStatus.REJECTED]: '❌',
      [AppointmentStatus.EXPIRED]: '⌛'
    };
    return icons[status];
  }

  // Formater la date
  formatDate(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // Formater l'heure
  formatTime(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Calculer le temps restant avant expiration
  getTimeUntilExpiration(expiresAt: Date | string): string {
    const expiry = typeof expiresAt === 'string' ? new Date(expiresAt) : expiresAt;
    const now = new Date();
    const diff = expiry.getTime() - now.getTime();
    
    if (diff <= 0) {
      return 'Expiré';
    }
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days} jour${days > 1 ? 's' : ''}`;
    }
    
    if (hours > 0) {
      return `${hours}h ${minutes}min`;
    }
    
    return `${minutes} min`;
  }
}
