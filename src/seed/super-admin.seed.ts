import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../users/user.entity';

export async function seedSuperAdmin(
  dataSource: DataSource,
) {
  const email = process.env.SUPER_ADMIN_EMAIL;
  const password = process.env.SUPER_ADMIN_PASSWORD;
  const name = process.env.SUPER_ADMIN_NAME || 'Platform Super Admin';
  if (!email || !password) {
    throw new Error('SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD must be set before seeding');
  }
  const userRepo = dataSource.getRepository(User);

  const existing = await userRepo.findOne({
    where: { email },
  });

  if (existing) {
    console.log(
      '✅ Super Admin already exists. Skipping seed.',
    );
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const superAdmin = userRepo.create({
    name,
    email,
    password: hashedPassword,
    role: UserRole.SUPER_ADMIN,
    company: null, // 👈 Super admin is platform-level
  });

  await userRepo.save(superAdmin);

  console.log('🚀 Super Admin created successfully!');
  console.log(`📧 Email: ${email}`);
}
