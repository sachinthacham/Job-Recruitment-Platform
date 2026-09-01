import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { OfferService } from '../../../core/services/offer.service';
import { Offer, OFFER_STATUS_LABELS } from '../../../core/models/offer.model';

@Component({
  selector: 'app-candidate-offers',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="offers-container">
      <header class="page-header">
        <h1>My Offers</h1>
        <p>Job offers you've received from recruiters.</p>
      </header>

      @if (isLoading()) {
        <div class="spinner"></div>
      } @else if (offers().length === 0) {
        <div class="empty-state">
          <h3>No offers yet</h3>
          <p>Offers you receive from recruiters will show up here.</p>
        </div>
      } @else {
        <div class="offers-list">
          @for (offer of offers(); track offer.id) {
            <div class="offer-card">
              <div class="offer-info">
                <div class="title-row">
                  <h3>{{ offer.application.job.title }}</h3>
                  <span class="status-badge" [class]="offer.status.toLowerCase()">
                    {{ statusLabels[offer.status] }}
                  </span>
                </div>
                <p class="salary">
                  {{ formatSalary(offer.salary, offer.currency) }} &middot; {{ employmentTypeLabel(offer.employmentType) }}
                </p>
                <p class="dates">
                  Starts {{ offer.startDate | date: 'mediumDate' }} &middot; Expires {{ offer.expirationDate | date: 'mediumDate' }}
                </p>

                @if (offer.benefits) {
                  <p class="benefits"><strong>Benefits:</strong> {{ offer.benefits }}</p>
                }
                @if (offer.additionalTerms) {
                  <p class="terms">{{ offer.additionalTerms }}</p>
                }
              </div>

              @if (canRespond(offer)) {
                <div class="actions">
                  <button
                    class="btn btn-accept"
                    [disabled]="respondingId() === offer.id"
                    (click)="respond(offer, 'ACCEPTED')"
                  >
                    Accept
                  </button>
                  <button
                    class="btn btn-reject"
                    [disabled]="respondingId() === offer.id"
                    (click)="respond(offer, 'REJECTED')"
                  >
                    Decline
                  </button>
                </div>
              }
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .offers-container {
      max-width: 900px;
      margin: 0 auto;
      padding: var(--rp-space-8) var(--rp-space-6);
    }
    .page-header {
      margin-bottom: var(--rp-space-8);
      h1 { font-size: 2rem; font-weight: 800; }
      p { color: var(--rp-text-secondary); margin-top: var(--rp-space-2); }
    }
    .offers-list {
      display: flex;
      flex-direction: column;
      gap: var(--rp-space-4);
    }
    .offer-card {
      background: var(--rp-bg-primary);
      border: 1px solid var(--rp-border-light);
      border-radius: var(--rp-radius-lg);
      padding: var(--rp-space-6);
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: var(--rp-space-5);
    }
    .offer-info {
      flex: 1;
      .title-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--rp-space-3);
        margin-bottom: var(--rp-space-1);
      }
      h3 { font-size: 1.1rem; font-weight: 700; }
      .salary { font-weight: 600; color: var(--rp-text-primary); margin-bottom: var(--rp-space-1); }
      .dates { font-size: 0.85rem; color: var(--rp-text-tertiary); margin-bottom: var(--rp-space-2); }
      .benefits, .terms {
        font-size: 0.9rem;
        color: var(--rp-text-secondary);
        margin-top: var(--rp-space-2);
      }
    }
    .status-badge {
      padding: 6px 12px;
      border-radius: 100px;
      font-size: 0.8rem;
      font-weight: 600;
      white-space: nowrap;
      flex-shrink: 0;
      &.draft { background: #f3f4f6; color: #374151; }
      &.sent { background: #e0e7ff; color: #3730a3; }
      &.viewed { background: #dbeafe; color: #1e40af; }
      &.accepted { background: #dcfce7; color: #166534; }
      &.rejected { background: #fee2e2; color: #991b1b; }
      &.expired { background: #f3f4f6; color: #6b7280; }
      &.withdrawn { background: #f3f4f6; color: #374151; }
    }
    .actions {
      display: flex;
      flex-direction: column;
      gap: var(--rp-space-2);
      flex-shrink: 0;
    }
    .btn {
      padding: 10px 20px;
      border-radius: var(--rp-radius-md);
      font-weight: 600;
      cursor: pointer;
      border: none;
      white-space: nowrap;
      &:disabled { opacity: 0.5; cursor: not-allowed; }
    }
    .btn-accept { background: var(--rp-primary); color: white; }
    .btn-reject { background: var(--rp-bg-secondary); color: var(--rp-text-secondary); border: 1px solid var(--rp-border-light); }
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
export class CandidateOffersComponent implements OnInit {
  isLoading = signal(true);
  offers = signal<Offer[]>([]);
  respondingId = signal<string | null>(null);
  statusLabels = OFFER_STATUS_LABELS;

  constructor(private readonly offerService: OfferService) {}

  ngOnInit(): void {
    this.offerService.getMyOffers().subscribe({
      next: (result) => {
        this.offers.set(result.data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  canRespond(offer: Offer): boolean {
    return offer.status === 'SENT' || offer.status === 'VIEWED';
  }

  formatSalary(salary: number, currency: string): string {
    return `${new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(salary)} ${currency}`;
  }

  employmentTypeLabel(type: string): string {
    return type
      .toLowerCase()
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  respond(offer: Offer, decision: 'ACCEPTED' | 'REJECTED'): void {
    const verb = decision === 'ACCEPTED' ? 'accept' : 'decline';
    if (!confirm(`Are you sure you want to ${verb} this offer?`)) {
      return;
    }

    this.respondingId.set(offer.id);
    this.offerService.respond(offer.id, decision).subscribe({
      next: (updated) => {
        this.offers.update((offers) =>
          offers.map((o) => (o.id === offer.id ? { ...o, status: updated.status } : o)),
        );
        this.respondingId.set(null);
      },
      error: () => this.respondingId.set(null),
    });
  }
}
