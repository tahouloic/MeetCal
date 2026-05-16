import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FieldOfStudy, FieldOfStudyRequest } from '../models/field-of-study';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FieldOfStudyService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/fields-of-study`;

  getAll(): Observable<FieldOfStudy[]> {
    return this.http.get<FieldOfStudy[]>(this.apiUrl);
  }

  getById(id: string): Observable<FieldOfStudy> {
    return this.http.get<FieldOfStudy>(`${this.apiUrl}/${id}`);
  }

  create(request: FieldOfStudyRequest): Observable<FieldOfStudy> {
    return this.http.post<FieldOfStudy>(this.apiUrl, request);
  }

  update(id: string, request: FieldOfStudyRequest): Observable<FieldOfStudy> {
    return this.http.put<FieldOfStudy>(`${this.apiUrl}/${id}`, request);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
