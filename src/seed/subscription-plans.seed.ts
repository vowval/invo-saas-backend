import { DataSource } from 'typeorm';
import { SubscriptionPlan } from '../subscriptions/subscription-plan.entity';

/**
 * Seeds subscription plans for the platform
 * Defines pricing tiers and user limits
 */
export async function seedSubscriptionPlans(
  dataSource: DataSource,
) {
  const planRepo = dataSource.getRepository(SubscriptionPlan);

  const plans = [
    {
      id: 'FREE',
      name: 'Free Plan',
      description: 'Perfect for solo fabric processors getting started',
      maxUsers: 1,
      invoiceLimit: 10,
      billingCycle: 'MONTHLY',
      priceInr: 0,
      durationMonths: null,
      requiresPayment: false,
      active: true,
    },
    {
      id: 'BASIC',
      name: 'Basic Plan',
      description: 'For small textile factories with a small team',
      maxUsers: 5,
      invoiceLimit: 100,
      billingCycle: 'MONTHLY',
      priceInr: 4999,
      durationMonths: 1,
      requiresPayment: true,
      active: true,
    },
    {
      id: 'PRO',
      name: 'Professional Plan',
      description: 'For growing medium-sized textile factories',
      maxUsers: 20,
      invoiceLimit: 500,
      billingCycle: 'MONTHLY',
      priceInr: 14999,
      durationMonths: 1,
      requiresPayment: true,
      active: true,
    },
    {
      id: 'ENTERPRISE',
      name: 'Enterprise Plan',
      description: 'For large-scale textile processing operations',
      maxUsers: 1000,
      invoiceLimit: null,
      billingCycle: 'CUSTOM',
      priceInr: 0,
      durationMonths: null,
      requiresPayment: true,
      active: true,
    },
  ];

  for (const plan of plans) {
    const existing = await planRepo.findOne({
      where: { id: plan.id },
    });

    if (existing) {
      console.log(`✓ Plan already exists: ${plan.name} (${plan.id})`);
      continue;
    }

    const newPlan = planRepo.create(plan);
    await planRepo.save(newPlan);
    console.log(
      `✅ Plan created: ${plan.name} (${plan.id}) - maxUsers: ${plan.maxUsers}, price: ₹${plan.priceInr}`,
    );
  }

  console.log('\n✓ Subscription Plans seeding complete!');
}
