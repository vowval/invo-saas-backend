import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/user.entity';
import { Company } from '../companies/company.entity';
import { Role } from '../auth/role.enum';

/**
 * Seeds a factory admin user for testing/demo purposes
 * 
 * This user has role 'ADMIN' which maps to 'factory-admin' internally
 * Can manage process parameters for their factory
 */
export async function seedFactoryAdmin(
  dataSource: DataSource,
) {
  const factoryAdminEmail = process.env.FACTORY_ADMIN_EMAIL || 'admin@textilefactory.com';
  const factoryAdminPassword = process.env.FACTORY_ADMIN_PASSWORD || 'Factory@12345';
  const factoryAdminName = process.env.FACTORY_ADMIN_NAME || 'Factory Manager';
  const factoryName = process.env.FACTORY_NAME || 'Sample Textile Factory';

  const userRepo = dataSource.getRepository(User);
  const companyRepo = dataSource.getRepository(Company);

  // Check if user already exists
  const existingUser = await userRepo.findOne({
    where: { email: factoryAdminEmail },
  });

  if (existingUser) {
    console.log(
      `✅ Factory Admin user already exists (${factoryAdminEmail}). Skipping seed.`,
    );
    return;
  }

  // Check if company exists
  let company = await companyRepo.findOne({
    where: { name: factoryName },
  });

  // Create company if it doesn't exist
  if (!company) {
    company = companyRepo.create({
      name: factoryName,
      subscriptionPlan: 'FREE',
      billingCycle: 'MONTHLY',
      subscriptionStatus: 'ACTIVE',
      maxUsers: 50,
      invoiceLimit: 1000,
      invoicesUsed: 0,
      subscriptionStartedAt: new Date(),
      subscriptionExpiresAt: null,
      lifetimeSubscription: false,
    });
    await companyRepo.save(company);
    console.log(`🏭 Factory created: ${factoryName} (ID: ${company.id})`);
  } else {
    console.log(`✅ Factory already exists: ${factoryName} (ID: ${company.id})`);
  }

  // Create factory admin user
  const hashedPassword = await bcrypt.hash(factoryAdminPassword, 10);

  const factoryAdmin = userRepo.create({
    name: factoryAdminName,
    email: factoryAdminEmail,
    password: hashedPassword,
    role: Role.ADMIN, // This is 'ADMIN' in enum = 'factory-admin' in code
    company,
  });

  await userRepo.save(factoryAdmin);

  console.log('👨‍💼 Factory Admin created successfully!');
  console.log(`📧 Email: ${factoryAdminEmail}`);
  console.log(`🔐 Password: ${factoryAdminPassword}`);
  console.log(`🏭 Factory: ${factoryName}`);
  console.log(`\n📝 Login at: POST /api/auth/login`);
  console.log(`   Email: ${factoryAdminEmail}`);
  console.log(`   Password: ${factoryAdminPassword}`);
  console.log(`\n🔗 Access Factory Routes:`);
  console.log(`   GET  /api/admin/process-master`);
  console.log(`   GET  /api/admin/process-master/parameters`);
}
