import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { PaginatedResult } from '../models/application.model';
import { Currency, EmploymentType, Offer, OfferStatus } from '../models/offer.model';

export interface CreateOfferRequest {
  applicationId: string;
  salary: number;
  currency: Currency;
  benefits?: string;
  startDate: string;
  employmentType: EmploymentType;
  expirationDate: string;
  additionalTerms?: string;
}

export interface OfferFilters {
  status?: OfferStatus;
  page?: number;
  perPage?: number;
}

@Injectable({ providedIn: 'root' })
export class OfferService {
  constructor(private readonly apiService: ApiService) {}

  create(request: CreateOfferRequest): Observable<Offer> {
    return this.apiService.post<Offer>('/offers', request);
  }

  getMyOffers(filters: OfferFilters = {}): Observable<PaginatedResult<Offer>> {
    return this.apiService.get<PaginatedResult<Offer>>('/offers/me', {
      perPage: 50,
      ...filters,
    });
  }

  getByApplication(applicationId: string): Observable<Offer> {
    return this.apiService.get<Offer>(`/offers/application/${applicationId}`);
  }

  getOne(id: string): Observable<Offer> {
    return this.apiService.get<Offer>(`/offers/${id}`);
  }

  send(id: string): Observable<Offer> {
    return this.apiService.patch<Offer>(`/offers/${id}/send`, {});
  }

  respond(id: string, decision: 'ACCEPTED' | 'REJECTED'): Observable<Offer> {
    return this.apiService.patch<Offer>(`/offers/${id}/respond`, { decision });
  }

  withdraw(id: string): Observable<Offer> {
    return this.apiService.delete<Offer>(`/offers/${id}`);
  }
}
