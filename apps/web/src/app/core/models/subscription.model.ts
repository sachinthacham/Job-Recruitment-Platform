export type SubscriptionPlan = 'FREE' | 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE';

export type SubscriptionStatus =
  | 'ACTIVE'
  | 'TRIALING'
  | 'PAST_DUE'
  | 'CANCELLED'
  | 'EXPIRED';

export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';

export interface PlanDetails {
  plan: SubscriptionPlan;
  name: string;
  priceUsd: number;
  jobLimit: number | null;
  features: string[];
}

export interface Subscription {
  id?: string;
  tenantId: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus | null;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  cancelledAt?: string | null;
  isDefault?: boolean;
}

export interface Payment {
  id: string;
  subscriptionId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paidAt: string | null;
  createdAt: string;
}

export const PLAN_ORDER: SubscriptionPlan[] = ['FREE', 'STARTER', 'PROFESSIONAL', 'ENTERPRISE'];
