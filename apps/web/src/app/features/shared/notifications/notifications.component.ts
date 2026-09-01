import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../../core/services/notification.service';
import { AppNotification, NOTIFICATION_ICONS } from '../../../core/models/notification.model';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notifications-container">
      <header class="page-header">
        <div>
          <h1>Notifications</h1>
          <p>Stay up to date with your applications, interviews, and messages.</p>
        </div>
        @if (notifications().length > 0) {
          <button class="btn btn-outline" (click)="markAllRead()">Mark all as read</button>
        }
      </header>

      @if (isLoading()) {
        <div class="spinner"></div>
      } @else if (notifications().length === 0) {
        <div class="empty-state">
          <h3>No notifications yet</h3>
          <p>We'll let you know when something happens.</p>
        </div>
      } @else {
        <div class="notifications-list">
          @for (notification of notifications(); track notification.id) {
            <div
              class="notification-row"
              [class.unread]="!notification.isRead"
              (click)="onRowClick(notification)"
            >
              <span class="icon">{{ icons[notification.type] }}</span>
              <div class="body">
                <p class="title">{{ notification.title }}</p>
                <p class="message">{{ notification.message }}</p>
                <p class="time">{{ notification.createdAt | date: 'short' }}</p>
              </div>
              <button
                class="btn-dismiss"
                title="Dismiss"
                (click)="dismiss(notification, $event)"
              >
                ✕
              </button>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .notifications-container {
      max-width: 800px;
      margin: 0 auto;
      padding: var(--rp-space-8) var(--rp-space-6);
    }
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: var(--rp-space-8);
      h1 { font-size: 2rem; font-weight: 800; }
      p { color: var(--rp-text-secondary); margin-top: var(--rp-space-2); }
    }
    .btn-outline {
      border: 1px solid var(--rp-border-light);
      background: transparent;
      cursor: pointer;
      border-radius: var(--rp-radius-md);
      padding: var(--rp-space-2) var(--rp-space-4);
      font-weight: 600;
      white-space: nowrap;
    }
    .notifications-list {
      display: flex;
      flex-direction: column;
      gap: var(--rp-space-3);
    }
    .notification-row {
      display: flex;
      align-items: flex-start;
      gap: var(--rp-space-4);
      background: var(--rp-bg-primary);
      border: 1px solid var(--rp-border-light);
      border-radius: var(--rp-radius-lg);
      padding: var(--rp-space-4) var(--rp-space-5);
      cursor: pointer;
      transition: background 0.15s;
    }
    .notification-row:hover {
      background: var(--rp-bg-secondary);
    }
    .notification-row.unread {
      background: var(--rp-primary-50, #eff6ff);
      border-color: var(--rp-primary-100, #dbeafe);
    }
    .notification-row.unread .title {
      font-weight: 800;
    }
    .icon {
      font-size: 1.4rem;
      flex-shrink: 0;
    }
    .body {
      flex: 1;
      min-width: 0;
    }
    .title {
      font-weight: 600;
      margin-bottom: 2px;
    }
    .message {
      color: var(--rp-text-secondary);
      font-size: 0.9rem;
      margin-bottom: var(--rp-space-1);
    }
    .time {
      color: var(--rp-text-tertiary);
      font-size: 0.75rem;
    }
    .btn-dismiss {
      background: none;
      border: none;
      color: var(--rp-text-tertiary);
      cursor: pointer;
      font-size: 0.9rem;
      flex-shrink: 0;
      padding: var(--rp-space-1);
    }
    .btn-dismiss:hover {
      color: var(--rp-text-primary);
    }
    .empty-state {
      text-align: center;
      padding: var(--rp-space-12) var(--rp-space-4);
      background: var(--rp-bg-secondary);
      border-radius: var(--rp-radius-xl);
      h3 { font-size: 1.5rem; font-weight: 700; margin-bottom: var(--rp-space-2); }
      p { color: var(--rp-text-secondary); }
    }
  `],
})
export class NotificationsComponent implements OnInit {
  isLoading = signal(true);
  notifications = signal<AppNotification[]>([]);
  icons = NOTIFICATION_ICONS;

  constructor(private readonly notificationService: NotificationService) {}

  ngOnInit(): void {
    this.notificationService.list().subscribe({
      next: (result) => {
        this.notifications.set(result.data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  onRowClick(notification: AppNotification): void {
    if (notification.isRead) {
      return;
    }

    this.notificationService.markRead(notification.id).subscribe(() => {
      this.notifications.update((items) =>
        items.map((item) => (item.id === notification.id ? { ...item, isRead: true } : item)),
      );
    });
  }

  markAllRead(): void {
    this.notificationService.markAllRead().subscribe(() => {
      this.notifications.update((items) => items.map((item) => ({ ...item, isRead: true })));
    });
  }

  dismiss(notification: AppNotification, event: Event): void {
    event.stopPropagation();
    this.notificationService.remove(notification.id).subscribe(() => {
      this.notifications.update((items) => items.filter((item) => item.id !== notification.id));
    });
  }
}
