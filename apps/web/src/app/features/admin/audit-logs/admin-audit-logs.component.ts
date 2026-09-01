import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { AuditLogEntry } from '../../../core/models/admin.model';

@Component({
  selector: 'app-admin-audit-logs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-container">
      <header class="page-header">
        <div>
          <h1>Audit Logs</h1>
          <p>{{ total() }} recorded {{ total() === 1 ? 'event' : 'events' }}</p>
        </div>
        <div class="filters">
          <input type="text" placeholder="Entity type…" [(ngModel)]="entityType" (keydown.enter)="applyFilters()" name="entityType" />
          <input type="text" placeholder="Action…" [(ngModel)]="action" (keydown.enter)="applyFilters()" name="action" />
          <button class="btn btn-outline" (click)="applyFilters()">Filter</button>
        </div>
      </header>

      @if (isLoading()) {
        <div class="spinner"></div>
      } @else if (entries().length === 0) {
        <div class="empty-state">
          <p>No audit log entries found.</p>
        </div>
      } @else {
        <div class="entries-list">
          @for (entry of entries(); track entry.id) {
            <div class="entry-row" (click)="toggleExpanded(entry.id)">
              <div class="entry-summary">
                <span class="action-badge">{{ entry.action }}</span>
                <span class="entity">
                  {{ entry.entityType }}
                  @if (entry.entityId) {
                    <span class="entity-id">#{{ entry.entityId.slice(0, 8) }}</span>
                  }
                </span>
                <span class="actor">{{ entry.user ? entry.user.firstName + ' ' + entry.user.lastName : 'System' }}</span>
                <span class="time">{{ entry.createdAt | date: 'short' }}</span>
              </div>

              @if (expandedId() === entry.id) {
                <div class="entry-details">
                  @if (entry.previousValue) {
                    <div>
                      <p class="details-label">Previous</p>
                      <pre>{{ entry.previousValue | json }}</pre>
                    </div>
                  }
                  @if (entry.newValue) {
                    <div>
                      <p class="details-label">New</p>
                      <pre>{{ entry.newValue | json }}</pre>
                    </div>
                  }
                </div>
              }
            </div>
          }
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
      max-width: 1100px;
      margin: 0 auto;
      padding: var(--rp-space-8) var(--rp-space-6);
    }
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: var(--rp-space-6);
      flex-wrap: wrap;
      gap: var(--rp-space-4);
      h1 { font-size: 2rem; font-weight: 800; }
      p { color: var(--rp-text-secondary); margin-top: var(--rp-space-2); }
    }
    .filters {
      display: flex;
      gap: var(--rp-space-2);
      input {
        padding: 8px 12px;
        border: 1.5px solid var(--rp-border-light);
        border-radius: var(--rp-radius-md);
        width: 160px;
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
    .entries-list {
      display: flex;
      flex-direction: column;
      gap: var(--rp-space-2);
    }
    .entry-row {
      background: var(--rp-bg-primary);
      border: 1px solid var(--rp-border-light);
      border-radius: var(--rp-radius-md);
      padding: var(--rp-space-3) var(--rp-space-4);
      cursor: pointer;
    }
    .entry-row:hover {
      background: var(--rp-bg-secondary);
    }
    .entry-summary {
      display: flex;
      align-items: center;
      gap: var(--rp-space-4);
      font-size: 0.85rem;
      flex-wrap: wrap;
    }
    .action-badge {
      background: var(--rp-bg-secondary);
      border-radius: var(--rp-radius-sm);
      padding: 2px 8px;
      font-weight: 700;
      font-size: 0.75rem;
    }
    .entity {
      color: var(--rp-text-secondary);
    }
    .entity-id {
      color: var(--rp-text-tertiary);
      font-family: var(--rp-font-mono, monospace);
    }
    .actor {
      font-weight: 600;
    }
    .time {
      margin-left: auto;
      color: var(--rp-text-tertiary);
    }
    .entry-details {
      display: flex;
      gap: var(--rp-space-6);
      margin-top: var(--rp-space-3);
      padding-top: var(--rp-space-3);
      border-top: 1px solid var(--rp-border-light);
    }
    .details-label {
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      color: var(--rp-text-tertiary);
      margin-bottom: var(--rp-space-1);
    }
    pre {
      background: var(--rp-bg-secondary);
      border-radius: var(--rp-radius-sm);
      padding: var(--rp-space-2) var(--rp-space-3);
      font-size: 0.75rem;
      max-width: 400px;
      overflow-x: auto;
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
export class AdminAuditLogsComponent implements OnInit {
  isLoading = signal(true);
  entries = signal<AuditLogEntry[]>([]);
  page = signal(1);
  totalPages = signal(1);
  total = signal(0);
  expandedId = signal<string | null>(null);
  entityType = '';
  action = '';

  constructor(private readonly adminService: AdminService) {}

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.isLoading.set(true);
    this.adminService
      .listAuditLogs({
        page: this.page(),
        entityType: this.entityType || undefined,
        action: this.action || undefined,
      })
      .subscribe({
        next: (result) => {
          this.entries.set(result.data);
          this.page.set(result.meta.page);
          this.totalPages.set(result.meta.totalPages);
          this.total.set(result.meta.total);
          this.isLoading.set(false);
        },
        error: () => this.isLoading.set(false),
      });
  }

  applyFilters(): void {
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

  toggleExpanded(id: string): void {
    this.expandedId.set(this.expandedId() === id ? null : id);
  }
}
