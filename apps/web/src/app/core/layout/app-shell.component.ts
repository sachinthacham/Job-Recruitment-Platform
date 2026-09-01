import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, RouterOutlet } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

export interface ShellNavItem {
  label: string;
  path: string;
  icon: string;
  /** If set, the item is only shown when the current user has one of these roles. */
  roles?: string[];
}

const UNREAD_POLL_INTERVAL_MS = 30000;

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet],
  template: `
    <div class="shell">
      <aside class="sidebar">
        <div class="brand" routerLink="/">RecruitPro</div>
        <nav class="nav">
          @for (item of navItems; track item.path) {
            <a
              class="nav-item"
              [routerLink]="item.path"
              routerLinkActive="active"
              [routerLinkActiveOptions]="{ exact: false }"
            >
              <span class="icon">{{ item.icon }}</span>
              <span>{{ item.label }}</span>
            </a>
          }
        </nav>
      </aside>

      <div class="main">
        <header class="topbar">
          <span class="role-label">{{ roleLabel }}</span>
          <div class="topbar-actions">
            <a class="bell" routerLink="notifications" title="Notifications">
              🔔
              @if (notifications.unreadCount() > 0) {
                <span class="badge">{{ notifications.unreadCount() }}</span>
              }
            </a>
            <span class="user-name">{{ userName }}</span>
            <button class="btn-logout" (click)="logout()">Log out</button>
          </div>
        </header>

        <main class="content">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
  styles: [`
    .shell {
      display: flex;
      min-height: 100vh;
      background: var(--rp-bg-secondary);
    }
    .sidebar {
      width: var(--rp-sidebar-width, 240px);
      flex-shrink: 0;
      background: var(--rp-bg-primary);
      border-right: 1px solid var(--rp-border-light);
      display: flex;
      flex-direction: column;
      padding: var(--rp-space-6) var(--rp-space-4);
    }
    .brand {
      font-size: 1.25rem;
      font-weight: 800;
      color: var(--rp-primary-600, var(--rp-text-primary));
      cursor: pointer;
      margin-bottom: var(--rp-space-8);
      padding: 0 var(--rp-space-2);
    }
    .nav {
      display: flex;
      flex-direction: column;
      gap: var(--rp-space-1);
    }
    .nav-item {
      display: flex;
      align-items: center;
      gap: var(--rp-space-3);
      padding: var(--rp-space-3) var(--rp-space-4);
      border-radius: var(--rp-radius-md);
      color: var(--rp-text-secondary);
      text-decoration: none;
      font-weight: 600;
      font-size: 0.95rem;
      transition: background var(--rp-transition-fast, 0.15s);
    }
    .nav-item:hover {
      background: var(--rp-bg-secondary);
    }
    .nav-item.active {
      background: var(--rp-bg-secondary);
      color: var(--rp-text-primary);
    }
    .icon {
      font-size: 1.1rem;
    }
    .main {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
    }
    .topbar {
      height: var(--rp-header-height, 64px);
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 var(--rp-space-8);
      background: var(--rp-bg-primary);
      border-bottom: 1px solid var(--rp-border-light);
    }
    .role-label {
      font-weight: 700;
      color: var(--rp-text-secondary);
      text-transform: uppercase;
      font-size: 0.8rem;
      letter-spacing: 0.05em;
    }
    .topbar-actions {
      display: flex;
      align-items: center;
      gap: var(--rp-space-5);
    }
    .bell {
      position: relative;
      font-size: 1.2rem;
      text-decoration: none;
      cursor: pointer;
    }
    .badge {
      position: absolute;
      top: -6px;
      right: -8px;
      background: var(--rp-danger, #e5484d);
      color: #fff;
      font-size: 0.65rem;
      font-weight: 700;
      border-radius: var(--rp-radius-full, 999px);
      padding: 1px 5px;
      min-width: 16px;
      text-align: center;
    }
    .user-name {
      font-weight: 600;
      color: var(--rp-text-primary);
    }
    .btn-logout {
      background: none;
      border: 1px solid var(--rp-border-light);
      border-radius: var(--rp-radius-md);
      padding: var(--rp-space-2) var(--rp-space-4);
      font-weight: 600;
      color: var(--rp-text-secondary);
      cursor: pointer;
    }
    .btn-logout:hover {
      background: var(--rp-bg-secondary);
    }
    .content {
      flex: 1;
      overflow-y: auto;
    }
  `],
})
export class AppShellComponent implements OnInit, OnDestroy {
  navItems: ShellNavItem[] = [];
  roleLabel = '';
  userName = '';
  private pollHandle?: ReturnType<typeof setInterval>;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly authService: AuthService,
    readonly notifications: NotificationService,
  ) {}

  ngOnInit(): void {
    const data = this.route.snapshot.data as { navItems?: ShellNavItem[]; roleLabel?: string };
    this.navItems = (data.navItems ?? []).filter(
      (item) => !item.roles || this.authService.hasAnyRole(...item.roles),
    );
    this.roleLabel = data.roleLabel ?? '';

    const user = this.authService.currentUser();
    this.userName = user ? `${user.firstName} ${user.lastName}` : '';

    this.notifications.refreshUnreadCount();
    this.pollHandle = setInterval(() => this.notifications.refreshUnreadCount(), UNREAD_POLL_INTERVAL_MS);
  }

  ngOnDestroy(): void {
    if (this.pollHandle) {
      clearInterval(this.pollHandle);
    }
  }

  logout(): void {
    this.authService.logout();
  }
}
