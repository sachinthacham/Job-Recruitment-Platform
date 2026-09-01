import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import {
  AccountStatus,
  ACCOUNT_STATUS_LABELS,
  AdminUser,
} from '../../../core/models/admin.model';

const STATUS_OPTIONS: AccountStatus[] = [
  'ACTIVE',
  'INACTIVE',
  'SUSPENDED',
  'PENDING_VERIFICATION',
];

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-container">
      <header class="page-header">
        <div>
          <h1>Users</h1>
          <p>{{ total() }} platform {{ total() === 1 ? 'user' : 'users' }}</p>
        </div>
        <div class="search-box">
          <input
            type="text"
            placeholder="Search by name or email…"
            [(ngModel)]="search"
            (keydown.enter)="applySearch()"
            name="search"
          />
          <button class="btn btn-outline" (click)="applySearch()">Search</button>
        </div>
      </header>

      @if (isLoading()) {
        <div class="spinner"></div>
      } @else if (users().length === 0) {
        <div class="empty-state">
          <p>No users found.</p>
        </div>
      } @else {
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Roles</th>
                <th>Status</th>
                <th>Last Login</th>
                <th>Joined</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              @for (user of users(); track user.id) {
                <tr>
                  <td>{{ user.firstName }} {{ user.lastName }}</td>
                  <td>{{ user.email }}</td>
                  <td>{{ user.roles.join(', ') }}</td>
                  <td>
                    <span class="status-badge" [class]="user.status.toLowerCase()">
                      {{ statusLabels[user.status] }}
                    </span>
                  </td>
                  <td>{{ user.lastLoginAt ? (user.lastLoginAt | date: 'short') : '—' }}</td>
                  <td>{{ user.createdAt | date: 'mediumDate' }}</td>
                  <td>
                    <select
                      [value]="user.status"
                      [disabled]="updatingId() === user.id"
                      (change)="onStatusChange(user, $event)"
                    >
                      @for (status of statusOptions; track status) {
                        <option [value]="status">{{ statusLabels[status] }}</option>
                      }
                    </select>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <footer class="pagination">
          <button class="btn btn-outline" [disabled]="page() <= 1" (click)="goToPage(page() - 1)">
            Prev
          </button>
          <span>Page {{ page() }} of {{ totalPages() || 1 }}</span>
          <button
            class="btn btn-outline"
            [disabled]="page() >= totalPages()"
            (click)="goToPage(page() + 1)"
          >
            Next
          </button>
        </footer>
      }
    </div>
  `,
  styles: [`
    .admin-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: var(--rp-space-8) var(--rp-space-6);
    }
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: var(--rp-space-6);
      h1 { font-size: 2rem; font-weight: 800; }
      p { color: var(--rp-text-secondary); margin-top: var(--rp-space-2); }
    }
    .search-box {
      display: flex;
      gap: var(--rp-space-2);
      input {
        padding: 8px 12px;
        border: 1.5px solid var(--rp-border-light);
        border-radius: var(--rp-radius-md);
        min-width: 260px;
      }
    }
    .btn-outline {
      border: 1px solid var(--rp-border-light);
      background: transparent;
      cursor: pointer;
      border-radius: var(--rp-radius-md);
      padding: var(--rp-space-2) var(--rp-space-4);
      font-weight: 600;
    }
    .btn-outline:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .table-wrap {
      background: var(--rp-bg-primary);
      border: 1px solid var(--rp-border-light);
      border-radius: var(--rp-radius-lg);
      overflow-x: auto;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.9rem;
    }
    th, td {
      text-align: left;
      padding: var(--rp-space-3) var(--rp-space-4);
      border-bottom: 1px solid var(--rp-border-light);
      white-space: nowrap;
    }
    th {
      color: var(--rp-text-secondary);
      font-weight: 700;
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }
    tr:last-child td {
      border-bottom: none;
    }
    select {
      padding: 6px 10px;
      border: 1.5px solid var(--rp-border-light);
      border-radius: var(--rp-radius-md);
      background: var(--rp-bg-secondary);
      font-weight: 600;
    }
    .status-badge {
      padding: 4px 8px;
      border-radius: var(--rp-radius-sm);
      font-size: 0.75rem;
      font-weight: 600;
      &.active { background: #dcfce7; color: #166534; }
      &.inactive { background: #f3f4f6; color: #374151; }
      &.suspended { background: #fee2e2; color: #991b1b; }
      &.pending_verification { background: #fef9c3; color: #854d0e; }
    }
    .pagination {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--rp-space-4);
      margin-top: var(--rp-space-6);
      font-weight: 600;
      color: var(--rp-text-secondary);
    }
    .empty-state {
      text-align: center;
      padding: var(--rp-space-12) var(--rp-space-4);
      background: var(--rp-bg-secondary);
      border-radius: var(--rp-radius-xl);
      color: var(--rp-text-secondary);
    }
  `],
})
export class AdminUsersComponent implements OnInit {
  isLoading = signal(true);
  users = signal<AdminUser[]>([]);
  page = signal(1);
  totalPages = signal(1);
  total = signal(0);
  updatingId = signal<string | null>(null);
  search = '';
  statusLabels = ACCOUNT_STATUS_LABELS;
  statusOptions = STATUS_OPTIONS;

  constructor(private readonly adminService: AdminService) {}

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.isLoading.set(true);
    this.adminService
      .listUsers({ page: this.page(), search: this.search || undefined })
      .subscribe({
        next: (result) => {
          this.users.set(result.data);
          this.page.set(result.meta.page);
          this.totalPages.set(result.meta.totalPages);
          this.total.set(result.meta.total);
          this.isLoading.set(false);
        },
        error: () => this.isLoading.set(false),
      });
  }

  applySearch(): void {
    this.page.set(1);
    this.load();
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages()) {
      return;
    }
    this.page.set(page);
    this.load();
  }

  onStatusChange(user: AdminUser, event: Event): void {
    const status = (event.target as HTMLSelectElement).value as AccountStatus;
    if (status === user.status) {
      return;
    }

    this.updatingId.set(user.id);
    this.adminService.updateUserStatus(user.id, status).subscribe({
      next: (updated) => {
        this.users.update((items) =>
          items.map((item) => (item.id === user.id ? { ...item, status: updated.status } : item)),
        );
        this.updatingId.set(null);
      },
      error: () => this.updatingId.set(null),
    });
  }
}
