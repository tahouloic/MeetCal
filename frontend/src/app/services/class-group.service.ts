import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ClassGroup, ClassGroupRequest } from '../models/class-group';
import { environment } from '../../environments/environment';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class ClassGroupService {
  private apiUrl = `${environment.apiUrl}/class-groups`;

  constructor(private http: HttpClient) {}

  getAllClassGroups(): Observable<ApiResponse<ClassGroup[]>> {
    return this.http.get<ApiResponse<ClassGroup[]>>(this.apiUrl);
  }

  getClassGroupById(id: string): Observable<ApiResponse<ClassGroup>> {
    return this.http.get<ApiResponse<ClassGroup>>(`${this.apiUrl}/${id}`);
  }

  createClassGroup(request: ClassGroupRequest): Observable<ApiResponse<ClassGroup>> {
    return this.http.post<ApiResponse<ClassGroup>>(this.apiUrl, request);
  }

  updateClassGroup(id: string, request: ClassGroupRequest): Observable<ApiResponse<ClassGroup>> {
    return this.http.put<ApiResponse<ClassGroup>>(`${this.apiUrl}/${id}`, request);
  }

  deleteClassGroup(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }
}
