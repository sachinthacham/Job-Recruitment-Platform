import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AnalyticsService } from '../../../core/services/analytics.service';
import { RecruiterDashboardStats } from '../../../core/models/analytics.model';

@Component({
  selector: 'app-recruiter-analytics',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="page-container">
      <header class="page-header">
        <h1>Analytics</h1>
      </header>

      @if (isLoading()) {
        <div class="spinner"></div>
      } @else if (!stats()) {
        <div class="empty-state">
          <h3>No data available</h3>
        </div>
      } @else {
        <div class="stat-grid">
          <div class="stat-card">
            <span class="stat-value">{{ stats()!.totalJobs }}</span>
            <span class="stat-label">Total Jobs</span>
          </div>
          <div class="stat-card">
            <span class="stat-value">{{ stats()!.activeJobs }}</span>
            <span class="stat-label">Active Jobs</span>
          </div>
          <div class="stat-card">
            <span class="stat-value">{{ stats()!.upcomingInterviews }}</span>
            <span class="stat-label">Upcoming Interviews</span>
          </div>
          <div class="stat-card">
            <span class="stat-value">{{ stats()!.hires }}</span>
            <span class="stat-label">Hires</span>
          </div>
          <div class="stat-card">
            <span class="stat-value">{{ stats()!.averageTimeToHireDays ?? 'N/A' }}</span>
            <span class="stat-label">Avg. Time to Hire (days)</span>
          </div>
        </div>

        <div class="breakdown-grid">
          <section class="card">
            <h2>Applications by Status</h2>
            @for (entry of statusEntries(stats()!.applicationsByStatus); track entry.key) {
              <div class="breakdown-row">
                <span class="breakdown-label">{{ entry.key }}</span>
                <div class="bar-track">
                  <div class="bar-fill" [style.width.%]="entry.percent"></div>
                </div>
                <span class="breakdown-count">{{ entry.value }}</span>
              </div>
            }
            @if (statusEntries(stats()!.applicationsByStatus).length === 0) {
              <p class="empty-note">No applications yet.</p>
            }
          </section>

          <section class="card">
            <h2>Offers by Status</h2>
            @for (entry of statusEntries(stats()!.offersByStatus); track entry.key) {
              <div class="breakdown-row">
                <span class="breakdown-label">{{ entry.key }}</span>
                <div class="bar-track">
                  <div class="bar-fill" [style.width.%]="entry.percent"></div>
                </div>
                <span class="breakdown-count">{{ entry.value }}</span>
              </div>
            }
            @if (statusEntries(stats()!.offersByStatus).length === 0) {
              <p class="empty-note">No offers yet.</p>
            }
          </section>
        </div>

        <section class="card">
          <h2>Top Jobs by Applications</h2>
          @if (stats()!.topJobsByApplications.length === 0) {
            <p class="empty-note">No jobs posted yet.</p>
          } @else {
            <div class="top-jobs-list">
              @for (job of stats()!.topJobsByApplications; track job.id) {
                <a class="top-job-row" [routerLink]="['/recruiter/jobs', job.id, 'edit']">
                  <span>{{ job.title }}</span>
                  <span class="job-count">{{ job.applicationCount }} applications</span>
                </a>
              }
            </div>
          }
        </section>
      }
    </div>
  `,
  styles: [`
    .page-container { max-width: 1000px; margin: 0 auto; padding: var(--rp-space-8) var(--rp-space-6); }
    .page-header { margin-bottom: var(--rp-space-6); }
    .page-header h1 { font-size: 2rem; font-weight: 800; }
    .stat-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: var(--rp-space-4); margin-bottom: var(--rp-space-6); }
    .stat-card { background: var(--rp-bg-primary); border: 1px solid var(--rp-border-light); border-radius: var(--rp-radius-lg); padding: var(--rp-space-5); display: flex; flex-direction: column; gap: var(--rp-space-1); }
    .stat-value { font-size: 1.8rem; font-weight: 800; }
    .stat-label { color: var(--rp-text-secondary); font-size: 0.85rem; }
    .breakdown-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--rp-space-5); margin-bottom: var(--rp-space-6); }
    .card { background: var(--rp-bg-primary); border: 1px solid var(--rp-border-light); border-radius: var(--rp-radius-lg); padding: var(--rp-space-6); }
    .card h2 { font-size: 1.1rem; font-weight: 700; margin-bottom: var(--rp-space-4); }
    .breakdown-row { display: grid; grid-template-columns: 120px 1fr 40px; align-items: center; gap: var(--rp-space-3); margin-bottom: var(--rp-space-2); }
    .breakdown-label { font-size: 0.85rem; color: var(--rp-text-secondary); text-transform: capitalize; }
    .bar-track { background: var(--rp-bg-secondary); border-radius: var(--rp-radius-full, 999px); height: 8px; overflow: hidden; }
    .bar-fill { background: var(--rp-primary-600, #4f46e5); height: 100%; }
    .breakdown-count { text-align: right; font-weight: 700; font-size: 0.85rem; }
    .top-jobs-list { display: flex; flex-direction: column; gap: var(--rp-space-2); }
    .top-job-row { display: flex; justify-content: space-between; padding: var(--rp-space-3); border-radius: var(--rp-radius-md); text-decoration: none; color: var(--rp-text-primary); background: var(--rp-bg-secondary); font-weight: 600; }
    .job-count { color: var(--rp-text-secondary); font-weight: 500; }
    .empty-note { color: var(--rp-text-secondary); }
    .empty-state { text-align: center; padding: var(--rp-space-12) var(--rp-space-4); background: var(--rp-bg-secondary); border-radius: var(--rp-radius-xl); }
  `],
})
export class RecruiterAnalyticsComponent implements OnInit {
  isLoading = signal(true);
  stats = signal<RecruiterDashboardStats | null>(null);

  constructor(private readonly analyticsService: AnalyticsService) {}

  ngOnInit(): void {
    this.analyticsService.getRecruiterDashboard().subscribe({
      next: (stats) => {
        this.stats.set(stats);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  statusEntries(record: Record<string, number>): { key: string; value: number; percent: number }[] {
    const entries = Object.entries(record);
    const max = Math.max(1, ...entries.map(([, value]) => value));
    return entries.map(([key, value]) => ({
      key: key.replace(/_/g, ' ').toLowerCase(),
      value,
      percent: (value / max) * 100,
    }));
  }
}
