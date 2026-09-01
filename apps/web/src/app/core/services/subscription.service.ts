import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { PaginatedResult } from '../models/application.model';
import { Payment, PlanDetails, Subscription, SubscriptionPlan } from '../models/subscription.model';

@Injectable({ providedIn: 'root' })
export class SubscriptionService {
  constructor(private readonly apiService: ApiService) {}

  getPlans(): Observable<PlanDetails[]> {
    return this.apiService.get<PlanDetails[]>('/subscriptions/plans');
  }

  getCurrent(tenantId?: string): Observable<Subscription> {
    return this.apiService.get<Subscription>('/subscriptions/current', tenantId ? { tenantId } : undefined);
  }

  subscribe(plan: SubscriptionPlan, tenantId?: string): Observable<Subscription> {
    return this.apiService.post<Subscription>('/subscriptions/subscribe', { plan, tenantId });
  }

  cancel(tenantId?: string): Observable<Subscription> {
    const query = tenantId ? `?tenantId=${tenantId}` : '';
    return this.apiService.patch<Subscription>(`/subscriptions/cancel${query}`, {});
  }

  getPayments(page = 1, perPage = 20, tenantId?: string): Observable<PaginatedResult<Payment>> {
    return this.apiService.get<PaginatedResult<Payment>>('/subscriptions/payments', {
      page,
      perPage,
      ...(tenantId ? { tenantId } : {}),
    });
  }
}
