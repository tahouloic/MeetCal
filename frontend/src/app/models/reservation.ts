// Modèles pour le système de réservation de salles

export enum ReservationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export interface RoomReservation {
  id: string;
  teacher: TeacherSummary;
  room: RoomSummary;
  eventDescription: string;
  eventDate: string; // Format: YYYY-MM-DD
  startTime: string; // Format: HH:mm
  endTime: string;   // Format: HH:mm
  requiredCapacity: number;
  status: ReservationStatus;
  rejectionReason?: string;
  reviewedBy?: UserSummary;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TeacherSummary {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  specialty: string;
}

export interface RoomSummary {
  id: string;
  name: string;
  building: string;
  capacity: number;
}

export interface UserSummary {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

// DTOs pour les requêtes

export interface RoomReservationRequest {
  eventDescription: string;
  eventDate: string; // Format: YYYY-MM-DD
  startTime: string; // Format: HH:mm
  endTime: string;   // Format: HH:mm
  requiredCapacity: number;
  roomId: string;
}

export interface RejectReservationRequest {
  rejectionReason: string;
}

export interface AvailableRoomsQuery {
  date: string;      // Format: YYYY-MM-DD
  startTime: string; // Format: HH:mm
  endTime: string;   // Format: HH:mm
  capacity: number;
}

// Réponses API

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  code?: string;
}
