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
      name: 'Free',
      description: 'Perfect for solo fabric processors getting started. 1 Admin user only.',
      maxUsers: 1,
      invoiceLimit: 10,
      billingCycle: 'LIFETIME',
      priceInr: 0,
      durationMonths: null,
      requiresPayment: false,
      active: true,
    },
    {
      id: 'MONTHLY',
      name: 'Monthly',
      description: 'For small textile factories. 1 Admin + 1 Staff member.',
      maxUsers: 2,
      invoiceLimit: 100,
      billingCycle: 'MONTHLY',
      priceInr: 4999,
      durationMonths: 1,
      requiresPayment: true,
      active: true,
    },
    {
      id: 'YEARLY',
      name: 'Yearly',
      description: 'For growing textile factories. 1 Admin + 5 Staff members.',
      maxUsers: 6,
      invoiceLimit: 500,
      billingCycle: 'YEARLY',
      priceInr: 49999,
      durationMonths: 12,
      requiresPayment: true,
      active: true,
    },
    {
      id: 'LIFETIME',
      name: 'Lifetime',
      description: 'For large-scale operations. Unlimited users and invoices, one-time payment.',
      maxUsers: 1000,
      invoiceLimit: null,
      billingCycle: 'LIFETIME',
      priceInr: 199999,
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

