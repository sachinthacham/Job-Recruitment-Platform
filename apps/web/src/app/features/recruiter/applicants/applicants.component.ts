import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ApplicationService } from '../../../core/services/application.service';
import {
  Application,
  ApplicationStatus,
  APPLICATION_STATUS_LABELS,
} from '../../../core/models/application.model';

const STATUS_OPTIONS: ApplicationStatus[] = [
  'APPLIED',
  'UNDER_REVIEW',
  'SHORTLISTED',
  'INTERVIEW',
  'OFFERED',
  'HIRED',
  'REJECTED',
];

@Component({
  selector: 'app-applicants',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="applicants-container">
      <header class="page-header">
        <button class="btn-back" routerLink="/recruiter/jobs">← Back to jobs</button>
        <h1>Applicants</h1>
        <p>{{ applications().length }} {{ applications().length === 1 ? 'candidate has' : 'candidates have' }} applied.</p>
      </header>

      @if (isLoading()) {
        <div class="spinner"></div>
      } @else if (applications().length === 0) {
        <div class="empty-state">
          <h3>No applicants yet</h3>
          <p>Applications for this job will appear here as candidates apply.</p>
        </div>
      } @else {
        <div class="applicants-list">
          @for (application of applications(); track application.id) {
            <div class="applicant-card">
              <div class="applicant-info">
                <h3>{{ application.candidate.firstName }} {{ application.candidate.lastName }}</h3>
                <p class="headline">{{ application.candidate.candidateProfile?.headline || application.candidate.email }}</p>
                <p class="applied-date">Applied {{ application.appliedAt | date: 'mediumDate' }}</p>
                @if (application.coverLetter) {
                  <p class="cover-letter">{{ application.coverLetter }}</p>
                }
              </div>

              <div class="status-control">
                <select
                  [disabled]="isTerminal(application.status) || updatingId() === application.id"
                  [value]="application.status"
                  (change)="onStatusChange(application, $event)"
                >
                  @for (status of statusOptions; track status) {
                    <option [value]="status">{{ statusLabels[status] }}</option>
                  }
                  @if (isTerminal(application.status)) {
                    <option [value]="application.status" [selected]="true">{{ statusLabels[application.status] }}</option>
                  }
                </select>
                <div class="applicant-links">
                  <a class="link-btn" [routerLink]="['/recruiter/interviews/schedule', application.id]">Schedule Interview</a>
                  <a class="link-btn" [routerLink]="['/recruiter/offers/new', application.id]">Create Offer</a>
                </div>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .applicants-container {
      max-width: 900px;
      margin: 0 auto;
      padding: var(--rp-space-8) var(--rp-space-6);
    }
    .btn-back {
      background: none;
      border: none;
      color: var(--rp-text-secondary);
      font-weight: 600;
      cursor: pointer;
      margin-bottom: var(--rp-space-4);
    }
    .page-header {
      margin-bottom: var(--rp-space-8);
      h1 { font-size: 2rem; font-weight: 800; }
      p { color: var(--rp-text-secondary); margin-top: var(--rp-space-2); }
    }
    .applicants-list {
      display: flex;
      flex-direction: column;
      gap: var(--rp-space-4);
    }
    .applicant-card {
      background: var(--rp-bg-primary);
      border: 1px solid var(--rp-border-light);
      border-radius: var(--rp-radius-lg);
      padding: var(--rp-space-6);
      display: flex;
      justify-content: space-between;
      gap: var(--rp-space-5);
    }
    .applicant-info {
      flex: 1;
      h3 { font-size: 1.1rem; font-weight: 700; margin-bottom: var(--rp-space-1); }
      .headline { color: var(--rp-text-secondary); margin-bottom: var(--rp-space-1); }
      .applied-date { font-size: 0.85rem; color: var(--rp-text-tertiary); margin-bottom: var(--rp-space-3); }
      .cover-letter {
        font-size: 0.9rem;
        color: var(--rp-text-secondary);
        background: var(--rp-bg-secondary);
        padding: var(--rp-space-3);
        border-radius: var(--rp-radius-md);
        white-space: pre-line;
      }
    }
    .status-control {
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
      gap: var(--rp-space-2);
      select {
        padding: 10px 14px;
        border: 1.5px solid var(--rp-border-light);
        border-radius: var(--rp-radius-md);
        background: var(--rp-bg-secondary);
        font-weight: 600;
      }
    }
    .applicant-links {
      display: flex;
      flex-direction: column;
      gap: var(--rp-space-1);
    }
    .link-btn {
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--rp-primary-600, #4f46e5);
      text-decoration: none;
      text-align: center;
      padding: 6px 10px;
      border: 1px solid var(--rp-border-light);
      border-radius: var(--rp-radius-md);
    }
    .link-btn:hover {
      background: var(--rp-bg-secondary);
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
export class ApplicantsComponent implements OnInit {
  isLoading = signal(true);
  applications = signal<Application[]>([]);
  updatingId = signal<string | null>(null);
  statusLabels = APPLICATION_STATUS_LABELS;
  statusOptions = STATUS_OPTIONS;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly applicationService: ApplicationService,
  ) {}

  ngOnInit(): void {
    const jobId = this.route.snapshot.paramMap.get('jobId');
    if (!jobId) {
      this.isLoading.set(false);
      return;
    }

    this.applicationService.getJobApplications(jobId).subscribe({
      next: (result) => {
        this.applications.set(result.data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  isTerminal(status: ApplicationStatus): boolean {
    return status === 'HIRED' || status === 'REJECTED' || status === 'WITHDRAWN';
  }

  onStatusChange(application: Application, event: Event): void {
    const newStatus = (event.target as HTMLSelectElement).value as ApplicationStatus;
    if (newStatus === application.status) {
      return;
    }

    this.updatingId.set(application.id);
    this.applicationService.updateStatus(application.id, { status: newStatus }).subscribe({
      next: (updated) => {
        this.applications.update((apps) =>
          apps.map((a) => (a.id === application.id ? { ...a, status: updated.status } : a)),
        );
        this.updatingId.set(null);
      },
      error: () => this.updatingId.set(null),
    });
  }
}
