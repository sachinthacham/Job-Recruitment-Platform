import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { InterviewService } from '../../../core/services/interview.service';
import { INTERVIEW_TYPE_LABELS, InterviewType } from '../../../core/models/interview.model';

const TYPE_OPTIONS = Object.keys(INTERVIEW_TYPE_LABELS) as InterviewType[];

@Component({
  selector: 'app-schedule-interview',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="editor-container">
      <header class="editor-header">
        <h1>Schedule Interview</h1>
        <button class="btn btn-secondary" (click)="goBack()">Cancel</button>
      </header>

      @if (errorMessage()) {
        <div class="alert alert-error">{{ errorMessage() }}</div>
      }

      <section class="card">
        <form [formGroup]="form" (ngSubmit)="submit()" class="form-grid">
          <div class="form-group">
            <label>Interview Type</label>
            <select formControlName="type">
              @for (type of typeOptions; track type) {
                <option [value]="type">{{ typeLabels[type] }}</option>
              }
            </select>
          </div>

          <div class="form-group">
            <label>Duration (minutes)</label>
            <input type="number" formControlName="duration" min="5" />
          </div>

          <div class="form-group full-width">
            <label>Title</label>
            <input type="text" formControlName="title" placeholder="e.g. Technical Screen" />
          </div>

          <div class="form-group">
            <label>Scheduled At</label>
            <input type="datetime-local" formControlName="scheduledAt" />
          </div>

          <div class="form-group">
            <label>Location (optional)</label>
            <input type="text" formControlName="location" placeholder="Office address" />
          </div>

          <div class="form-group full-width">
            <label>Meeting URL (optional)</label>
            <input type="text" formControlName="meetingUrl" placeholder="https://..." />
          </div>

          <div class="form-group full-width">
            <label>Notes (optional)</label>
            <textarea formControlName="notes" rows="4"></textarea>
          </div>

          <div class="form-group full-width">
            <label>Interviewer User IDs</label>
            <input type="text" formControlName="interviewerIds" placeholder="uuid-1, uuid-2" />
            <span class="caption">Comma-separated user IDs of the interviewers. There's no user picker yet — paste UUIDs directly.</span>
          </div>

          <div class="form-actions full-width">
            <button type="submit" class="btn btn-primary" [disabled]="form.invalid || isSaving()">
              {{ isSaving() ? 'Scheduling...' : 'Schedule Interview' }}
            </button>
          </div>
        </form>
      </section>
    </div>
  `,
  styles: [`
    .editor-container { max-width: 700px; margin: 0 auto; padding: var(--rp-space-8) var(--rp-space-6); }
    .editor-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--rp-space-6); }
    .editor-header h1 { font-size: 1.75rem; font-weight: 800; }
    .card { background: var(--rp-bg-primary); border: 1px solid var(--rp-border-light); border-radius: var(--rp-radius-lg); padding: var(--rp-space-6); }
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
    .btn-secondary { background: var(--rp-bg-secondary); color: var(--rp-text-primary); }
    .alert-error { background: #fee2e2; color: #b91c1c; padding: var(--rp-space-3) var(--rp-space-4); border-radius: var(--rp-radius-md); margin-bottom: var(--rp-space-4); }
  `],
})
export class ScheduleInterviewComponent implements OnInit {
  isSaving = signal(false);
  errorMessage = signal('');
  typeLabels = INTERVIEW_TYPE_LABELS;
  typeOptions = TYPE_OPTIONS;
  form: FormGroup;
  private applicationId = '';

  constructor(
    private readonly fb: FormBuilder,
    private readonly interviewService: InterviewService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
  ) {
    this.form = this.fb.group({
      type: ['VIDEO', Validators.required],
      title: ['', Validators.required],
      scheduledAt: ['', Validators.required],
      duration: [30, [Validators.required, Validators.min(5)]],
      location: [''],
      meetingUrl: [''],
      notes: [''],
      interviewerIds: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.applicationId = this.route.snapshot.paramMap.get('applicationId') ?? '';
  }

  submit(): void {
    if (this.form.invalid || !this.applicationId) {
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set('');

    const value = this.form.value;
    const interviewerIds = (value.interviewerIds as string)
      .split(',')
      .map((id) => id.trim())
      .filter((id) => id.length > 0);

    this.interviewService
      .schedule({
        applicationId: this.applicationId,
        type: value.type,
        title: value.title,
        scheduledAt: new Date(value.scheduledAt).toISOString(),
        duration: Number(value.duration),
        location: value.location || undefined,
        meetingUrl: value.meetingUrl || undefined,
        notes: value.notes || undefined,
        interviewerIds,
      })
      .subscribe({
        next: () => {
          this.isSaving.set(false);
          this.router.navigate(['/recruiter/interviews'], {
            queryParams: { applicationId: this.applicationId },
          });
        },
        error: (err) => {
          this.isSaving.set(false);
          this.errorMessage.set(
            err.error?.error?.message || err.error?.message || 'Failed to schedule interview.',
          );
        },
      });
  }

  goBack(): void {
    this.router.navigate(['/recruiter/jobs']);
  }
}
