import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CandidateService {
  constructor(private apiService: ApiService) {}

  getProfile(): Observable<any> {
    return this.apiService.get<any>('/candidates/me');
  }

  updateProfile(data: any): Observable<any> {
    return this.apiService.patch('/candidates/me', data);
  }

  addSkill(data: any): Observable<any> {
    return this.apiService.post('/candidates/me/skills', data);
  }

  removeSkill(id: string): Observable<any> {
    return this.apiService.delete(`/candidates/me/skills/${id}`);
  }

  addEducation(data: any): Observable<any> {
    return this.apiService.post('/candidates/me/education', data);
  }

  removeEducation(id: string): Observable<any> {
    return this.apiService.delete(`/candidates/me/education/${id}`);
  }

  addExperience(data: any): Observable<any> {
    return this.apiService.post('/candidates/me/experience', data);
  }

  removeExperience(id: string): Observable<any> {
    return this.apiService.delete(`/candidates/me/experience/${id}`);
  }
}
