import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class JobService {
  constructor(private apiService: ApiService) {}

  findAll(filters: any = {}): Observable<any> {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
        params.append(key, filters[key]);
      }
    });
    const queryString = params.toString();
    return this.apiService.get<any>(`/jobs${queryString ? '?' + queryString : ''}`);
  }

  findCompanyJobs(companyId: string): Observable<any> {
    return this.apiService.get<any>(`/jobs/company/${companyId}`);
  }

  findOne(idOrSlug: string): Observable<any> {
    return this.apiService.get<any>(`/jobs/${idOrSlug}`);
  }

  create(data: any): Observable<any> {
    return this.apiService.post('/jobs', data);
  }

  update(id: string, data: any): Observable<any> {
    return this.apiService.patch(`/jobs/${id}`, data);
  }

  remove(id: string): Observable<any> {
    return this.apiService.delete(`/jobs/${id}`);
  }
}
