import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AnalyticsService } from '../../../core/services/analytics.service';
import { CandidateDashboardStats } from '../../../core/models/analytics.model';
import { APPLICATION_STATUS_LABELS, ApplicationStatus } from '../../../core/models/application.model';

@Component({
  selector: 'app-candidate-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard-container">
      <header class="page-header">
        <h1>Welcome back</h1>
        <p>Here's what's happening with your job search.</p>
      </header>

      @if (isLoading()) {
        <div class="spinner"></div>
      } @else if (stats()) {
        <div class="stats-grid">
          <div class="stat-card">
            <span class="stat-value">{{ stats()!.totalApplications }}</span>
            <span class="stat-label">Applications</span>
          </div>
          <div class="stat-card">
            <span class="stat-value">{{ stats()!.upcomingInterviews }}</span>
            <span class="stat-label">Upcoming Interviews</span>
          </div>
          <div class="stat-card">
            <span class="stat-value">{{ stats()!.activeOffers }}</span>
            <span class="stat-label">Active Offers</span>
          </div>
        </div>

        @if (statusBreakdown().length > 0) {
          <section class="breakdown">
            <h2>Applications by Status</h2>
            <div class="breakdown-list">
              @for (row of statusBreakdown(); track row.status) {
                <div class="breakdown-row">
                  <span class="breakdown-label">{{ statusLabels[row.status] }}</span>
                  <div class="breakdown-bar-track">
                    <div class="breakdown-bar-fill" [style.width.%]="row.percent"></div>
                  </div>
                  <span class="breakdown-count">{{ row.count }}</span>
                </div>
              }
            </div>
          </section>
        }

        <section class="quick-links">
          <a class="quick-link" routerLink="/jobs">
            <span class="icon">🔍</span>
            <span>Browse Jobs</span>
          </a>
          <a class="quick-link" routerLink="applications">
            <span class="icon">📄</span>
            <span>My Applications</span>
          </a>
          <a class="quick-link" routerLink="interviews">
            <span class="icon">📅</span>
            <span>Interviews</span>
          </a>
          <a class="quick-link" routerLink="offers">
            <span class="icon">🎉</span>
            <span>Offers</span>
          </a>
        </section>
      }
    </div>
  `,
  styles: [`
    .dashboard-container {
      max-width: 1000px;
      margin: 0 auto;
      padding: var(--rp-space-8) var(--rp-space-6);
    }
    .page-header {
      margin-bottom: var(--rp-space-8);
      h1 { font-size: 2rem; font-weight: 800; }
      p { color: var(--rp-text-secondary); margin-top: var(--rp-space-2); }
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: var(--rp-space-5);
      margin-bottom: var(--rp-space-10);
    }
    .stat-card {
      background: var(--rp-bg-primary);
      border: 1px solid var(--rp-border-light);
      border-radius: var(--rp-radius-lg);
      padding: var(--rp-space-6);
      display: flex;
      flex-direction: column;
      gap: var(--rp-space-2);
    }
    .stat-value { font-size: 2.25rem; font-weight: 800; color: var(--rp-text-primary); }
    .stat-label { color: var(--rp-text-secondary); font-weight: 600; font-size: 0.9rem; }
    .breakdown {
      margin-bottom: var(--rp-space-10);
      h2 { font-size: 1.25rem; font-weight: 700; margin-bottom: var(--rp-space-4); }
    }
    .breakdown-list {
      display: flex;
      flex-direction: column;
      gap: var(--rp-space-3);
    }
    .breakdown-row {
      display: grid;
      grid-template-columns: 140px 1fr 40px;
      align-items: center;
      gap: var(--rp-space-3);
    }
    .breakdown-label { font-size: 0.9rem; font-weight: 600; color: var(--rp-text-secondary); }
    .breakdown-bar-track {
      height: 8px;
      background: var(--rp-bg-secondary);
      border-radius: var(--rp-radius-full, 999px);
      overflow: hidden;
    }
    .breakdown-bar-fill {
      height: 100%;
      background: var(--rp-primary);
      border-radius: var(--rp-radius-full, 999px);
    }
    .breakdown-count { text-align: right; font-weight: 700; font-size: 0.9rem; }
    .quick-links {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
      gap: var(--rp-space-4);
    }
    .quick-link {
      background: var(--rp-bg-primary);
      border: 1px solid var(--rp-border-light);
      border-radius: var(--rp-radius-lg);
      padding: var(--rp-space-6);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--rp-space-2);
      text-decoration: none;
      color: var(--rp-text-primary);
      font-weight: 600;
      transition: box-shadow var(--rp-transition-fast, 0.15s);
    }
    .quick-link:hover { box-shadow: var(--rp-shadow-sm); }
    .icon { font-size: 1.75rem; }
  `],
})
export class CandidateDashboardComponent implements OnInit {
  isLoading = signal(true);
  stats = signal<CandidateDashboardStats | null>(null);
  statusLabels = APPLICATION_STATUS_LABELS;

  constructor(private readonly analyticsService: AnalyticsService) {}

  ngOnInit(): void {
    this.analyticsService.getCandidateDashboard().subscribe({
      next: (stats) => {
        this.stats.set(stats);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  statusBreakdown(): { status: ApplicationStatus; count: number; percent: number }[] {
    const s = this.stats();
    if (!s) {
      return [];
    }

    const total = Object.values(s.applicationsByStatus).reduce((sum, n) => sum + n, 0) || 1;

    return Object.entries(s.applicationsByStatus).map(([status, count]) => ({
      status: status as ApplicationStatus,
      count,
      percent: Math.round((count / total) * 100),
    }));
  }
}
