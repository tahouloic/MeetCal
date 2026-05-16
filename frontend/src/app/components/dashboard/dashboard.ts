import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { AppointmentService } from '../../services/appointment.service';
import { Observable, Subject, forkJoin, takeUntil, timeout, catchError, of } from 'rxjs';
import { AppointmentRequest, AppointmentStatus } from '../../models/appointment';
import { environment } from '../../../environments/environment';

interface RecentUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  status: string;
  createdAt: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class DashboardComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private appointmentService = inject(AppointmentService);
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);
  private destroy$ = new Subject<void>();

  isAdmin = false;
  recentUsers: RecentUser[] = [];
  recentRequests: AppointmentRequest[] = [];
  upcomingAppointments: (AppointmentRequest & { isSent: boolean })[] = [];
  isLoadingUsers = false;
  isLoadingRequests = false;
  isLoadingAppointments = false;
  hasError = false;
  errorMessage = '';

  ngOnInit(): void {
    console.log('🚀 Dashboard ngOnInit');
    
    // Vérifier le rôle de l'utilisateur
    this.authService.authState$
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        this.isAdmin = state.user?.role === 'ADMIN';
        console.log('👤 Utilisateur:', state.user?.email, 'Admin:', this.isAdmin);
        
        // Charger les utilisateurs récents si admin
        if (this.isAdmin) {
          this.loadRecentUsers();
        }
      });

    // Charger les demandes récentes et rendez-vous à venir
    this.loadDashboardData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadRecentUsers(): void {
    console.log('🔄 Chargement des utilisateurs récents...');
    this.isLoadingUsers = true;
    this.cdr.detectChanges();
    
    this.http.get<any>(`${environment.apiUrl}/admin/users/recent?limit=3`)
      .pipe(
        timeout(10000),
        catchError(error => {
          console.error('❌ Erreur chargement utilisateurs récents:', error);
          return of({ success: false, data: [] });
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (response) => {
          console.log('✅ Réponse utilisateurs récents:', response);
          
          if (response.success && response.data) {
            this.recentUsers = response.data;
            console.log('👥 Utilisateurs récents chargés:', this.recentUsers.length);
          } else {
            console.warn('⚠️ Pas de données dans la réponse');
            this.recentUsers = [];
          }
          
          this.isLoadingUsers = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('❌ Erreur chargement utilisateurs récents:', error);
          this.recentUsers = [];
          this.isLoadingUsers = false;
          this.cdr.detectChanges();
        }
      });
  }

  loadDashboardData(): void {
    console.log('🔄 Chargement des données du dashboard...');
    this.loadRecentRequests();
    this.loadUpcomingAppointments();
  }

  loadRecentRequests(): void {
    console.log('🔄 Chargement des demandes récentes...');
    this.isLoadingRequests = true;
    this.cdr.detectChanges();
    
    this.appointmentService.getReceivedAppointments()
      .pipe(
        timeout(10000), // Timeout de 10 secondes
        catchError(error => {
          console.error('❌ Erreur timeout ou réseau:', error);
          return of({ success: false, data: [], message: 'Timeout' });
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (response) => {
          console.log('✅ Réponse demandes reçues:', response);
          
          if (response.success && response.data) {
            // Prendre les 3 dernières demandes (tous statuts)
            this.recentRequests = response.data
              .sort((a, b) => {
                const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                return dateB - dateA;
              })
              .slice(0, 3);
            
            console.log('📋 Demandes récentes chargées:', this.recentRequests.length);
          } else {
            console.warn('⚠️ Pas de données dans la réponse');
            this.recentRequests = [];
          }
          
          this.isLoadingRequests = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('❌ Erreur chargement demandes récentes:', error);
          this.recentRequests = [];
          this.isLoadingRequests = false;
          this.hasError = true;
          this.errorMessage = 'Impossible de charger les demandes';
          this.cdr.detectChanges();
        }
      });
  }

  loadUpcomingAppointments(): void {
    console.log('🔄 Chargement des rendez-vous à venir...');
    this.isLoadingAppointments = true;
    this.cdr.detectChanges();
    
    // Utiliser forkJoin au lieu de Promise.all
    forkJoin({
      sent: this.appointmentService.getSentAppointments(AppointmentStatus.ACCEPTED).pipe(
        timeout(10000),
        catchError(error => {
          console.error('❌ Erreur chargement rendez-vous envoyés:', error);
          return of({ success: false, data: [], message: 'Timeout' });
        })
      ),
      received: this.appointmentService.getReceivedAppointments(AppointmentStatus.ACCEPTED).pipe(
        timeout(10000),
        catchError(error => {
          console.error('❌ Erreur chargement rendez-vous reçus:', error);
          return of({ success: false, data: [], message: 'Timeout' });
        })
      )
    })
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: ({ sent: sentResponse, received: receivedResponse }) => {
        console.log('✅ Réponse rendez-vous envoyés:', sentResponse);
        console.log('✅ Réponse rendez-vous reçus:', receivedResponse);
        
        const sentAppointments = (sentResponse?.data || []).map(apt => ({ ...apt, isSent: true }));
        const receivedAppointments = (receivedResponse?.data || []).map(apt => ({ ...apt, isSent: false }));

        const allAppointments = [...sentAppointments, ...receivedAppointments];
        const now = new Date();

        // Prendre les 3 prochains rendez-vous
        this.upcomingAppointments = allAppointments
          .filter(apt => {
            try {
              const slotTime = new Date(apt.slotTime);
              return slotTime > now && !isNaN(slotTime.getTime());
            } catch (e) {
              console.warn('⚠️ Date invalide:', apt.slotTime);
              return false;
            }
          })
          .sort((a, b) => new Date(a.slotTime).getTime() - new Date(b.slotTime).getTime())
          .slice(0, 3);
        
        console.log('📅 Rendez-vous à venir chargés:', this.upcomingAppointments.length);
        this.isLoadingAppointments = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('❌ Erreur chargement rendez-vous à venir:', error);
        this.upcomingAppointments = [];
        this.isLoadingAppointments = false;
        this.hasError = true;
        this.errorMessage = 'Impossible de charger les rendez-vous';
        this.cdr.detectChanges();
      }
    });
  }

  getStatusLabel(status: AppointmentStatus): string {
    return this.appointmentService.getStatusLabel(status);
  }

  getStatusClass(status: AppointmentStatus): string {
    return this.appointmentService.getStatusClass(status);
  }

  formatDate(date: Date | string): string {
    return this.appointmentService.formatDate(date);
  }

  formatTime(date: Date | string): string {
    return this.appointmentService.formatTime(date);
  }

  getDay(date: Date | string): string {
    const d = new Date(date);
    return d.getDate().toString().padStart(2, '0');
  }

  getMonthYear(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
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

  getUserFullName(user: RecentUser): string {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.email;
  }

  getRoleLabel(role: string): string {
    switch (role) {
      case 'ADMIN': return 'Administrateur';
      case 'TEACHER': return 'Enseignant';
      case 'STUDENT': return 'Étudiant';
      case 'USER': return 'Utilisateur';
      default: return role;
    }
  }

  getUserStatusLabel(status: string): string {
    switch (status) {
      case 'ACTIVE': return 'Actif';
      case 'BLOCKED': return 'Bloqué';
      case 'PENDING': return 'En attente';
      case 'REJECTED': return 'Rejeté';
      default: return status;
    }
  }

  formatUserDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }
}
