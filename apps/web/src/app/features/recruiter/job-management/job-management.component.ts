import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { JobService } from '../../../core/services/job.service';
import { RecruiterService } from '../../../core/services/recruiter.service';

@Component({
  selector: 'app-job-management',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="job-management-container">
      <header class="dashboard-header">
        <div>
          <h1>Job Postings</h1>
          <p>Manage your company's open and closed job positions.</p>
        </div>
        <button class="btn btn-primary" routerLink="new">Post New Job</button>
      </header>

      @if (isLoading()) {
        <div class="spinner"></div>
      } @else if (!companyId()) {
        <div class="alert">You must be associated with a company to manage jobs.</div>
      } @else {
        <div class="jobs-grid">
          @for (job of jobs(); track job.id) {
            <div class="job-card">
              <div class="job-card-header">
                <h3>{{ job.title }}</h3>
                <span class="status-badge" [class]="job.status.toLowerCase()">{{ job.status }}</span>
              </div>
              <div class="job-card-body">
                <p class="location">📍 {{ job.location || 'Remote' }}</p>
                <p class="type">💼 {{ job.employmentType }}</p>
                <p class="stats">
                  👥 {{ job._count?.applications || 0 }} Applications
                </p>
              </div>
              <div class="job-card-actions">
                <button class="btn btn-outline" [routerLink]="[job.id, 'applicants']">Applicants</button>
                <button class="btn btn-outline" [routerLink]="[job.id, 'edit']">Edit</button>
                <button class="btn btn-danger-outline" (click)="deleteJob(job.id)">Delete</button>
              </div>
            </div>
          }
          @if (jobs().length === 0) {
            <div class="empty-state">
              <p>No jobs posted yet.</p>
              <button class="btn btn-secondary" routerLink="new">Create your first job</button>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .job-management-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: var(--rp-space-8);
    }
    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--rp-space-8);
      h1 { font-size: 2rem; font-weight: 800; }
      p { color: var(--rp-text-secondary); margin-top: var(--rp-space-2); }
    }
    .jobs-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: var(--rp-space-6);
    }
    .job-card {
      background: var(--rp-bg-primary);
      border: 1px solid var(--rp-border-light);
      border-radius: var(--rp-radius-xl);
      padding: var(--rp-space-5);
      display: flex;
      flex-direction: column;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
      transition: transform 0.2s;
      &:hover { transform: translateY(-2px); }
    }
    .job-card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: var(--rp-space-4);
      h3 { font-size: 1.1rem; font-weight: 700; margin: 0; }
    }
    .status-badge {
      padding: 4px 8px;
      border-radius: var(--rp-radius-sm);
      font-size: 0.75rem;
      font-weight: 600;
      &.published { background: #dcfce7; color: #166534; }
      &.draft { background: #f3f4f6; color: #374151; }
      &.closed { background: #fee2e2; color: #991b1b; }
    }
    .job-card-body {
      color: var(--rp-text-secondary);
      font-size: 0.9rem;
      flex: 1;
      p { margin-bottom: var(--rp-space-2); }
    }
    .job-card-actions {
      display: flex;
      gap: var(--rp-space-3);
      margin-top: var(--rp-space-5);
      padding-top: var(--rp-space-4);
      border-top: 1px solid var(--rp-border-light);
      .btn { flex: 1; text-align: center; padding: 8px; }
    }
    .btn-outline { border: 1px solid var(--rp-border-light); background: transparent; cursor: pointer; border-radius: var(--rp-radius-md); }
    .btn-danger-outline { border: 1px solid #fca5a5; color: #dc2626; background: transparent; cursor: pointer; border-radius: var(--rp-radius-md); }
    .alert { padding: 20px; background: var(--rp-gray-100); border-radius: 8px; }
    .empty-state { grid-column: 1 / -1; text-align: center; padding: 60px 20px; background: var(--rp-gray-50); border-radius: 12px; }
  `]
})
export class JobManagementComponent implements OnInit {
  isLoading = signal(true);
  jobs = signal<any[]>([]);
  companyId = signal<string | null>(null);

  constructor(
    private jobService: JobService,
    private recruiterService: RecruiterService
  ) {}

  ngOnInit(): void {
    this.recruiterService.getProfile().subscribe({
      next: (recruiter: any) => {
        if (recruiter.companyId) {
          this.companyId.set(recruiter.companyId);
          this.loadJobs(recruiter.companyId);
        } else {
          this.isLoading.set(false);
        }
      },
      error: () => this.isLoading.set(false)
    });
  }

  loadJobs(companyId: string): void {
    this.jobService.findCompanyJobs(companyId).subscribe({
      next: (data: any) => {
        this.jobs.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  deleteJob(id: string): void {
    if (confirm('Are you sure you want to delete this job?')) {
      this.jobService.remove(id).subscribe({
        next: () => {
          this.jobs.set(this.jobs().filter(j => j.id !== id));
        }
      });
    }
  }
}
