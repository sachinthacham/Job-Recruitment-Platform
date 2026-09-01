import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { PaginatedResult } from '../models/application.model';
import { AccountStatus, AdminCompany, AdminUser, AuditLogEntry } from '../models/admin.model';
import { PlatformDashboardStats } from '../models/analytics.model';

export interface AdminUserFilters {
  role?: string;
  status?: AccountStatus;
  search?: string;
  page?: number;
  perPage?: number;
}

export interface AdminCompanyFilters {
  search?: string;
  page?: number;
  perPage?: number;
}

export interface AuditLogFilters {
  userId?: string;
  tenantId?: string;
  entityType?: string;
  action?: string;
  page?: number;
  perPage?: number;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  constructor(private readonly apiService: ApiService) {}

  listUsers(filters: AdminUserFilters = {}): Observable<PaginatedResult<AdminUser>> {
    return this.apiService.get<PaginatedResult<AdminUser>>('/admin/users', {
      perPage: 20,
      ...filters,
    });
  }

  updateUserStatus(id: string, status: AccountStatus): Observable<AdminUser> {
    return this.apiService.patch<AdminUser>(`/admin/users/${id}/status`, { status });
  }

  listCompanies(filters: AdminCompanyFilters = {}): Observable<PaginatedResult<AdminCompany>> {
    return this.apiService.get<PaginatedResult<AdminCompany>>('/admin/companies', {
      perPage: 20,
      ...filters,
    });
  }

  listAuditLogs(filters: AuditLogFilters = {}): Observable<PaginatedResult<AuditLogEntry>> {
    return this.apiService.get<PaginatedResult<AuditLogEntry>>('/admin/audit-logs', {
      perPage: 20,
      ...filters,
    });
  }

  getStats(): Observable<PlatformDashboardStats> {
    return this.apiService.get<PlatformDashboardStats>('/admin/stats');
  }
}
