import 'dotenv/config';
import { seedSubscriptionPlans } from './subscription-plans.seed';
import { seedSuperAdmin } from './super-admin.seed';
import { seedFactoryAdmin } from './factory-admin.seed';
import { seedProcessMaster } from './process-master.seed';
import { seedProcessParameters } from './process-parameters.seed';
import { seedTestData } from './test-data.seed';
import { AppDataSource } from '../data-source';

async function run() {
  try {
    await AppDataSource.initialize();
    console.log('Running seeds...\n');
    
    await seedSubscriptionPlans(AppDataSource);
    console.log('');
    
    await seedProcessMaster(AppDataSource);
    console.log('');
    
    await seedProcessParameters(AppDataSource);
    console.log('');
    
    await seedSuperAdmin(AppDataSource);
    console.log('');
    
    await seedFactoryAdmin(AppDataSource);
    console.log('');
    
    await seedTestData(AppDataSource);
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed', err);
    process.exit(1);
  }
}

run();


