import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  RoomReservation,
  RoomReservationRequest,
  RejectReservationRequest,
  AvailableRoomsQuery,
  ReservationStatus,
  ApiResponse
} from '../models/reservation';
import { Room } from '../models/room';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReservationService {
  private readonly API_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // ========== Enseignant ==========

  /**
   * Créer une nouvelle réservation
   */
  createReservation(request: RoomReservationRequest): Observable<ApiResponse<RoomReservation>> {
    return this.http.post<ApiResponse<RoomReservation>>(
      `${this.API_URL}/teacher/reservations`,
      request
    );
  }

  /**
   * Obtenir mes réservations
   */
  getMyReservations(): Observable<ApiResponse<RoomReservation[]>> {
    return this.http.get<ApiResponse<RoomReservation[]>>(
      `${this.API_URL}/teacher/reservations`
    );
  }

  /**
   * Rechercher les salles disponibles
   */
  getAvailableRooms(query: AvailableRoomsQuery): Observable<ApiResponse<Room[]>> {
    const params = new HttpParams()
      .set('date', query.date)
      .set('startTime', query.startTime)
      .set('endTime', query.endTime)
      .set('capacity', query.capacity.toString());

    return this.http.get<ApiResponse<Room[]>>(
      `${this.API_URL}/teacher/reservations/available-rooms`,
      { params }
    );
  }

  // ========== Admin ==========

  /**
   * Obtenir toutes les réservations
   */
  getAllReservations(status?: ReservationStatus): Observable<ApiResponse<RoomReservation[]>> {
    let params = new HttpParams();
    if (status) {
      params = params.set('status', status);
    }

    return this.http.get<ApiResponse<RoomReservation[]>>(
      `${this.API_URL}/admin/reservations`,
      { params }
    );
  }

  /**
   * Compter les réservations en attente
   */
  countPendingReservations(): Observable<ApiResponse<number>> {
    return this.http.get<ApiResponse<number>>(
      `${this.API_URL}/admin/reservations/pending/count`
    );
  }

  /**
   * Approuver une réservation
   */
  approveReservation(id: string): Observable<ApiResponse<RoomReservation>> {
    return this.http.put<ApiResponse<RoomReservation>>(
      `${this.API_URL}/admin/reservations/${id}/approve`,
      {}
    );
  }

  /**
   * Rejeter une réservation
   */
  rejectReservation(
    id: string,
    request: RejectReservationRequest
  ): Observable<ApiResponse<RoomReservation>> {
    return this.http.put<ApiResponse<RoomReservation>>(
      `${this.API_URL}/admin/reservations/${id}/reject`,
      request
    );
  }

  // ========== Utilitaires ==========

  /**
   * Obtenir le libellé du statut en français
   */
  getStatusLabel(status: ReservationStatus): string {
    const labels: Record<ReservationStatus, string> = {
      [ReservationStatus.PENDING]: 'En attente',
      [ReservationStatus.APPROVED]: 'Approuvée',
      [ReservationStatus.REJECTED]: 'Rejetée'
    };
    return labels[status];
  }

  /**
   * Obtenir la classe CSS pour le badge de statut
   */
  getStatusClass(status: ReservationStatus): string {
    const classes: Record<ReservationStatus, string> = {
      [ReservationStatus.PENDING]: 'status-pending',
      [ReservationStatus.APPROVED]: 'status-approved',
      [ReservationStatus.REJECTED]: 'status-rejected'
    };
    return classes[status];
  }

  /**
   * Formater une date pour l'affichage
   */
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  /**
   * Formater une heure pour l'affichage
   */
  formatTime(timeString: string): string {
    return timeString.substring(0, 5); // HH:mm
  }
}
