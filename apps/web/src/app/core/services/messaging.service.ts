import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { PaginatedResult } from '../models/application.model';
import { Conversation, Message } from '../models/messaging.model';

export interface CreateConversationRequest {
  participantIds: string[];
  title?: string;
  initialMessage?: string;
}

export interface SendMessageRequest {
  content: string;
  attachmentUrl?: string;
  attachmentName?: string;
}

@Injectable({ providedIn: 'root' })
export class MessagingService {
  constructor(private readonly apiService: ApiService) {}

  create(request: CreateConversationRequest): Observable<Conversation> {
    return this.apiService.post<Conversation>('/conversations', request);
  }

  list(page = 1, perPage = 50): Observable<PaginatedResult<Conversation>> {
    return this.apiService.get<PaginatedResult<Conversation>>('/conversations', {
      page,
      perPage,
    });
  }

  getOne(id: string): Observable<Conversation> {
    return this.apiService.get<Conversation>(`/conversations/${id}`);
  }

  getMessages(id: string, page = 1, perPage = 50): Observable<PaginatedResult<Message>> {
    return this.apiService.get<PaginatedResult<Message>>(`/conversations/${id}/messages`, {
      page,
      perPage,
    });
  }

  sendMessage(id: string, request: SendMessageRequest): Observable<Message> {
    return this.apiService.post<Message>(`/conversations/${id}/messages`, request);
  }

  markRead(id: string): Observable<void> {
    return this.apiService.patch<void>(`/conversations/${id}/read`, {});
  }
}
