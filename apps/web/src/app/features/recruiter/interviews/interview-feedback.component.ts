import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { InterviewService } from '../../../core/services/interview.service';
import {
  Interview,
  InterviewFeedback,
  INTERVIEW_RECOMMENDATION_LABELS,
  InterviewRecommendation,
} from '../../../core/models/interview.model';

const RECOMMENDATION_OPTIONS = Object.keys(
  INTERVIEW_RECOMMENDATION_LABELS,
) as InterviewRecommendation[];

@Component({
  selector: 'app-interview-feedback',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="page-container">
      <header class="page-header">
        <button class="btn-back" (click)="goBack()">← Back to interviews</button>
        @if (interview()) {
          <h1>{{ interview()!.title }}</h1>
          <p>Scheduled {{ interview()!.scheduledAt | date: 'medium' }}</p>
        }
      </header>

      @if (isLoading()) {
        <div class="spinner"></div>
      } @else {
        <section class="card">
          <h2>Existing Feedback</h2>
          @if (feedbackList().length === 0) {
            <p class="empty-note">No feedback submitted yet.</p>
          } @else {
            <div class="feedback-list">
              @for (fb of feedbackList(); track fb.id) {
                <div class="feedback-item">
                  <div class="feedback-header">
                    <strong>{{ fb.reviewer.firstName }} {{ fb.reviewer.lastName }}</strong>
                    <span class="rec-badge">{{ recommendationLabels[fb.recommendation] }}</span>
                  </div>
                  <p class="rating">Overall: {{ fb.overallRating }}/5</p>
                  @if (fb.strengths) {
                    <p><strong>Strengths:</strong> {{ fb.strengths }}</p>
                  }
                  @if (fb.weaknesses) {
                    <p><strong>Weaknesses:</strong> {{ fb.weaknesses }}</p>
                  }
                  <p class="meta">{{ fb.createdAt | date: 'medium' }}</p>
                </div>
              }
            </div>
          }
        </section>

        <section class="card">
          <h2>Submit Feedback</h2>

          @if (errorMessage()) {
            <div class="alert-error">{{ errorMessage() }}</div>
          }

          @if (submitted()) {
            <p class="success-note">Your feedback has been submitted. Thank you!</p>
          } @else {
            <form [formGroup]="form" (ngSubmit)="submit()" class="form-grid">
              <div class="form-group">
                <label>Overall Rating (1-5)</label>
                <input type="number" formControlName="overallRating" min="1" max="5" />
              </div>
              <div class="form-group">
                <label>Recommendation</label>
                <select formControlName="recommendation">
                  @for (rec of recommendationOptions; track rec) {
                    <option [value]="rec">{{ recommendationLabels[rec] }}</option>
                  }
                </select>
              </div>
              <div class="form-group">
                <label>Technical Rating (optional)</label>
                <input type="number" formControlName="technicalRating" min="1" max="5" />
              </div>
              <div class="form-group">
                <label>Communication Rating (optional)</label>
                <input type="number" formControlName="communicationRating" min="1" max="5" />
              </div>
              <div class="form-group">
                <label>Culture Fit Rating (optional)</label>
                <input type="number" formControlName="cultureFitRating" min="1" max="5" />
              </div>
              <div class="form-group full-width">
                <label>Strengths</label>
                <textarea formControlName="strengths" rows="3"></textarea>
              </div>
              <div class="form-group full-width">
                <label>Weaknesses</label>
                <textarea formControlName="weaknesses" rows="3"></textarea>
              </div>
              <div class="form-group full-width">
                <label>Private Notes</label>
                <textarea formControlName="privateNotes" rows="3"></textarea>
                <span class="caption">Never shown to the candidate.</span>
              </div>
              <div class="form-actions full-width">
                <button type="submit" class="btn btn-primary" [disabled]="form.invalid || isSaving()">
                  {{ isSaving() ? 'Submitting...' : 'Submit Feedback' }}
                </button>
              </div>
            </form>
          }
        </section>
      }
    </div>
  `,
  styles: [`
    .page-container { max-width: 700px; margin: 0 auto; padding: var(--rp-space-8) var(--rp-space-6); }
    .btn-back { background: none; border: none; color: var(--rp-text-secondary); font-weight: 600; cursor: pointer; margin-bottom: var(--rp-space-4); padding: 0; }
    .page-header h1 { font-size: 1.75rem; font-weight: 800; }
    .page-header p { color: var(--rp-text-secondary); margin-top: var(--rp-space-1); }
    .card { background: var(--rp-bg-primary); border: 1px solid var(--rp-border-light); border-radius: var(--rp-radius-lg); padding: var(--rp-space-6); margin-top: var(--rp-space-6); }
    .card h2 { font-size: 1.2rem; font-weight: 700; margin-bottom: var(--rp-space-4); }
    .feedback-list { display: flex; flex-direction: column; gap: var(--rp-space-4); }
    .feedback-item { border-top: 1px solid var(--rp-border-light); padding-top: var(--rp-space-3); }
    .feedback-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--rp-space-1); }
    .rec-badge { background: var(--rp-bg-secondary); padding: 2px 10px; border-radius: var(--rp-radius-full, 999px); font-size: 0.8rem; font-weight: 700; }
    .rating { font-weight: 600; margin-bottom: var(--rp-space-1); }
    .meta { font-size: 0.8rem; color: var(--rp-text-tertiary); }
    .empty-note, .success-note { color: var(--rp-text-secondary); }
    .success-note { color: #15803d; font-weight: 600; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--rp-space-5); }
    .form-group { display: flex; flex-direction: column; gap: var(--rp-space-2); }
    .full-width { grid-column: 1 / -1; }
    label { font-weight: 600; font-size: 0.9rem; color: var(--rp-text-secondary); }
    input, select, textarea {
      padding: 10px 14px;
      border: 1.5px solid var(--rp-border-light);
      border-radius: var(--rp-radius-md);
      font-size: 0.95rem;
      background: var(--rp-bg-primary);
      color: var(--rp-text-primary);
    }
    .caption { font-size: 0.8rem; color: var(--rp-text-tertiary); }
    .form-actions { display: flex; justify-content: flex-end; }
    .btn { padding: 10px 20px; border-radius: var(--rp-radius-md); font-weight: 700; cursor: pointer; border: none; }
    .btn-primary { background: var(--rp-primary-600, #4f46e5); color: #fff; }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
    .alert-error { background: #fee2e2; color: #b91c1c; padding: var(--rp-space-3) var(--rp-space-4); border-radius: var(--rp-radius-md); margin-bottom: var(--rp-space-4); }
  `],
})
export class InterviewFeedbackComponent implements OnInit {
  isLoading = signal(true);
  isSaving = signal(false);
  submitted = signal(false);
  errorMessage = signal('');
  interview = signal<Interview | null>(null);
  feedbackList = signal<InterviewFeedback[]>([]);
  recommendationLabels = INTERVIEW_RECOMMENDATION_LABELS;
  recommendationOptions = RECOMMENDATION_OPTIONS;
  form: FormGroup;
  private interviewId = '';

  constructor(
    private readonly fb: FormBuilder,
    private readonly interviewService: InterviewService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
  ) {
    this.form = this.fb.group({
      overallRating: [5, [Validators.required, Validators.min(1), Validators.max(5)]],
      recommendation: ['HIRE', Validators.required],
      technicalRating: [null],
      communicationRating: [null],
      cultureFitRating: [null],
      strengths: [''],
      weaknesses: [''],
      privateNotes: [''],
    });
  }

  ngOnInit(): void {
    this.interviewId = this.route.snapshot.paramMap.get('id') ?? '';
    if (!this.interviewId) {
      this.isLoading.set(false);
      return;
    }

    this.interviewService.getOne(this.interviewId).subscribe({
      next: (interview) => this.interview.set(interview),
    });

    this.interviewService.getFeedback(this.interviewId).subscribe({
      next: (feedback) => {
        this.feedbackList.set(feedback);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  submit(): void {
    if (this.form.invalid || !this.interviewId) {
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set('');

    const value = this.form.value;

    this.interviewService
      .submitFeedback(this.interviewId, {
        overallRating: Number(value.overallRating),
        technicalRating: value.technicalRating ? Number(value.technicalRating) : undefined,
        communicationRating: value.communicationRating
          ? Number(value.communicationRating)
          : undefined,
        cultureFitRating: value.cultureFitRating ? Number(value.cultureFitRating) : undefined,
        strengths: value.strengths || undefined,
        weaknesses: value.weaknesses || undefined,
        recommendation: value.recommendation,
        privateNotes: value.privateNotes || undefined,
      })
      .subscribe({
        next: (feedback) => {
          this.feedbackList.update((list) => [feedback, ...list]);
          this.isSaving.set(false);
          this.submitted.set(true);
        },
        error: (err) => {
          this.isSaving.set(false);
          const message = err.error?.error?.message || err.error?.message;
          this.errorMessage.set(
            err.status === 409
              ? "You've already submitted feedback for this interview."
              : message || 'Failed to submit feedback.',
          );
        },
      });
  }

  goBack(): void {
    this.router.navigate(['/recruiter/interviews']);
  }
}
