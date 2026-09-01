import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Application, ApplicationStatus, PaginatedResult } from '../models/application.model';

export interface ApplyToJobRequest {
  jobId: string;
  coverLetter?: string;
}

export interface UpdateApplicationStatusRequest {
  status: ApplicationStatus;
  notes?: string;
}

export interface ApplicationFilters {
  status?: ApplicationStatus;
  page?: number;
  perPage?: number;
}

@Injectable({
  providedIn: 'root',
})
export class ApplicationService {
  constructor(private readonly apiService: ApiService) {}

  apply(request: ApplyToJobRequest): Observable<Application> {
    return this.apiService.post<Application>('/applications', request);
  }

  getMyApplications(filters: ApplicationFilters = {}): Observable<PaginatedResult<Application>> {
    return this.apiService.get<PaginatedResult<Application>>('/applications/me', {
      perPage: 50,
      ...filters,
    });
  }

  getJobApplications(
    jobId: string,
    filters: ApplicationFilters = {},
  ): Observable<PaginatedResult<Application>> {
    return this.apiService.get<PaginatedResult<Application>>(`/applications/job/${jobId}`, {
      perPage: 50,
      ...filters,
    });
  }

  getOne(id: string): Observable<Application> {
    return this.apiService.get<Application>(`/applications/${id}`);
  }

  updateStatus(id: string, request: UpdateApplicationStatusRequest): Observable<Application> {
    return this.apiService.patch<Application>(`/applications/${id}/status`, request);
  }

  withdraw(id: string): Observable<void> {
    return this.apiService.delete<void>(`/applications/${id}`);
  }
}
