import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AvailabilitySlot {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface SaveAvailabilitiesRequest {
  availabilities: AvailabilitySlot[];
}

export interface AvailabilitySlotResponse {
  id: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface AvailabilityResponse {
  teacherId: string;
  teacherName: string;
  availabilities: AvailabilitySlotResponse[];
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

@Injectable({
  providedIn: 'root'
})
export class AvailabilityService {
  private apiUrl = `${environment.apiUrl}/availabilities`;

  constructor(private http: HttpClient) {}

  saveAvailabilities(request: SaveAvailabilitiesRequest): Observable<ApiResponse<AvailabilityResponse>> {
    return this.http.post<ApiResponse<AvailabilityResponse>>(this.apiUrl, request);
  }

  getMyAvailabilities(): Observable<ApiResponse<AvailabilityResponse>> {
    return this.http.get<ApiResponse<AvailabilityResponse>>(`${this.apiUrl}/me`);
  }

  getTeacherAvailabilities(teacherId: string): Observable<ApiResponse<AvailabilityResponse>> {
    return this.http.get<ApiResponse<AvailabilityResponse>>(`${this.apiUrl}/teacher/${teacherId}`);
  }
}
