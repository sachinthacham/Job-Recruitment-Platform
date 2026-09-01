import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RecruiterService {
  constructor(private apiService: ApiService) {}

  getProfile(): Observable<any> {
    return this.apiService.get<any>('/recruiters/me');
  }

  updateProfile(data: any): Observable<any> {
    return this.apiService.patch('/recruiters/me', data);
  }
}
