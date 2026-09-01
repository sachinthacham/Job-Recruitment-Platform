import { Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ApiService } from './api.service';
import { PaginatedResult } from '../models/application.model';
import { AppNotification } from '../models/notification.model';

export interface NotificationFilters {
  isRead?: boolean;
  page?: number;
  perPage?: number;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  /** Shared unread-count signal so the shell bell badge stays in sync across pages. */
  readonly unreadCount = signal(0);

  constructor(private readonly apiService: ApiService) {}

  list(filters: NotificationFilters = {}): Observable<PaginatedResult<AppNotification>> {
    return this.apiService.get<PaginatedResult<AppNotification>>('/notifications', {
      perPage: 50,
      ...filters,
    });
  }

  refreshUnreadCount(): void {
    this.apiService
      .get<{ count: number }>('/notifications/unread-count')
      .subscribe((result) => this.unreadCount.set(result.count));
  }

  markRead(id: string): Observable<AppNotification> {
    return this.apiService
      .patch<AppNotification>(`/notifications/${id}/read`, {})
      .pipe(tap(() => this.unreadCount.update((count) => Math.max(0, count - 1))));
  }

  markAllRead(): Observable<{ count: number }> {
    return this.apiService
      .patch<{ count: number }>('/notifications/read-all', {})
      .pipe(tap(() => this.unreadCount.set(0)));
  }

  remove(id: string): Observable<void> {
    return this.apiService.delete<void>(`/notifications/${id}`);
  }
}
