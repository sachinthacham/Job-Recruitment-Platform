import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { OfferService } from '../../../core/services/offer.service';
import { Offer, OfferStatus, OFFER_STATUS_LABELS } from '../../../core/models/offer.model';

const TERMINAL_STATUSES: OfferStatus[] = ['ACCEPTED', 'REJECTED', 'EXPIRED', 'WITHDRAWN'];

@Component({
  selector: 'app-recruiter-offers',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="page-container">
      <header class="page-header">
        <h1>Offer</h1>
      </header>

      @if (!applicationId()) {
        <div class="empty-state">
          <h3>No application selected</h3>
          <p>Open this page from an applicant's profile to view or create an offer for that candidate.</p>
          <button class="btn btn-secondary" routerLink="/recruiter/jobs">Go to Jobs</button>
        </div>
      } @else if (isLoading()) {
        <div class="spinner"></div>
      } @else if (!offer()) {
        <div class="empty-state">
          <h3>No offer yet</h3>
          <p>No offer has been created for this application.</p>
          <a class="btn btn-primary" [routerLink]="['/recruiter/offers/new', applicationId()]">Create Offer</a>
        </div>
      } @else {
        <div class="offer-card">
          <div class="offer-header">
            <h3>{{ offer()!.application.job.title }}</h3>
            <span class="status-badge" [class]="offer()!.status.toLowerCase()">{{ statusLabels[offer()!.status] }}</span>
          </div>
          <p class="detail">Salary: {{ offer()!.salary | number }} {{ offer()!.currency }}</p>
          <p class="detail">Start Date: {{ offer()!.startDate | date: 'mediumDate' }}</p>
          <p class="detail">Expires: {{ offer()!.expirationDate | date: 'mediumDate' }}</p>
          @if (offer()!.benefits) {
            <p class="detail">Benefits: {{ offer()!.benefits }}</p>
          }

          <div class="offer-actions">
            @if (offer()!.status === 'DRAFT') {
              <button class="btn btn-primary" [disabled]="isActing()" (click)="send()">
                {{ isActing() ? 'Sending...' : 'Send Offer' }}
              </button>
            }
            @if (!isTerminal(offer()!.status)) {
              <button class="btn btn-danger" [disabled]="isActing()" (click)="withdraw()">
                {{ isActing() ? 'Withdrawing...' : 'Withdraw' }}
              </button>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .page-container { max-width: 700px; margin: 0 auto; padding: var(--rp-space-8) var(--rp-space-6); }
    .page-header { margin-bottom: var(--rp-space-6); }
    .page-header h1 { font-size: 2rem; font-weight: 800; }
    .offer-card { background: var(--rp-bg-primary); border: 1px solid var(--rp-border-light); border-radius: var(--rp-radius-lg); padding: var(--rp-space-6); }
    .offer-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--rp-space-4); }
    .offer-header h3 { font-size: 1.2rem; font-weight: 700; }
    .detail { margin-bottom: var(--rp-space-2); color: var(--rp-text-secondary); }
    .status-badge { padding: 2px 10px; border-radius: var(--rp-radius-full, 999px); font-size: 0.8rem; font-weight: 700; background: var(--rp-bg-secondary); }
    .status-badge.sent, .status-badge.viewed { background: #dbeafe; color: #1d4ed8; }
    .status-badge.accepted { background: #dcfce7; color: #15803d; }
    .status-badge.rejected, .status-badge.expired, .status-badge.withdrawn { background: #fee2e2; color: #b91c1c; }
    .offer-actions { display: flex; gap: var(--rp-space-3); margin-top: var(--rp-space-5); }
    .btn { padding: 10px 20px; border-radius: var(--rp-radius-md); font-weight: 700; cursor: pointer; border: none; text-decoration: none; display: inline-block; }
    .btn-primary { background: var(--rp-primary-600, #4f46e5); color: #fff; }
    .btn-secondary { background: var(--rp-bg-secondary); color: var(--rp-text-primary); }
    .btn-danger { background: #fee2e2; color: #b91c1c; }
    .btn:disabled { opacity: 0.6; cursor: not-allowed; }
    .empty-state { text-align: center; padding: var(--rp-space-12) var(--rp-space-4); background: var(--rp-bg-secondary); border-radius: var(--rp-radius-xl); }
    .empty-state h3 { font-size: 1.5rem; font-weight: 700; margin-bottom: var(--rp-space-2); }
    .empty-state p { color: var(--rp-text-secondary); margin-bottom: var(--rp-space-4); }
  `],
})
export class RecruiterOffersComponent implements OnInit {
  isLoading = signal(true);
  isActing = signal(false);
  offer = signal<Offer | null>(null);
  applicationId = signal<string | null>(null);
  statusLabels = OFFER_STATUS_LABELS;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly offerService: OfferService,
  ) {}

  ngOnInit(): void {
    const applicationId = this.route.snapshot.queryParamMap.get('applicationId');
    this.applicationId.set(applicationId);

    if (!applicationId) {
      this.isLoading.set(false);
      return;
    }

    this.offerService.getByApplication(applicationId).subscribe({
      next: (offer) => {
        this.offer.set(offer);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  isTerminal(status: OfferStatus): boolean {
    return TERMINAL_STATUSES.includes(status);
  }

  send(): void {
    if (!this.offer()) return;
    this.isActing.set(true);
    this.offerService.send(this.offer()!.id).subscribe({
      next: (updated) => {
        this.offer.set({ ...this.offer()!, status: updated.status });
        this.isActing.set(false);
      },
      error: () => this.isActing.set(false),
    });
  }

  withdraw(): void {
    if (!this.offer()) return;
    this.isActing.set(true);
    this.offerService.withdraw(this.offer()!.id).subscribe({
      next: (updated) => {
        this.offer.set({ ...this.offer()!, status: updated.status });
        this.isActing.set(false);
      },
      error: () => this.isActing.set(false),
    });
  }
}
