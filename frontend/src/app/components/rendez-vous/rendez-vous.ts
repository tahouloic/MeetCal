import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppointmentService } from '../../services/appointment.service';
import { AppointmentRequest, AppointmentStatus } from '../../models/appointment';

@Component({
  selector: 'app-rendez-vous',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2" stroke-width="2"/>
            <path d="M16 2v4M8 2v4M3 10h18" stroke-width="2"/>
          </svg>
          Mes Rendez-vous
        </h1>
        <p>Tous vos rendez-vous acceptés à venir</p>
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="loading">
        <div class="spinner"></div>
        <p>Chargement des rendez-vous...</p>
      </div>

      <!-- Liste des rendez-vous -->
      <div *ngIf="!loading" class="appointments-container">
        <div *ngIf="upcomingAppointments.length === 0" class="empty-state">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
            <rect x="3" y="4" width="18" height="18" rx="2"/>
            <path d="M16 2v4M8 2v4M3 10h18"/>
          </svg>
          <h3>Aucun rendez-vous à venir</h3>
          <p>Vous n'avez pas de rendez-vous acceptés pour le moment</p>
        </div>

        <div class="appointments-grid">
          <div *ngFor="let appointment of upcomingAppointments" class="appointment-card">
            <!-- Badge de type -->
            <div class="appointment-type-badge" [class.sent]="appointment.isSent" [class.received]="!appointment.isSent">
              {{ appointment.isSent ? 'Envoyé' : 'Reçu' }}
            </div>

            <!-- Header -->
            <div class="appointment-header">
              <div class="date-section">
                <div class="day">{{ getDay(appointment.slotTime) }}</div>
                <div class="month-year">{{ getMonthYear(appointment.slotTime) }}</div>
              </div>
              <div class="time-section">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 6v6l4 2"/>
                </svg>
                <span class="time">{{ formatTime(appointment.slotTime) }}</span>
              </div>
            </div>

            <!-- Body -->
            <div class="appointment-body">
              <div class="participant-info">
                <div class="participant-avatar">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>
                <div class="participant-details">
                  <h3>{{ appointment.isSent ? appointment.recipientName : appointment.requestorName }}</h3>
                  <p class="participant-email">{{ appointment.isSent ? appointment.recipientEmail : appointment.requestorEmail }}</p>
                </div>
              </div>

              <div *ngIf="appointment.message" class="message-section">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                <p class="message">{{ appointment.message }}</p>
              </div>

              <!-- Countdown -->
              <div class="countdown-section">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 6v6l4 2"/>
                </svg>
                <span class="countdown">{{ getTimeUntilAppointment(appointment.slotTime) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    .page-header {
      margin-bottom: 2rem;

      h1 {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        font-size: 2rem;
        font-weight: 600;
        color: var(--text-primary);
        margin: 0 0 0.5rem 0;

        svg {
          color: var(--primary-color);
        }
      }

      p {
        color: var(--text-secondary);
        margin: 0;
      }
    }

    .loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem 2rem;
      color: var(--text-secondary);

      .spinner {
        width: 48px;
        height: 48px;
        border: 4px solid var(--border-color);
        border-top-color: var(--primary-color);
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
        margin-bottom: 1rem;
      }
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 4rem 2rem;
      color: var(--text-secondary);
      text-align: center;

      svg {
        margin-bottom: 1.5rem;
        opacity: 0.5;
      }

      h3 {
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--text-primary);
        margin: 0 0 0.5rem 0;
      }

      p {
        margin: 0;
      }
    }

    .appointments-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 1.5rem;
    }

    .appointment-card {
      position: relative;
      background: var(--card-background);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 1.5rem;
      transition: all 0.2s;

      &:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        transform: translateY(-2px);
      }
    }

    .appointment-type-badge {
      position: absolute;
      top: 1rem;
      right: 1rem;
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;

      &.sent {
        background: #dbeafe;
        color: #1e40af;
      }

      &.received {
        background: #d1fae5;
        color: #065f46;
      }
    }

    :host-context(.dark) .appointment-type-badge {
      &.sent {
        background: #1e3a8a;
        color: #93c5fd;
      }

      &.received {
        background: #064e3b;
        color: #6ee7b7;
      }
    }

    .appointment-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 1rem;
      margin-bottom: 1rem;
      border-bottom: 1px solid var(--border-color);
    }

    .date-section {
      .day {
        font-size: 2rem;
        font-weight: 700;
        color: var(--primary-color);
        line-height: 1;
      }

      .month-year {
        font-size: 0.875rem;
        color: var(--text-secondary);
        margin-top: 0.25rem;
      }
    }

    .time-section {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background: var(--background-secondary);
      border-radius: 8px;

      svg {
        color: var(--primary-color);
      }

      .time {
        font-size: 1.125rem;
        font-weight: 600;
        color: var(--text-primary);
      }
    }

    .appointment-body {
      .participant-info {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-bottom: 1rem;
      }

      .participant-avatar {
        flex-shrink: 0;
        width: 48px;
        height: 48px;
        background: var(--primary-color);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;

        svg {
          color: white;
        }
      }

      .participant-details {
        flex: 1;

        h3 {
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0 0 0.25rem 0;
        }

        .participant-email {
          font-size: 0.875rem;
          color: var(--text-secondary);
          margin: 0;
        }
      }

      .message-section {
        display: flex;
        gap: 0.75rem;
        padding: 0.75rem;
        background: var(--background-secondary);
        border-radius: 8px;
        margin-bottom: 1rem;

        svg {
          flex-shrink: 0;
          color: var(--primary-color);
          margin-top: 0.125rem;
        }

        .message {
          flex: 1;
          font-size: 0.875rem;
          color: var(--text-primary);
          margin: 0;
          line-height: 1.5;
        }
      }

      .countdown-section {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem;
        background: #fef3c7;
        border-radius: 8px;
        color: #92400e;

        svg {
          flex-shrink: 0;
        }

        .countdown {
          font-size: 0.875rem;
          font-weight: 600;
        }
      }
    }

    :host-context(.dark) .countdown-section {
      background: #78350f;
      color: #fef3c7;
    }

    @media (max-width: 768px) {
      .page-container {
        padding: 1rem;
      }

      .appointments-grid {
        grid-template-columns: 1fr;
      }

      .appointment-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
      }
    }
  `]
})
export class RendezVousComponent implements OnInit {
  upcomingAppointments: (AppointmentRequest & { isSent: boolean })[] = [];
  loading = false;

  constructor(
    private appointmentService: AppointmentService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadUpcomingAppointments();
  }

  loadUpcomingAppointments() {
    this.loading = true;
    this.cdr.detectChanges();

    // Charger les rendez-vous envoyés ET reçus acceptés
    const sent$ = this.appointmentService.getSentAppointments(AppointmentStatus.ACCEPTED);
    const received$ = this.appointmentService.getReceivedAppointments(AppointmentStatus.ACCEPTED);

    // Combiner les deux requêtes
    Promise.all([
      sent$.toPromise(),
      received$.toPromise()
    ]).then(([sentResponse, receivedResponse]) => {
      const sentAppointments = (sentResponse?.data || []).map(apt => ({ ...apt, isSent: true }));
      const receivedAppointments = (receivedResponse?.data || []).map(apt => ({ ...apt, isSent: false }));

      // Combiner et filtrer les rendez-vous futurs
      const allAppointments = [...sentAppointments, ...receivedAppointments];
      const now = new Date();

      this.upcomingAppointments = allAppointments
        .filter(apt => new Date(apt.slotTime) > now) // Seulement les rendez-vous futurs
        .sort((a, b) => new Date(a.slotTime).getTime() - new Date(b.slotTime).getTime()); // Trier par date (les plus proches en premier)

      this.loading = false;
      this.cdr.detectChanges();
    }).catch(error => {
      console.error('❌ Erreur chargement rendez-vous:', error);
      this.loading = false;
      this.cdr.detectChanges();
    });
  }

  getDay(date: Date | string): string {
    const d = new Date(date);
    return d.getDate().toString().padStart(2, '0');
  }

  getMonthYear(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
  }

  formatTime(date: Date | string): string {
    return this.appointmentService.formatTime(date);
  }

  getTimeUntilAppointment(slotTime: Date | string): string {
    const now = new Date();
    const appointmentDate = new Date(slotTime);
    const diffMs = appointmentDate.getTime() - now.getTime();

    if (diffMs < 0) return 'Passé';

    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffDays > 0) {
      return `Dans ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
    } else if (diffHours > 0) {
      return `Dans ${diffHours}h ${diffMinutes}min`;
    } else {
      return `Dans ${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
    }
  }
}
