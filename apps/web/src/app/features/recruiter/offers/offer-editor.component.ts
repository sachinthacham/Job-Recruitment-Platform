import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { OfferService } from '../../../core/services/offer.service';
import { Offer } from '../../../core/models/offer.model';

@Component({
  selector: 'app-offer-editor',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="editor-container">
      <header class="editor-header">
        <h1>Create Offer</h1>
        <button class="btn btn-secondary" (click)="goBack()">Cancel</button>
      </header>

      @if (errorMessage()) {
        <div class="alert-error">{{ errorMessage() }}</div>
      }

      @if (createdOffer()) {
        <section class="card success-card">
          <h2>Offer created as draft</h2>
          <p>Review the details, then send it to the candidate when you're ready.</p>
          <div class="offer-actions">
            <button class="btn btn-primary" [disabled]="isSending()" (click)="sendOffer()">
              {{ isSending() ? 'Sending...' : 'Send Offer' }}
            </button>
            <button class="btn btn-secondary" (click)="goToOffers()">View Later</button>
          </div>
        </section>
      } @else {
        <section class="card">
          <form [formGroup]="form" (ngSubmit)="submit()" class="form-grid">
            <div class="form-group">
              <label>Salary</label>
              <input type="number" formControlName="salary" min="0" />
            </div>
            <div class="form-group">
              <label>Currency</label>
              <select formControlName="currency">
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="LKR">LKR</option>
                <option value="INR">INR</option>
                <option value="AUD">AUD</option>
                <option value="CAD">CAD</option>
                <option value="JPY">JPY</option>
                <option value="SGD">SGD</option>
              </select>
            </div>

            <div class="form-group">
              <label>Employment Type</label>
              <select formControlName="employmentType">
                <option value="FULL_TIME">Full Time</option>
                <option value="PART_TIME">Part Time</option>
                <option value="CONTRACT">Contract</option>
                <option value="INTERNSHIP">Internship</option>
                <option value="FREELANCE">Freelance</option>
                <option value="TEMPORARY">Temporary</option>
              </select>
            </div>
            <div class="form-group">
              <label>Start Date</label>
              <input type="date" formControlName="startDate" />
            </div>

            <div class="form-group">
              <label>Expiration Date</label>
              <input type="date" formControlName="expirationDate" />
            </div>

            <div class="form-group full-width">
              <label>Benefits (optional)</label>
              <textarea formControlName="benefits" rows="3"></textarea>
            </div>

            <div class="form-group full-width">
              <label>Additional Terms (optional)</label>
              <textarea formControlName="additionalTerms" rows="3"></textarea>
            </div>

            <div class="form-actions full-width">
              <button type="submit" class="btn btn-primary" [disabled]="form.invalid || isSaving()">
                {{ isSaving() ? 'Creating...' : 'Create Draft Offer' }}
              </button>
            </div>
          </form>
        </section>
      }
    </div>
  `,
  styles: [`
    .editor-container { max-width: 700px; margin: 0 auto; padding: var(--rp-space-8) var(--rp-space-6); }
    .editor-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--rp-space-6); }
    .editor-header h1 { font-size: 1.75rem; font-weight: 800; }
    .card { background: var(--rp-bg-primary); border: 1px solid var(--rp-border-light); border-radius: var(--rp-radius-lg); padding: var(--rp-space-6); }
    .success-card h2 { font-size: 1.2rem; font-weight: 700; margin-bottom: var(--rp-space-2); }
    .success-card p { color: var(--rp-text-secondary); margin-bottom: var(--rp-space-5); }
    .offer-actions { display: flex; gap: var(--rp-space-3); }
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
    .form-actions { display: flex; justify-content: flex-end; }
    .btn { padding: 10px 20px; border-radius: var(--rp-radius-md); font-weight: 700; cursor: pointer; border: none; }
    .btn-primary { background: var(--rp-primary-600, #4f46e5); color: #fff; }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
    .btn-secondary { background: var(--rp-bg-secondary); color: var(--rp-text-primary); }
    .alert-error { background: #fee2e2; color: #b91c1c; padding: var(--rp-space-3) var(--rp-space-4); border-radius: var(--rp-radius-md); margin-bottom: var(--rp-space-4); }
  `],
})
export class OfferEditorComponent implements OnInit {
  isSaving = signal(false);
  isSending = signal(false);
  errorMessage = signal('');
  createdOffer = signal<Offer | null>(null);
  form: FormGroup;
  private applicationId = '';

  constructor(
    private readonly fb: FormBuilder,
    private readonly offerService: OfferService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
  ) {
    this.form = this.fb.group({
      salary: [null, [Validators.required, Validators.min(0)]],
      currency: ['USD', Validators.required],
      benefits: [''],
      startDate: ['', Validators.required],
      employmentType: ['FULL_TIME', Validators.required],
      expirationDate: ['', Validators.required],
      additionalTerms: [''],
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

    this.offerService
      .create({
        applicationId: this.applicationId,
        salary: Number(value.salary),
        currency: value.currency,
        benefits: value.benefits || undefined,
        startDate: new Date(value.startDate).toISOString(),
        employmentType: value.employmentType,
        expirationDate: new Date(value.expirationDate).toISOString(),
        additionalTerms: value.additionalTerms || undefined,
      })
      .subscribe({
        next: (offer) => {
          this.createdOffer.set(offer);
          this.isSaving.set(false);
        },
        error: (err) => {
          this.isSaving.set(false);
          const message = err.error?.error?.message || err.error?.message;
          this.errorMessage.set(
            err.status === 409
              ? 'An offer already exists for this application.'
              : message || 'Failed to create offer.',
          );
        },
      });
  }

  sendOffer(): void {
    if (!this.createdOffer()) return;
    this.isSending.set(true);
    this.offerService.send(this.createdOffer()!.id).subscribe({
      next: () => this.goToOffers(),
      error: (err) => {
        this.isSending.set(false);
        this.errorMessage.set(err.error?.error?.message || err.error?.message || 'Failed to send offer.');
      },
    });
  }

  goToOffers(): void {
    this.router.navigate(['/recruiter/offers'], {
      queryParams: { applicationId: this.applicationId },
    });
  }

  goBack(): void {
    this.router.navigate(['/recruiter/jobs']);
  }
}
