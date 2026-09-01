import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { AdminCompany } from '../../../core/models/admin.model';

@Component({
  selector: 'app-admin-companies',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-container">
      <header class="page-header">
        <div>
          <h1>Companies</h1>
          <p>{{ total() }} {{ total() === 1 ? 'company' : 'companies' }} across all tenants</p>
        </div>
        <div class="search-box">
          <input
            type="text"
            placeholder="Search by company name…"
            [(ngModel)]="search"
            (keydown.enter)="applySearch()"
            name="search"
          />
          <button class="btn btn-outline" (click)="applySearch()">Search</button>
        </div>
      </header>

      @if (isLoading()) {
        <div class="spinner"></div>
      } @else if (companies().length === 0) {
        <div class="empty-state">
          <p>No companies found.</p>
        </div>
      } @else {
        <div class="companies-grid">
          @for (company of companies(); track company.id) {
            <div class="company-card">
              <div class="card-header">
                @if (company.logoUrl) {
                  <img [src]="company.logoUrl" [alt]="company.name" class="logo" />
                } @else {
                  <div class="logo placeholder">{{ company.name.charAt(0) }}</div>
                }
                <div>
                  <h3>
                    {{ company.name }}
                    @if (company.isVerified) {
                      <span class="verified" title="Verified">✔</span>
                    }
                  </h3>
                  <p class="tenant">{{ company.tenant.name }}</p>
                </div>
              </div>
              <p class="industry">{{ company.industry || 'Industry not specified' }}</p>
              <div class="stats">
                <span>💼 {{ company._count.jobs }} jobs</span>
                <span>👥 {{ company._count.recruiterProfiles }} recruiters</span>
              </div>
              <p class="created">Joined {{ company.createdAt | date: 'mediumDate' }}</p>
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
    .companies-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: var(--rp-space-5);
    }
    .company-card {
      background: var(--rp-bg-primary);
      border: 1px solid var(--rp-border-light);
      border-radius: var(--rp-radius-lg);
      padding: var(--rp-space-5);
    }
    .card-header {
      display: flex;
      gap: var(--rp-space-3);
      align-items: center;
      margin-bottom: var(--rp-space-3);
      h3 { font-size: 1rem; font-weight: 700; margin: 0; }
    }
    .logo {
      width: 40px;
      height: 40px;
      border-radius: var(--rp-radius-md);
      object-fit: cover;
      flex-shrink: 0;
    }
    .logo.placeholder {
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--rp-bg-secondary);
      font-weight: 800;
      color: var(--rp-text-secondary);
    }
    .verified {
      color: #16a34a;
      font-size: 0.85rem;
    }
    .tenant {
      font-size: 0.8rem;
      color: var(--rp-text-tertiary);
    }
    .industry {
      color: var(--rp-text-secondary);
      font-size: 0.9rem;
      margin-bottom: var(--rp-space-3);
    }
    .stats {
      display: flex;
      gap: var(--rp-space-4);
      font-size: 0.85rem;
      color: var(--rp-text-secondary);
      margin-bottom: var(--rp-space-2);
    }
    .created {
      font-size: 0.75rem;
      color: var(--rp-text-tertiary);
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
export class AdminCompaniesComponent implements OnInit {
  isLoading = signal(true);
  companies = signal<AdminCompany[]>([]);
  page = signal(1);
  totalPages = signal(1);
  total = signal(0);
  search = '';

  constructor(private readonly adminService: AdminService) {}

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.isLoading.set(true);
    this.adminService
      .listCompanies({ page: this.page(), search: this.search || undefined })
      .subscribe({
        next: (result) => {
          this.companies.set(result.data);
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
}
