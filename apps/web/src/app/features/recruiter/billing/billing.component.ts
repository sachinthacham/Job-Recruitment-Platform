import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { SubscriptionService } from '../../../core/services/subscription.service';
import { Payment, PlanDetails, Subscription, SubscriptionPlan } from '../../../core/models/subscription.model';

@Component({
  selector: 'app-billing',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container">
      <header class="page-header">
        <h1>Billing</h1>
      </header>

      @if (errorMessage()) {
        <div class="alert-error">{{ errorMessage() }}</div>
      }

      @if (isLoading()) {
        <div class="spinner"></div>
      } @else {
        @if (current()) {
          <section class="card current-plan">
            <h2>Current Plan: {{ current()!.plan }}</h2>
            <p>Status: {{ current()!.status ?? 'No active subscription (defaults to Free)' }}</p>
            @if (current()!.plan !== 'FREE' && current()!.status === 'ACTIVE') {
              <button class="btn btn-danger" [disabled]="isActing()" (click)="cancelSubscription()">
                {{ isActing() ? 'Cancelling...' : 'Cancel Subscription' }}
              </button>
            }
          </section>
        }

        <section class="plans-grid">
          @for (plan of plans(); track plan.plan) {
            <div class="plan-card" [class.active]="current()?.plan === plan.plan">
              <h3>{{ plan.name }}</h3>
              <p class="price">\${{ plan.priceUsd }}<span>/mo</span></p>
              <p class="job-limit">{{ plan.jobLimit === null ? 'Unlimited jobs' : plan.jobLimit + ' active jobs' }}</p>
              <ul class="features">
                @for (feature of plan.features; track feature) {
                  <li>{{ feature }}</li>
                }
              </ul>
              <button
                class="btn btn-primary"
                [disabled]="current()?.plan === plan.plan || isActing()"
                (click)="subscribe(plan.plan)"
              >
                {{ current()?.plan === plan.plan ? 'Current Plan' : 'Switch to this plan' }}
              </button>
            </div>
          }
        </section>

        <section class="card">
          <h2>Payment History</h2>
          @if (payments().length === 0) {
            <p class="empty-note">No payments yet.</p>
          } @else {
            <table class="payments-table">
              <thead>
                <tr><th>Date</th><th>Amount</th><th>Status</th></tr>
              </thead>
              <tbody>
                @for (payment of payments(); track payment.id) {
                  <tr>
                    <td>{{ (payment.paidAt || payment.createdAt) | date: 'mediumDate' }}</td>
                    <td>{{ (payment.amount / 100).toFixed(2) }} {{ payment.currency }}</td>
                    <td>{{ payment.status }}</td>
                  </tr>
                }
              </tbody>
            </table>
          }
        </section>
      }
    </div>
  `,
  styles: [`
    .page-container { max-width: 1000px; margin: 0 auto; padding: var(--rp-space-8) var(--rp-space-6); }
    .page-header { margin-bottom: var(--rp-space-6); }
    .page-header h1 { font-size: 2rem; font-weight: 800; }
    .card { background: var(--rp-bg-primary); border: 1px solid var(--rp-border-light); border-radius: var(--rp-radius-lg); padding: var(--rp-space-6); margin-bottom: var(--rp-space-6); }
    .current-plan h2 { font-size: 1.2rem; font-weight: 700; margin-bottom: var(--rp-space-2); }
    .current-plan p { color: var(--rp-text-secondary); margin-bottom: var(--rp-space-3); }
    .plans-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: var(--rp-space-5); margin-bottom: var(--rp-space-6); }
    .plan-card { background: var(--rp-bg-primary); border: 1.5px solid var(--rp-border-light); border-radius: var(--rp-radius-lg); padding: var(--rp-space-5); display: flex; flex-direction: column; gap: var(--rp-space-2); }
    .plan-card.active { border-color: var(--rp-primary-600, #4f46e5); }
    .plan-card h3 { font-size: 1.1rem; font-weight: 700; }
    .price { font-size: 1.6rem; font-weight: 800; }
    .price span { font-size: 0.9rem; font-weight: 500; color: var(--rp-text-secondary); }
    .job-limit { font-size: 0.85rem; color: var(--rp-text-secondary); }
    .features { list-style: none; padding: 0; margin: var(--rp-space-2) 0; display: flex; flex-direction: column; gap: var(--rp-space-1); flex: 1; }
    .features li { font-size: 0.85rem; color: var(--rp-text-secondary); }
    .features li::before { content: '✓ '; color: #15803d; font-weight: 700; }
    .payments-table { width: 100%; border-collapse: collapse; }
    .payments-table th, .payments-table td { text-align: left; padding: var(--rp-space-3); border-bottom: 1px solid var(--rp-border-light); font-size: 0.9rem; }
    .empty-note { color: var(--rp-text-secondary); }
    .btn { padding: 10px 16px; border-radius: var(--rp-radius-md); font-weight: 700; cursor: pointer; border: none; width: 100%; }
    .btn-primary { background: var(--rp-primary-600, #4f46e5); color: #fff; }
    .btn-danger { background: #fee2e2; color: #b91c1c; width: auto; }
    .btn:disabled { opacity: 0.6; cursor: not-allowed; }
    .alert-error { background: #fee2e2; color: #b91c1c; padding: var(--rp-space-3) var(--rp-space-4); border-radius: var(--rp-radius-md); margin-bottom: var(--rp-space-4); }
  `],
})
export class BillingComponent implements OnInit {
  isLoading = signal(true);
  isActing = signal(false);
  errorMessage = signal('');
  plans = signal<PlanDetails[]>([]);
  current = signal<Subscription | null>(null);
  payments = signal<Payment[]>([]);

  constructor(private readonly subscriptionService: SubscriptionService) {}

  ngOnInit(): void {
    forkJoin({
      plans: this.subscriptionService.getPlans(),
      current: this.subscriptionService.getCurrent(),
      payments: this.subscriptionService.getPayments(),
    }).subscribe({
      next: ({ plans, current, payments }) => {
        this.plans.set(plans);
        this.current.set(current);
        this.payments.set(payments.data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(
          err.error?.error?.message || err.error?.message || 'Failed to load billing information.',
        );
      },
    });
  }

  subscribe(plan: SubscriptionPlan): void {
    this.isActing.set(true);
    this.errorMessage.set('');
    this.subscriptionService.subscribe(plan).subscribe({
      next: (subscription) => {
        this.current.set(subscription);
        this.isActing.set(false);
      },
      error: (err) => {
        this.isActing.set(false);
        this.errorMessage.set(err.error?.error?.message || err.error?.message || 'Failed to change plan.');
      },
    });
  }

  cancelSubscription(): void {
    if (!window.confirm('Cancel your active subscription? Your plan will revert to Free.')) {
      return;
    }

    this.isActing.set(true);
    this.errorMessage.set('');
    this.subscriptionService.cancel().subscribe({
      next: (subscription) => {
        this.current.set(subscription);
        this.isActing.set(false);
      },
      error: (err) => {
        this.isActing.set(false);
        this.errorMessage.set(
          err.error?.error?.message || err.error?.message || 'Failed to cancel subscription.',
        );
      },
    });
  }
}
