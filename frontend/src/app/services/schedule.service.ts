import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { 
  WeeklySchedule, 
  TimeSlot, 
  GenerateScheduleRequest, 
  UpdateTimeSlotRequest,
  CreateTimeSlotRequest,
  ApiResponse 
} from '../models/schedule';

@Injectable({
  providedIn: 'root'
})
export class ScheduleService {
  private readonly apiUrl = `${environment.apiUrl}/schedules`;

  constructor(private http: HttpClient) {}

  // Générer un emploi du temps (Admin)
  generateSchedule(request: GenerateScheduleRequest): Observable<ApiResponse<WeeklySchedule>> {
    return this.http.post<ApiResponse<WeeklySchedule>>(`${this.apiUrl}/generate`, request);
  }

  // Générer tous les emplois du temps pour une semaine (Admin)
  generateAllSchedules(weekNumber?: number, year?: number): Observable<ApiResponse<WeeklySchedule[]>> {
    let params = new HttpParams();
    if (weekNumber) params = params.set('weekNumber', weekNumber.toString());
    if (year) params = params.set('year', year.toString());
    
    return this.http.post<ApiResponse<WeeklySchedule[]>>(`${this.apiUrl}/generate`, {}, { params });
  }

  // Obtenir l'emploi du temps d'une classe
  getClassSchedule(
    classId: string, 
    weekNumber?: number, 
    year?: number
  ): Observable<ApiResponse<WeeklySchedule>> {
    let params = new HttpParams();
    if (weekNumber) params = params.set('weekNumber', weekNumber.toString());
    if (year) params = params.set('year', year.toString());
    
    return this.http.get<ApiResponse<WeeklySchedule>>(
      `${this.apiUrl}/class/${classId}`,
      { params }
    );
  }

  // Obtenir les emplois du temps d'un enseignant
  getTeacherSchedules(
    teacherId: string,
    weekNumber?: number,
    year?: number
  ): Observable<ApiResponse<WeeklySchedule[]>> {
    let params = new HttpParams();
    if (weekNumber) params = params.set('weekNumber', weekNumber.toString());
    if (year) params = params.set('year', year.toString());
    
    return this.http.get<ApiResponse<WeeklySchedule[]>>(
      `${this.apiUrl}/teacher/${teacherId}`,
      { params }
    );
  }

  // Obtenir tous les emplois du temps (Admin)
  getAllSchedules(
    weekNumber?: number,
    year?: number
  ): Observable<ApiResponse<WeeklySchedule[]>> {
    let params = new HttpParams();
    if (weekNumber) params = params.set('weekNumber', weekNumber.toString());
    if (year) params = params.set('year', year.toString());
    
    return this.http.get<ApiResponse<WeeklySchedule[]>>(
      `${this.apiUrl}/all`,
      { params }
    );
  }

  // Obtenir les emplois du temps de la semaine courante
  getCurrentWeekSchedules(): Observable<ApiResponse<WeeklySchedule[]>> {
    return this.http.get<ApiResponse<WeeklySchedule[]>>(`${this.apiUrl}/current`);
  }

  // Créer un créneau (Admin)
  createTimeSlot(request: CreateTimeSlotRequest): Observable<ApiResponse<TimeSlot>> {
    return this.http.post<ApiResponse<TimeSlot>>(
      `${this.apiUrl}/timeslot`,
      request
    );
  }

  // Modifier un créneau (Admin)
  updateTimeSlot(
    slotId: string,
    request: UpdateTimeSlotRequest
  ): Observable<ApiResponse<TimeSlot>> {
    return this.http.put<ApiResponse<TimeSlot>>(
      `${this.apiUrl}/timeslot/${slotId}`,
      request
    );
  }

  // Utilitaires
  getCurrentWeekNumber(): number {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const diff = now.getTime() - start.getTime();
    const oneWeek = 1000 * 60 * 60 * 24 * 7;
    return Math.ceil(diff / oneWeek);
  }

  getCurrentYear(): number {
    return new Date().getFullYear();
  }

  getWeekStartDate(weekNumber: number, year: number): Date {
    const jan1 = new Date(year, 0, 1);
    const daysOffset = (weekNumber - 1) * 7;
    const weekStart = new Date(jan1.getTime() + daysOffset * 24 * 60 * 60 * 1000);
    
    // Ajuster au lundi
    const dayOfWeek = weekStart.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    weekStart.setDate(weekStart.getDate() + diff);
    
    return weekStart;
  }

  formatTime(time: string): string {
    return time.substring(0, 5); // HH:mm
  }

  getDayLabel(day: string): string {
    const labels: { [key: string]: string } = {
      'MONDAY': 'Lundi',
      'TUESDAY': 'Mardi',
      'WEDNESDAY': 'Mercredi',
      'THURSDAY': 'Jeudi',
      'FRIDAY': 'Vendredi',
      'SATURDAY': 'Samedi',
      'SUNDAY': 'Dimanche'
    };
    return labels[day] || day;
  }
}
