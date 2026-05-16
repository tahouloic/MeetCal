// Modèle pour les demandes de rendez-vous

export interface AppointmentRequest {
  id: string;
  requestorId: string;
  recipientId: string;
  slotTime: Date;
  slotTimeUtc: Date;
  requestorTimezone: string;
  recipientTimezone: string;
  message?: string;
  status: AppointmentStatus;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
  
  // Données dénormalisées pour affichage
  requestorName?: string;
  requestorEmail?: string;
  recipientName?: string;
  recipientEmail?: string;
}

export enum AppointmentStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED'
}

export interface CreateAppointmentRequest {
  recipientId: string;
  slotTime: string; // ISO 8601 format
  message?: string;
}

export interface AppointmentResponse {
  action: 'ACCEPT' | 'REJECT';
  rejectionReason?: string;
}

// Modèle pour les créneaux disponibles
export interface AvailableSlot {
  date: string;
  startTime: string;
  endTime: string;
  dayOfWeek: number;
  isAvailable: boolean;
}
