import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { 
  Teacher, 
  TeacherApplication, 
  TeacherRegistrationRequest,
  TeacherApplicationReview,
  ApiResponse,
  PaginatedResponse 
} from '../models/schedule';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TeacherService {
  private readonly API_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Inscription d'un enseignant (candidature)
  registerTeacher(request: TeacherRegistrationRequest): Observable<ApiResponse<TeacherApplication>> {
    const formData = new FormData();
    formData.append('email', request.email);
    formData.append('firstName', request.firstName);
    formData.append('lastName', request.lastName);
    formData.append('specialty', request.specialty);
    formData.append('schools', JSON.stringify(request.schools));
    
    if (request.phoneNumber) {
      formData.append('phoneNumber', request.phoneNumber);
    }
    
    if (request.profilePicture) {
      formData.append('profilePicture', request.profilePicture);
    }

    return this.http.post<ApiResponse<TeacherApplication>>(`${this.API_URL}/teachers/register`, formData);
  }

  // Récupérer toutes les candidatures en attente (Admin)
  getPendingApplications(): Observable<ApiResponse<TeacherApplication[]>> {
    return this.http.get<ApiResponse<TeacherApplication[]>>(`${this.API_URL}/admin/teachers/pending`);
  }

  // Valider ou rejeter une candidature (Admin)
  reviewApplication(review: TeacherApplicationReview): Observable<ApiResponse<void>> {
    const action = review.status === 'APPROVED' ? 'approve' : 'reject';
    const body = {
      action: action,
      rejectionReason: review.rejectionReason
    };
    return this.http.post<ApiResponse<void>>(`${this.API_URL}/admin/teachers/${review.applicationId}/validate`, body);
  }

  // Récupérer tous les enseignants actifs
  getActiveTeachers(page: number = 1, limit: number = 10): Observable<PaginatedResponse<Teacher>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<PaginatedResponse<Teacher>>(`${this.API_URL}/teachers`, { params });
  }

  // Récupérer tous les enseignants actifs sans pagination
  getAllActiveTeachers(): Observable<ApiResponse<Teacher[]>> {
    return this.http.get<ApiResponse<Teacher[]>>(`${this.API_URL}/admin/teachers`);
  }

  // Récupérer un enseignant par ID
  getTeacherById(id: string): Observable<ApiResponse<Teacher>> {
    return this.http.get<ApiResponse<Teacher>>(`${this.API_URL}/teachers/${id}`);
  }

  // Mettre à jour les informations d'un enseignant
  updateTeacher(id: string, teacher: Partial<Teacher>): Observable<ApiResponse<Teacher>> {
    return this.http.put<ApiResponse<Teacher>>(`${this.API_URL}/teachers/${id}`, teacher);
  }

  // Désactiver un enseignant
  deactivateTeacher(id: string): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>(`${this.API_URL}/teachers/${id}/deactivate`, {});
  }

  // Réactiver un enseignant
  activateTeacher(id: string): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>(`${this.API_URL}/teachers/${id}/activate`, {});
  }

  // Supprimer un enseignant
  deleteTeacher(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.API_URL}/admin/teachers/${id}`);
  }

  // Rechercher des enseignants
  searchTeachers(query: string): Observable<ApiResponse<Teacher[]>> {
    const params = new HttpParams().set('q', query);
    return this.http.get<ApiResponse<Teacher[]>>(`${this.API_URL}/teachers/search`, { params });
  }

  // Récupérer un enseignant par user ID
  getTeacherByUserId(userId: string): Observable<ApiResponse<Teacher>> {
    return this.http.get<ApiResponse<Teacher>>(`${this.API_URL}/teachers/user/${userId}`);
  }

  // Récupérer tous les enseignants (pour les sélecteurs)
  getAllTeachers(): Observable<ApiResponse<Teacher[]>> {
    return this.http.get<ApiResponse<Teacher[]>>(`${this.API_URL}/admin/teachers`);
  }
}