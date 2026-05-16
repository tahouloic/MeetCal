import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Stats, Activity } from '../models/stats';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class StatsService {
  private http = inject(HttpClient);
  private readonly API_URL = environment.apiUrl;

  // BehaviorSubject pour les statistiques (programmation réactive - CHAP 3)
  private stats$: BehaviorSubject<Stats | null> = new BehaviorSubject<Stats | null>(null);

  // BehaviorSubject pour les activités récentes
  private activities$: BehaviorSubject<Activity[]> = new BehaviorSubject<Activity[]>([]);

  constructor() { }

  // Récupérer les statistiques depuis l'API
  getStats(): Observable<Stats> {
    return this.http.get<{ success: boolean; data: Stats }>(`${this.API_URL}/stats`).pipe(
      map(response => response.data),
      tap(stats => {
        console.log('📊 Statistiques reçues:', stats);
        this.stats$.next(stats);
      })
    );
  }

  // Mettre à jour les statistiques
  updateStats(newStats: Stats): void {
    this.stats$.next(newStats);
  }

  // Récupérer les activités récentes
  getRecentActivities(): Observable<Activity[]> {
    return this.activities$.asObservable();
  }

  // Ajouter une nouvelle activité
  addActivity(activity: Activity): void {
    const currentActivities = this.activities$.value;
    this.activities$.next([activity, ...currentActivities]);
  }
}