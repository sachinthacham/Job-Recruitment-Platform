import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApplicationService } from '../../../core/services/application.service';
import { Application, APPLICATION_STATUS_LABELS } from '../../../core/models/application.model';

@Component({
  selector: 'app-candidate-applications',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="applications-container">
      <header class="page-header">
        <h1>My Applications</h1>
        <p>Track the status of every job you've applied to.</p>
      </header>

      @if (isLoading()) {
        <div class="spinner"></div>
      } @else if (applications().length === 0) {
        <div class="empty-state">
          <h3>No applications yet</h3>
          <p>When you apply to a job, it will show up here.</p>
          <button class="btn btn-primary" routerLink="/jobs">Browse Jobs</button>
        </div>
      } @else {
        <div class="applications-list">
          @for (application of applications(); track application.id) {
            <div class="application-card">
              <div class="company-logo">
                @if (application.job.company.logoUrl) {
                  <img [src]="application.job.company.logoUrl" [alt]="application.job.company.name" />
                } @else {
                  <div class="logo-placeholder">{{ application.job.company.name.charAt(0) }}</div>
                }
              </div>

              <div class="application-info">
                <h3 [routerLink]="['/jobs', application.job.slug]">{{ application.job.title }}</h3>
                <p class="company-name">{{ application.job.company.name }}</p>
                <p class="applied-date">Applied {{ application.appliedAt | date: 'mediumDate' }}</p>
              </div>

              <div class="status-section">
                <span class="status-badge" [class]="application.status.toLowerCase()">
                  {{ statusLabels[application.status] }}
                </span>

                @if (canWithdraw(application)) {
                  <button class="btn-withdraw" (click)="withdraw(application)" [disabled]="withdrawingId() === application.id">
                    Withdraw
                  </button>
                }
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .applications-container {
      max-width: 900px;
      margin: 0 auto;
      padding: var(--rp-space-8) var(--rp-space-6);
    }
    .page-header {
      margin-bottom: var(--rp-space-8);
      h1 { font-size: 2rem; font-weight: 800; }
      p { color: var(--rp-text-secondary); margin-top: var(--rp-space-2); }
    }
    .applications-list {
      display: flex;
      flex-direction: column;
      gap: var(--rp-space-4);
    }
    .application-card {
      background: var(--rp-bg-primary);
      border: 1px solid var(--rp-border-light);
      border-radius: var(--rp-radius-lg);
      padding: var(--rp-space-6);
      display: flex;
      gap: var(--rp-space-5);
      align-items: center;
    }
    .company-logo {
      flex-shrink: 0;
      img, .logo-placeholder {
        width: 56px;
        height: 56px;
        border-radius: var(--rp-radius-md);
      }
      .logo-placeholder {
        background: var(--rp-gray-100);
        color: var(--rp-text-secondary);
        font-size: 1.3rem;
        font-weight: 700;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
    .application-info {
      flex: 1;
      h3 {
        font-size: 1.1rem;
        font-weight: 700;
        cursor: pointer;
        margin-bottom: var(--rp-space-1);
        &:hover { text-decoration: underline; }
      }
      .company-name { color: var(--rp-text-secondary); font-weight: 500; margin-bottom: var(--rp-space-1); }
      .applied-date { font-size: 0.85rem; color: var(--rp-text-tertiary); }
    }
    .status-section {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: var(--rp-space-2);
    }
    .status-badge {
      padding: 6px 12px;
      border-radius: 100px;
      font-size: 0.8rem;
      font-weight: 600;
      white-space: nowrap;
      &.applied { background: #e0e7ff; color: #3730a3; }
      &.under_review { background: #fef3c7; color: #92400e; }
      &.shortlisted { background: #dbeafe; color: #1e40af; }
      &.interview { background: #ede9fe; color: #5b21b6; }
      &.offered { background: #d1fae5; color: #065f46; }
      &.hired { background: #dcfce7; color: #166534; }
      &.rejected { background: #fee2e2; color: #991b1b; }
      &.withdrawn { background: #f3f4f6; color: #374151; }
    }
    .btn-withdraw {
      border: none;
      background: none;
      color: var(--rp-text-tertiary);
      font-size: 0.8rem;
      text-decoration: underline;
      cursor: pointer;
      &:disabled { opacity: 0.5; cursor: not-allowed; }
    }
    .empty-state {
      text-align: center;
      padding: var(--rp-space-12) var(--rp-space-4);
      background: var(--rp-bg-secondary);
      border-radius: var(--rp-radius-xl);
      h3 { font-size: 1.5rem; font-weight: 700; margin-bottom: var(--rp-space-2); }
      p { color: var(--rp-text-secondary); margin-bottom: var(--rp-space-6); }
    }
    .btn {
      padding: 12px 24px;
      border-radius: var(--rp-radius-md);
      font-weight: 600;
      cursor: pointer;
      border: none;
      &.btn-primary { background: var(--rp-primary); color: white; }
    }
  `],
})
export class CandidateApplicationsComponent implements OnInit {
  isLoading = signal(true);
  applications = signal<Application[]>([]);
  withdrawingId = signal<string | null>(null);
  statusLabels = APPLICATION_STATUS_LABELS;

  constructor(private readonly applicationService: ApplicationService) {}

  ngOnInit(): void {
    this.applicationService.getMyApplications().subscribe({
      next: (result) => {
        this.applications.set(result.data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  canWithdraw(application: Application): boolean {
    return !['HIRED', 'REJECTED', 'WITHDRAWN'].includes(application.status);
  }

  withdraw(application: Application): void {
    if (!confirm('Withdraw this application? This cannot be undone.')) {
      return;
    }

    this.withdrawingId.set(application.id);
    this.applicationService.withdraw(application.id).subscribe({
      next: () => {
        this.applications.update((apps) =>
          apps.map((a) => (a.id === application.id ? { ...a, status: 'WITHDRAWN' } : a)),
        );
        this.withdrawingId.set(null);
      },
      error: () => this.withdrawingId.set(null),
    });
  }
}
