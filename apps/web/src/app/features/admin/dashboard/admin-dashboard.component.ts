import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../../core/services/admin.service';
import { PlatformDashboardStats } from '../../../core/models/analytics.model';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard-container">
      <header class="page-header">
        <h1>Platform Overview</h1>
        <p>A snapshot of activity across every tenant.</p>
      </header>

      @if (isLoading()) {
        <div class="spinner"></div>
      } @else if (stats()) {
        <div class="stats-grid">
          <div class="stat-card"><p class="value">{{ stats()!.totalUsers }}</p><p class="label">Total Users</p></div>
          <div class="stat-card"><p class="value">{{ stats()!.totalCandidates }}</p><p class="label">Candidates</p></div>
          <div class="stat-card"><p class="value">{{ stats()!.totalRecruiters }}</p><p class="label">Recruiters</p></div>
          <div class="stat-card"><p class="value">{{ stats()!.totalCompanies }}</p><p class="label">Companies</p></div>
          <div class="stat-card"><p class="value">{{ stats()!.totalJobs }}</p><p class="label">Total Jobs</p></div>
          <div class="stat-card"><p class="value">{{ stats()!.activeJobs }}</p><p class="label">Active Jobs</p></div>
          <div class="stat-card"><p class="value">{{ stats()!.totalApplications }}</p><p class="label">Applications</p></div>
          <div class="stat-card"><p class="value">{{ stats()!.totalHires }}</p><p class="label">Hires</p></div>
        </div>

        <section class="chart-section">
          <h2>Applications — last 30 days</h2>
          @if (stats()!.applicationsPerDay.length === 0) {
            <p class="no-data">No application activity in the last 30 days.</p>
          } @else {
            <div class="bar-chart">
              @for (point of stats()!.applicationsPerDay; track point.day) {
                <div
                  class="bar"
                  [style.height.%]="barHeight(point.count)"
                  [title]="(point.day | date: 'mediumDate') + ': ' + point.count + ' applications'"
                ></div>
              }
            </div>
          }
        </section>

        <section class="quick-links">
          <a routerLink="../users" class="quick-link">
            <span class="icon">👥</span>
            <span>Manage Users</span>
          </a>
          <a routerLink="../companies" class="quick-link">
            <span class="icon">🏢</span>
            <span>Companies</span>
          </a>
          <a routerLink="../audit-logs" class="quick-link">
            <span class="icon">📜</span>
            <span>Audit Logs</span>
          </a>
        </section>
      }
    </div>
  `,
  styles: [`
    .dashboard-container {
      max-width: 1200px;
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
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: var(--rp-space-4);
      margin-bottom: var(--rp-space-10);
    }
    .stat-card {
      background: var(--rp-bg-primary);
      border: 1px solid var(--rp-border-light);
      border-radius: var(--rp-radius-lg);
      padding: var(--rp-space-5);
      text-align: center;
      .value { font-size: 2rem; font-weight: 800; }
      .label { color: var(--rp-text-secondary); font-size: 0.85rem; margin-top: var(--rp-space-1); }
    }
    .chart-section {
      margin-bottom: var(--rp-space-10);
      h2 { font-size: 1.2rem; font-weight: 700; margin-bottom: var(--rp-space-4); }
    }
    .no-data {
      color: var(--rp-text-secondary);
    }
    .bar-chart {
      display: flex;
      align-items: flex-end;
      gap: 3px;
      height: 140px;
      background: var(--rp-bg-primary);
      border: 1px solid var(--rp-border-light);
      border-radius: var(--rp-radius-lg);
      padding: var(--rp-space-4);
    }
    .bar {
      flex: 1;
      min-height: 2px;
      background: var(--rp-primary-500, #3b82f6);
      border-radius: 2px 2px 0 0;
    }
    .quick-links {
      display: flex;
      gap: var(--rp-space-4);
    }
    .quick-link {
      flex: 1;
      display: flex;
      align-items: center;
      gap: var(--rp-space-3);
      background: var(--rp-bg-primary);
      border: 1px solid var(--rp-border-light);
      border-radius: var(--rp-radius-lg);
      padding: var(--rp-space-5);
      text-decoration: none;
      color: var(--rp-text-primary);
      font-weight: 700;
      transition: transform 0.15s;
    }
    .quick-link:hover {
      transform: translateY(-2px);
      background: var(--rp-bg-secondary);
    }
    .icon {
      font-size: 1.5rem;
    }
  `],
})
export class AdminDashboardComponent implements OnInit {
  isLoading = signal(true);
  stats = signal<PlatformDashboardStats | null>(null);

  constructor(private readonly adminService: AdminService) {}

  ngOnInit(): void {
    this.adminService.getStats().subscribe({
      next: (stats) => {
        this.stats.set(stats);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  barHeight(count: number): number {
    const max = Math.max(...this.stats()!.applicationsPerDay.map((p) => p.count), 1);
    return Math.max((count / max) * 100, 2);
  }
}
