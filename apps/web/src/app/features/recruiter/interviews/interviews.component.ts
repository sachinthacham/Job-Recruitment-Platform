import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { InterviewService } from '../../../core/services/interview.service';
import {
  Interview,
  InterviewStatus,
  INTERVIEW_STATUS_LABELS,
  INTERVIEW_TYPE_LABELS,
} from '../../../core/models/interview.model';

const TERMINAL_STATUSES: InterviewStatus[] = ['COMPLETED', 'CANCELLED', 'NO_SHOW'];

@Component({
  selector: 'app-recruiter-interviews',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="page-container">
      <header class="page-header">
        <h1>Interviews</h1>
        @if (applicationId()) {
          <p>Interviews for this application.</p>
        }
      </header>

      @if (!applicationId()) {
        <div class="empty-state">
          <h3>No application selected</h3>
          <p>Open this page from an applicant's profile (Applicants list → Schedule Interview / View Interviews) to see interviews for that candidate.</p>
          <button class="btn btn-secondary" routerLink="/recruiter/jobs">Go to Jobs</button>
        </div>
      } @else if (isLoading()) {
        <div class="spinner"></div>
      } @else if (interviews().length === 0) {
        <div class="empty-state">
          <h3>No interviews yet</h3>
          <p>No interviews have been scheduled for this application.</p>
        </div>
      } @else {
        <div class="interview-list">
          @for (interview of interviews(); track interview.id) {
            <div class="interview-card">
              <div class="interview-info">
                <h3>{{ interview.title }}</h3>
                <p class="meta">{{ typeLabels[interview.type] }} · {{ interview.scheduledAt | date: 'medium' }} · {{ interview.duration }} min</p>
                @if (interview.location) {
                  <p class="meta">📍 {{ interview.location }}</p>
                }
                @if (interview.meetingUrl) {
                  <p class="meta">🔗 <a [href]="interview.meetingUrl" target="_blank" rel="noopener">{{ interview.meetingUrl }}</a></p>
                }
                <span class="status-badge" [class]="interview.status.toLowerCase()">{{ statusLabels[interview.status] }}</span>
              </div>
              <div class="interview-actions">
                <a class="btn btn-secondary" [routerLink]="['/recruiter/interviews', interview.id, 'feedback']">Feedback</a>
                @if (!isTerminal(interview.status)) {
                  <button class="btn btn-danger" [disabled]="cancellingId() === interview.id" (click)="cancel(interview)">
                    {{ cancellingId() === interview.id ? 'Cancelling...' : 'Cancel' }}
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
    .page-container { max-width: 900px; margin: 0 auto; padding: var(--rp-space-8) var(--rp-space-6); }
    .page-header { margin-bottom: var(--rp-space-8); }
    .page-header h1 { font-size: 2rem; font-weight: 800; }
    .page-header p { color: var(--rp-text-secondary); margin-top: var(--rp-space-2); }
    .interview-list { display: flex; flex-direction: column; gap: var(--rp-space-4); }
    .interview-card {
      background: var(--rp-bg-primary);
      border: 1px solid var(--rp-border-light);
      border-radius: var(--rp-radius-lg);
      padding: var(--rp-space-6);
      display: flex;
      justify-content: space-between;
      gap: var(--rp-space-5);
    }
    .interview-info { flex: 1; }
    .interview-info h3 { font-size: 1.1rem; font-weight: 700; margin-bottom: var(--rp-space-1); }
    .meta { font-size: 0.9rem; color: var(--rp-text-secondary); margin-bottom: var(--rp-space-1); }
    .status-badge {
      display: inline-block;
      margin-top: var(--rp-space-2);
      padding: 2px 10px;
      border-radius: var(--rp-radius-full, 999px);
      font-size: 0.8rem;
      font-weight: 700;
      background: var(--rp-bg-secondary);
      color: var(--rp-text-secondary);
    }
    .status-badge.scheduled, .status-badge.confirmed { background: #dbeafe; color: #1d4ed8; }
    .status-badge.rescheduled { background: #fef3c7; color: #b45309; }
    .status-badge.completed { background: #dcfce7; color: #15803d; }
    .status-badge.cancelled, .status-badge.no_show { background: #fee2e2; color: #b91c1c; }
    .interview-actions { display: flex; flex-direction: column; gap: var(--rp-space-2); flex-shrink: 0; }
    .btn { padding: 8px 14px; border-radius: var(--rp-radius-md); font-weight: 600; cursor: pointer; text-decoration: none; text-align: center; border: none; font-size: 0.9rem; }
    .btn-secondary { background: var(--rp-bg-secondary); color: var(--rp-text-primary); border: 1px solid var(--rp-border-light); }
    .btn-danger { background: #fee2e2; color: #b91c1c; }
    .empty-state {
      text-align: center;
      padding: var(--rp-space-12) var(--rp-space-4);
      background: var(--rp-bg-secondary);
      border-radius: var(--rp-radius-xl);
    }
    .empty-state h3 { font-size: 1.5rem; font-weight: 700; margin-bottom: var(--rp-space-2); }
    .empty-state p { color: var(--rp-text-secondary); margin-bottom: var(--rp-space-4); }
  `],
})
export class RecruiterInterviewsComponent implements OnInit {
  isLoading = signal(true);
  interviews = signal<Interview[]>([]);
  applicationId = signal<string | null>(null);
  cancellingId = signal<string | null>(null);
  statusLabels = INTERVIEW_STATUS_LABELS;
  typeLabels = INTERVIEW_TYPE_LABELS;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly interviewService: InterviewService,
  ) {}

  ngOnInit(): void {
    const applicationId = this.route.snapshot.queryParamMap.get('applicationId');
    this.applicationId.set(applicationId);

    if (!applicationId) {
      this.isLoading.set(false);
      return;
    }

    this.interviewService.getByApplication(applicationId).subscribe({
      next: (result) => {
        this.interviews.set(result.data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  isTerminal(status: InterviewStatus): boolean {
    return TERMINAL_STATUSES.includes(status);
  }

  cancel(interview: Interview): void {
    this.cancellingId.set(interview.id);
    this.interviewService.cancel(interview.id).subscribe({
      next: (updated) => {
        this.interviews.update((list) =>
          list.map((i) => (i.id === interview.id ? { ...i, status: updated.status } : i)),
        );
        this.cancellingId.set(null);
      },
      error: () => this.cancellingId.set(null),
    });
  }
}
