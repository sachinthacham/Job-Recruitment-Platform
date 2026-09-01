import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import {
  CandidateDashboardStats,
  PlatformDashboardStats,
  RecruiterDashboardStats,
} from '../models/analytics.model';

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  constructor(private readonly apiService: ApiService) {}

  getRecruiterDashboard(companyId?: string): Observable<RecruiterDashboardStats> {
    return this.apiService.get<RecruiterDashboardStats>(
      '/analytics/recruiter',
      companyId ? { companyId } : undefined,
    );
  }

  getCandidateDashboard(): Observable<CandidateDashboardStats> {
    return this.apiService.get<CandidateDashboardStats>('/analytics/candidate');
  }

  getPlatformDashboard(): Observable<PlatformDashboardStats> {
    return this.apiService.get<PlatformDashboardStats>('/analytics/platform');
  }
}
