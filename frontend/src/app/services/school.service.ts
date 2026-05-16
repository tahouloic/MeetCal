import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { School, SchoolRequest } from '../models/school';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SchoolService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/schools`;

  getAll(): Observable<School[]> {
    return this.http.get<School[]>(this.apiUrl);
  }

  getById(id: string): Observable<School> {
    return this.http.get<School>(`${this.apiUrl}/${id}`);
  }

  create(request: SchoolRequest): Observable<School> {
    return this.http.post<School>(this.apiUrl, request);
  }

  update(id: string, request: SchoolRequest): Observable<School> {
    return this.http.put<School>(`${this.apiUrl}/${id}`, request);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
