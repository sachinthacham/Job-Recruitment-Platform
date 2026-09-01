import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MessagingService } from '../../../core/services/messaging.service';
import { AuthService } from '../../../core/services/auth.service';
import { Conversation, Message } from '../../../core/models/messaging.model';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="messages-container">
      <aside class="conversation-list">
        <header class="list-header">
          <h1>Messages</h1>
        </header>

        @if (isLoadingConversations()) {
          <div class="spinner"></div>
        } @else if (conversations().length === 0) {
          <div class="empty-state small">
            <p>No conversations yet.</p>
          </div>
        } @else {
          @for (conversation of conversations(); track conversation.id) {
            <a
              class="conversation-row"
              [class.active]="conversation.id === activeId()"
              [routerLink]="['..', 'messages', conversation.id]"
            >
              <p class="participants">{{ participantNames(conversation) }}</p>
              @if (conversation.messages.length > 0) {
                <p class="preview">{{ conversation.messages[0].content }}</p>
                <p class="time">{{ conversation.messages[0].createdAt | date: 'short' }}</p>
              } @else {
                <p class="preview">No messages yet</p>
              }
            </a>
          }
        }
      </aside>

      <section class="thread-panel">
        @if (!activeId()) {
          <div class="placeholder">
            <p>Select a conversation to start messaging.</p>
          </div>
        } @else if (isLoadingThread()) {
          <div class="spinner"></div>
        } @else {
          <header class="thread-header">
            <h2>{{ activeConversation() ? participantNames(activeConversation()!) : '' }}</h2>
          </header>

          <div class="thread-body">
            @for (message of messages(); track message.id) {
              <div class="bubble-row" [class.mine]="message.senderId === currentUserId">
                <div class="bubble">
                  <p class="sender">{{ message.sender.firstName }}</p>
                  <p class="content">{{ message.content }}</p>
                  <p class="time">{{ message.createdAt | date: 'shortTime' }}</p>
                </div>
              </div>
            }
            @if (messages().length === 0) {
              <div class="empty-state small">
                <p>No messages yet. Say hello!</p>
              </div>
            }
          </div>

          <div class="composer">
            <input
              type="text"
              placeholder="Type a message…"
              [(ngModel)]="draft"
              (keydown.enter)="send()"
              name="draft"
            />
            <button class="btn btn-primary" [disabled]="!draft.trim() || isSending()" (click)="send()">
              Send
            </button>
          </div>
        }
      </section>
    </div>
  `,
  styles: [`
    .messages-container {
      display: flex;
      height: calc(100vh - var(--rp-header-height, 64px));
      background: var(--rp-bg-primary);
    }
    .conversation-list {
      width: 320px;
      flex-shrink: 0;
      border-right: 1px solid var(--rp-border-light);
      overflow-y: auto;
      display: flex;
      flex-direction: column;
    }
    .list-header {
      padding: var(--rp-space-5) var(--rp-space-5) var(--rp-space-3);
      h1 { font-size: 1.3rem; font-weight: 800; }
    }
    .conversation-row {
      display: block;
      padding: var(--rp-space-4) var(--rp-space-5);
      border-bottom: 1px solid var(--rp-border-light);
      text-decoration: none;
      color: inherit;
    }
    .conversation-row:hover {
      background: var(--rp-bg-secondary);
    }
    .conversation-row.active {
      background: var(--rp-primary-50, #eff6ff);
    }
    .participants {
      font-weight: 700;
      margin-bottom: 2px;
    }
    .preview {
      color: var(--rp-text-secondary);
      font-size: 0.85rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      margin-bottom: 2px;
    }
    .time {
      color: var(--rp-text-tertiary);
      font-size: 0.7rem;
    }
    .thread-panel {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
    }
    .placeholder {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--rp-text-secondary);
    }
    .thread-header {
      padding: var(--rp-space-4) var(--rp-space-6);
      border-bottom: 1px solid var(--rp-border-light);
      h2 { font-size: 1.1rem; font-weight: 700; }
    }
    .thread-body {
      flex: 1;
      overflow-y: auto;
      padding: var(--rp-space-6);
      display: flex;
      flex-direction: column;
      gap: var(--rp-space-3);
    }
    .bubble-row {
      display: flex;
      justify-content: flex-start;
    }
    .bubble-row.mine {
      justify-content: flex-end;
    }
    .bubble {
      max-width: 60%;
      background: var(--rp-bg-secondary);
      border-radius: var(--rp-radius-lg);
      padding: var(--rp-space-3) var(--rp-space-4);
    }
    .bubble-row.mine .bubble {
      background: var(--rp-primary-500, #3b82f6);
      color: #fff;
    }
    .sender {
      font-size: 0.7rem;
      font-weight: 700;
      opacity: 0.7;
      margin-bottom: 2px;
    }
    .content {
      font-size: 0.95rem;
      white-space: pre-line;
    }
    .bubble .time {
      margin-top: 4px;
      opacity: 0.7;
    }
    .composer {
      display: flex;
      gap: var(--rp-space-3);
      padding: var(--rp-space-4) var(--rp-space-6);
      border-top: 1px solid var(--rp-border-light);
      input {
        flex: 1;
        padding: 10px 14px;
        border: 1.5px solid var(--rp-border-light);
        border-radius: var(--rp-radius-md);
      }
    }
    .empty-state.small {
      text-align: center;
      padding: var(--rp-space-8) var(--rp-space-4);
      color: var(--rp-text-secondary);
    }
  `],
})
export class MessagesComponent implements OnInit {
  isLoadingConversations = signal(true);
  isLoadingThread = signal(false);
  isSending = signal(false);
  conversations = signal<Conversation[]>([]);
  messages = signal<Message[]>([]);
  activeId = signal<string | null>(null);
  activeConversation = signal<Conversation | null>(null);
  draft = '';
  currentUserId: string | undefined;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly messagingService: MessagingService,
    private readonly authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.currentUserId = this.authService.currentUser()?.id;

    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      this.activeId.set(id);
      if (id) {
        this.loadThread(id);
      } else {
        this.messages.set([]);
        this.activeConversation.set(null);
      }
    });

    this.loadConversations();
  }

  private loadConversations(): void {
    this.messagingService.list().subscribe({
      next: (result) => {
        this.conversations.set(result.data);
        this.isLoadingConversations.set(false);
      },
      error: () => this.isLoadingConversations.set(false),
    });
  }

  private loadThread(id: string): void {
    this.isLoadingThread.set(true);

    this.messagingService.getOne(id).subscribe({
      next: (conversation) => this.activeConversation.set(conversation),
    });

    this.messagingService.getMessages(id).subscribe({
      next: (result) => {
        this.messages.set(result.data);
        this.isLoadingThread.set(false);
      },
      error: () => this.isLoadingThread.set(false),
    });

    this.messagingService.markRead(id).subscribe();
  }

  participantNames(conversation: Conversation): string {
    if (conversation.title) {
      return conversation.title;
    }

    const others = conversation.participants.filter((p) => p.userId !== this.currentUserId);
    if (others.length === 0) {
      return 'Conversation';
    }

    return others.map((p) => `${p.user.firstName} ${p.user.lastName}`).join(', ');
  }

  send(): void {
    const content = this.draft.trim();
    const id = this.activeId();
    if (!content || !id || this.isSending()) {
      return;
    }

    this.isSending.set(true);
    this.messagingService.sendMessage(id, { content }).subscribe({
      next: (message) => {
        this.messages.update((items) => [...items, message]);
        this.draft = '';
        this.isSending.set(false);
      },
      error: () => this.isSending.set(false),
    });
  }
}
