import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Room, RoomRequest } from '../models/room';
import { environment } from '../../environments/environment';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class RoomService {
  private apiUrl = `${environment.apiUrl}/rooms`;

  constructor(private http: HttpClient) {}

  getAllRooms(): Observable<ApiResponse<Room[]>> {
    return this.http.get<ApiResponse<Room[]>>(this.apiUrl);
  }

  getRoomById(id: string): Observable<ApiResponse<Room>> {
    return this.http.get<ApiResponse<Room>>(`${this.apiUrl}/${id}`);
  }

  createRoom(request: RoomRequest): Observable<ApiResponse<Room>> {
    return this.http.post<ApiResponse<Room>>(this.apiUrl, request);
  }

  updateRoom(id: string, request: RoomRequest): Observable<ApiResponse<Room>> {
    return this.http.put<ApiResponse<Room>>(`${this.apiUrl}/${id}`, request);
  }

  deleteRoom(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }
}
