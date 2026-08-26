import { SubscriptionPlan } from '@prisma/client';

export interface PlanDetails {
  plan: SubscriptionPlan;
  name: string;
  priceUsd: number;
  jobLimit: number | null;
  features: string[];
}

export const PLAN_CATALOG: Record<SubscriptionPlan, PlanDetails> = {
  [SubscriptionPlan.FREE]: {
    plan: SubscriptionPlan.FREE,
    name: 'Free',
    priceUsd: 0,
    jobLimit: 3,
    features: ['3 active job postings', 'Basic applicant tracking'],
  },
  [SubscriptionPlan.STARTER]: {
    plan: SubscriptionPlan.STARTER,
    name: 'Starter',
    priceUsd: 49,
    jobLimit: 10,
    features: [
      '10 active job postings',
      'Interview scheduling',
      'Basic analytics',
    ],
  },
  [SubscriptionPlan.PROFESSIONAL]: {
    plan: SubscriptionPlan.PROFESSIONAL,
    name: 'Professional',
    priceUsd: 149,
    jobLimit: 50,
    features: [
      '50 active job postings',
      'Advanced analytics',
      'Team messaging',
    ],
  },
  [SubscriptionPlan.ENTERPRISE]: {
    plan: SubscriptionPlan.ENTERPRISE,
    name: 'Enterprise',
    priceUsd: 499,
    jobLimit: null,
    features: [
      'Unlimited job postings',
      'Dedicated support',
      'Custom integrations',
    ],
  },
};
