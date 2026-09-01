import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { InterviewService } from '../../../core/services/interview.service';
import {
  Interview,
  INTERVIEW_STATUS_LABELS,
  INTERVIEW_TYPE_LABELS,
} from '../../../core/models/interview.model';

@Component({
  selector: 'app-candidate-interviews',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="interviews-container">
      <header class="page-header">
        <h1>My Interviews</h1>
        <p>Upcoming and past interviews for your applications.</p>
      </header>

      @if (isLoading()) {
        <div class="spinner"></div>
      } @else if (interviews().length === 0) {
        <div class="empty-state">
          <h3>No interviews scheduled</h3>
          <p>When a recruiter schedules an interview with you, it will show up here.</p>
        </div>
      } @else {
        <div class="interviews-list">
          @for (interview of interviews(); track interview.id) {
            <div class="interview-card">
              <div class="interview-info">
                <div class="title-row">
                  <h3>{{ interview.title }}</h3>
                  <span class="status-badge" [class]="interview.status.toLowerCase()">
                    {{ statusLabels[interview.status] }}
                  </span>
                </div>
                <p class="type">{{ typeLabels[interview.type] }}</p>
                <p class="schedule">
                  {{ interview.scheduledAt | date: 'medium' }} &middot; {{ interview.duration }} min
                </p>

                @if (interview.meetingUrl) {
                  <p class="location">
                    <a [href]="interview.meetingUrl" target="_blank" rel="noopener">Join meeting</a>
                  </p>
                } @else if (interview.location) {
                  <p class="location">{{ interview.location }}</p>
                }

                @if (interviewers(interview).length > 0) {
                  <p class="interviewers">
                    With {{ interviewers(interview).map(nameOf).join(', ') }}
                  </p>
                }

                @if (interview.notes) {
                  <p class="notes">{{ interview.notes }}</p>
                }
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .interviews-container {
      max-width: 900px;
      margin: 0 auto;
      padding: var(--rp-space-8) var(--rp-space-6);
    }
    .page-header {
      margin-bottom: var(--rp-space-8);
      h1 { font-size: 2rem; font-weight: 800; }
      p { color: var(--rp-text-secondary); margin-top: var(--rp-space-2); }
    }
    .interviews-list {
      display: flex;
      flex-direction: column;
      gap: var(--rp-space-4);
    }
    .interview-card {
      background: var(--rp-bg-primary);
      border: 1px solid var(--rp-border-light);
      border-radius: var(--rp-radius-lg);
      padding: var(--rp-space-6);
    }
    .interview-info {
      .title-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--rp-space-3);
        margin-bottom: var(--rp-space-1);
      }
      h3 { font-size: 1.1rem; font-weight: 700; }
      .type { color: var(--rp-text-secondary); font-weight: 500; margin-bottom: var(--rp-space-1); }
      .schedule { font-size: 0.9rem; color: var(--rp-text-secondary); margin-bottom: var(--rp-space-2); }
      .location {
        font-size: 0.9rem;
        margin-bottom: var(--rp-space-2);
        a { color: var(--rp-primary); font-weight: 600; }
      }
      .interviewers { font-size: 0.85rem; color: var(--rp-text-tertiary); margin-bottom: var(--rp-space-2); }
      .notes {
        font-size: 0.9rem;
        color: var(--rp-text-secondary);
        background: var(--rp-bg-secondary);
        padding: var(--rp-space-3);
        border-radius: var(--rp-radius-md);
        white-space: pre-line;
      }
    }
    .status-badge {
      padding: 6px 12px;
      border-radius: 100px;
      font-size: 0.8rem;
      font-weight: 600;
      white-space: nowrap;
      flex-shrink: 0;
      &.scheduled { background: #e0e7ff; color: #3730a3; }
      &.confirmed { background: #dbeafe; color: #1e40af; }
      &.rescheduled { background: #fef3c7; color: #92400e; }
      &.completed { background: #dcfce7; color: #166534; }
      &.cancelled { background: #fee2e2; color: #991b1b; }
      &.no_show { background: #f3f4f6; color: #374151; }
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
export class CandidateInterviewsComponent implements OnInit {
  isLoading = signal(true);
  interviews = signal<Interview[]>([]);
  statusLabels = INTERVIEW_STATUS_LABELS;
  typeLabels = INTERVIEW_TYPE_LABELS;

  constructor(private readonly interviewService: InterviewService) {}

  ngOnInit(): void {
    this.interviewService.getMyInterviews().subscribe({
      next: (result) => {
        this.interviews.set(result.data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  interviewers(interview: Interview) {
    return interview.participants.filter((p) => p.role === 'INTERVIEWER');
  }

  nameOf(participant: Interview['participants'][number]): string {
    return `${participant.user.firstName} ${participant.user.lastName}`;
  }
}
