import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Course, CourseRequest } from '../models/course';
import { environment } from '../../environments/environment';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  private apiUrl = `${environment.apiUrl}/courses`;

  constructor(private http: HttpClient) {}

  getAllCourses(): Observable<ApiResponse<Course[]>> {
    return this.http.get<ApiResponse<Course[]>>(this.apiUrl);
  }

  getPublicCourses(): Observable<ApiResponse<Course[]>> {
    return this.http.get<ApiResponse<Course[]>>(`${this.apiUrl}/public`);
  }

  getCourseById(id: string): Observable<ApiResponse<Course>> {
    return this.http.get<ApiResponse<Course>>(`${this.apiUrl}/${id}`);
  }

  createCourse(request: CourseRequest): Observable<ApiResponse<Course>> {
    return this.http.post<ApiResponse<Course>>(this.apiUrl, request);
  }

  updateCourse(id: string, request: CourseRequest): Observable<ApiResponse<Course>> {
    return this.http.put<ApiResponse<Course>>(`${this.apiUrl}/${id}`, request);
  }

  deleteCourse(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }
}
