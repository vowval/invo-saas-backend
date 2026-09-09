export type BillingCycle = 'FREE' | 'MONTHLY' | 'YEARLY' | 'LIFETIME';

export type SubscriptionPlan = {
  id: string;
  name: string;
  description: string;
  maxUsers: number;
  invoiceLimit: number | null;
  billingCycle: BillingCycle;
  priceInr: number;
  durationMonths: number | null;
  requiresPayment: boolean;
  active?: boolean;
};

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'FREE',
    name: 'Free starter',
    description: 'Try DyeFlow with your first 100 invoices.',
    maxUsers: 1,
    invoiceLimit: 100,
    billingCycle: 'FREE',
    priceInr: 0,
    durationMonths: null,
    requiresPayment: false,
  },
  {
    id: 'TEAM_MONTHLY',
    name: 'Team monthly',
    description: 'For a growing dyeing factory team.',
    maxUsers: 5,
    invoiceLimit: null,
    billingCycle: 'MONTHLY',
    priceInr: 999,
    durationMonths: 1,
    requiresPayment: true,
  },
  {
    id: 'TEAM_YEARLY',
    name: 'Team yearly',
    description: 'Save with annual billing for up to five users.',
    maxUsers: 5,
    invoiceLimit: null,
    billingCycle: 'YEARLY',
    priceInr: 9990,
    durationMonths: 12,
    requiresPayment: true,
  },
  {
    id: 'LIFETIME',
    name: 'Lifetime',
    description: 'One-time payment for a ten-user workspace.',
    maxUsers: 10,
    invoiceLimit: null,
    billingCycle: 'LIFETIME',
    priceInr: 29999,
    durationMonths: null,
    requiresPayment: true,
  },
];

export function getSubscriptionPlan(planId: string | undefined) {
  return SUBSCRIPTION_PLANS.find(plan => plan.id === planId) ?? SUBSCRIPTION_PLANS[0];
}
