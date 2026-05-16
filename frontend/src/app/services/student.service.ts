import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Student, StudentRequest, StudentImportResponse } from '../models/student';
import { environment } from '../../environments/environment';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  private apiUrl = `${environment.apiUrl}/students`;

  constructor(private http: HttpClient) {}

  getAllStudents(): Observable<ApiResponse<Student[]>> {
    return this.http.get<ApiResponse<Student[]>>(this.apiUrl);
  }

  getStudentById(id: string): Observable<ApiResponse<Student>> {
    return this.http.get<ApiResponse<Student>>(`${this.apiUrl}/${id}`);
  }

  createStudent(request: StudentRequest): Observable<ApiResponse<Student>> {
    return this.http.post<ApiResponse<Student>>(this.apiUrl, request);
  }

  updateStudent(id: string, request: StudentRequest): Observable<ApiResponse<Student>> {
    return this.http.put<ApiResponse<Student>>(`${this.apiUrl}/${id}`, request);
  }

  deleteStudent(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }

  importStudentsFromCsv(file: File): Observable<ApiResponse<StudentImportResponse>> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<ApiResponse<StudentImportResponse>>(`${this.apiUrl}/import-csv`, formData);
  }
}
