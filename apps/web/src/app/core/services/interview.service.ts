import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { PaginatedResult } from '../models/application.model';
import {
  Interview,
  InterviewFeedback,
  InterviewStatus,
  InterviewType,
} from '../models/interview.model';

export interface ScheduleInterviewRequest {
  applicationId: string;
  type: InterviewType;
  title: string;
  scheduledAt: string;
  duration: number;
  location?: string;
  meetingUrl?: string;
  notes?: string;
  interviewerIds: string[];
}

export interface SubmitFeedbackRequest {
  overallRating: number;
  technicalRating?: number;
  communicationRating?: number;
  cultureFitRating?: number;
  strengths?: string;
  weaknesses?: string;
  recommendation: string;
  privateNotes?: string;
}

export interface InterviewFilters {
  status?: InterviewStatus;
  page?: number;
  perPage?: number;
}

@Injectable({ providedIn: 'root' })
export class InterviewService {
  constructor(private readonly apiService: ApiService) {}

  schedule(request: ScheduleInterviewRequest): Observable<Interview> {
    return this.apiService.post<Interview>('/interviews', request);
  }

  getMyInterviews(filters: InterviewFilters = {}): Observable<PaginatedResult<Interview>> {
    return this.apiService.get<PaginatedResult<Interview>>('/interviews/me', {
      perPage: 50,
      ...filters,
    });
  }

  getByApplication(
    applicationId: string,
    filters: InterviewFilters = {},
  ): Observable<PaginatedResult<Interview>> {
    return this.apiService.get<PaginatedResult<Interview>>(
      `/interviews/application/${applicationId}`,
      { perPage: 50, ...filters },
    );
  }

  getOne(id: string): Observable<Interview> {
    return this.apiService.get<Interview>(`/interviews/${id}`);
  }

  updateStatus(id: string, status: InterviewStatus): Observable<Interview> {
    return this.apiService.patch<Interview>(`/interviews/${id}/status`, { status });
  }

  cancel(id: string): Observable<Interview> {
    return this.apiService.delete<Interview>(`/interviews/${id}`);
  }

  submitFeedback(id: string, request: SubmitFeedbackRequest): Observable<InterviewFeedback> {
    return this.apiService.post<InterviewFeedback>(`/interviews/${id}/feedback`, request);
  }

  getFeedback(id: string): Observable<InterviewFeedback[]> {
    return this.apiService.get<InterviewFeedback[]>(`/interviews/${id}/feedback`);
  }
}
