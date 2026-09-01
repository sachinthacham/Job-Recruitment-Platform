import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CompanyService {
  constructor(private apiService: ApiService) {}

  create(data: any): Observable<any> {
    return this.apiService.post('/companies', data);
  }

  findAll(): Observable<any> {
    return this.apiService.get<any>('/companies');
  }

  findOne(id: string): Observable<any> {
    return this.apiService.get<any>(`/companies/${id}`);
  }

  update(id: string, data: any): Observable<any> {
    return this.apiService.patch(`/companies/${id}`, data);
  }
}
