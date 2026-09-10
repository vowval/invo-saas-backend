import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../users/user.entity';
import { Company } from '../companies/company.entity';
import { Product } from '../products/product.entity';
import { DyeingJob, DyeingJobStatus, TrackingStatus } from '../dyeing-jobs/dyeing-job.entity';
import { Invoice } from '../invoices/invoice.entity';
import { InvoiceItem } from '../invoices/invoice-item.entity';
import { ProcessStage, ProcessStageStatus } from '../dyeing-jobs/process-stage.entity';

/**
 * Seeds test data including:
 * - Test Admin User
 * - Test Regular User (under admin)
 * - 3 Dyeing Jobs with different stages
 * - Related Products, Invoices, and Process Stages
 */
export async function seedTestData(dataSource: DataSource) {
  const testAdminEmail = 'admin.test@textilefactory.com';
  const testAdminPassword = 'Admin@Test123';
  const testUserEmail = 'user.test@textilefactory.com';
  const testUserPassword = 'User@Test123';
  const companyName = 'Test Textile Factory';

  const userRepo = dataSource.getRepository(User);
  const companyRepo = dataSource.getRepository(Company);
  const productRepo = dataSource.getRepository(Product);
  const dyeingJobRepo = dataSource.getRepository(DyeingJob);
  const invoiceRepo = dataSource.getRepository(Invoice);
  const invoiceItemRepo = dataSource.getRepository(InvoiceItem);
  const processStageRepo = dataSource.getRepository(ProcessStage);

  console.log('🌱 Seeding test data...');

  // 1. Check if company exists
  let company = await companyRepo.findOne({
    where: { name: companyName },
  });

  if (!company) {
    company = companyRepo.create({
      name: companyName,
      gstin: '27AAFCT5055K1Z0',
      subscriptionPlan: 'STANDARD',
      billingCycle: 'MONTHLY',
      subscriptionStatus: 'ACTIVE',
      maxUsers: 100,
      invoiceLimit: 5000,
      invoicesUsed: 0,
      subscriptionStartedAt: new Date(),
      subscriptionExpiresAt: null,
      lifetimeSubscription: false,
      invoicePrefix: 'TEST',
      invoiceNextNumber: 1001,
    });
    await companyRepo.save(company);
    console.log(`✅ Test Company created: ${companyName}`);
  } else {
    console.log(`✅ Test Company already exists: ${companyName}`);
  }

  // 2. Create Test Admin User
  let testAdmin = await userRepo.findOne({
    where: { email: testAdminEmail },
  });

  if (!testAdmin) {
    const hashedPassword = await bcrypt.hash(testAdminPassword, 10);
    testAdmin = userRepo.create({
      name: 'Test Admin',
      email: testAdminEmail,
      password: hashedPassword,
      role: UserRole.ADMIN,
      company,
    });
    await userRepo.save(testAdmin);
    console.log(`✅ Test Admin created: ${testAdminEmail}`);
    console.log(`   Password: ${testAdminPassword}`);
  } else {
    console.log(`✅ Test Admin already exists: ${testAdminEmail}`);
  }

  // 3. Create Test User (under admin)
  let testUser = await userRepo.findOne({
    where: { email: testUserEmail },
  });

  if (!testUser) {
    const hashedPassword = await bcrypt.hash(testUserPassword, 10);
    testUser = userRepo.create({
      name: 'Test User',
      email: testUserEmail,
      password: hashedPassword,
      role: UserRole.STAFF,
      company,
    });
    await userRepo.save(testUser);
    console.log(`✅ Test User created: ${testUserEmail}`);
    console.log(`   Password: ${testUserPassword}`);
  } else {
    console.log(`✅ Test User already exists: ${testUserEmail}`);
  }

  // 4. Create Test Products
  const productNames = [
    { name: 'Cotton Shirting', description: 'Premium cotton fabric for shirts', unit: 'meter', rate: 150 },
    { name: 'Polyester Suiting', description: 'Polyester blend for suits', unit: 'meter', rate: 200 },
    { name: 'Linen Blend', description: 'Linen and cotton blend', unit: 'meter', rate: 180 },
  ];

  const products = [];
  for (const productData of productNames) {
    let product = await productRepo.findOne({
      where: { name: productData.name },
    });

    if (!product) {
      product = productRepo.create({
        name: productData.name,
        description: productData.description,
        unit: productData.unit,
        rate: productData.rate,
        active: true,
        company,
      });
      await productRepo.save(product);
      console.log(`✅ Product created: ${productData.name}`);
    }
    products.push(product);
  }

  // 5. Create 3 Test Dyeing Jobs with different stages
  const dyeingJobsData = [
    {
      jobNo: 'DJ-TEST-001',
      customerName: 'Fashion Express Ltd',
      fabricType: 'Cotton',
      colour: 'Navy Blue',
      shadeNo: 'NB-2024',
      unit: 'meter',
      quantityReceived: 1000,
      quantityDelivered: 0,
      status: DyeingJobStatus.RECEIVED,
      trackingStatus: TrackingStatus.FABRIC_RECEIVED,
      receivedDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
    },
    {
      jobNo: 'DJ-TEST-002',
      customerName: 'Premier Textiles',
      fabricType: 'Polyester',
      colour: 'Black',
      shadeNo: 'BK-2024',
      unit: 'meter',
      quantityReceived: 2000,
      quantityDelivered: 0,
      status: DyeingJobStatus.IN_PROCESS,
      trackingStatus: TrackingStatus.DYEING,
      receivedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    },
    {
      jobNo: 'DJ-TEST-003',
      customerName: 'Global Apparel Co',
      fabricType: 'Linen Blend',
      colour: 'White',
      shadeNo: 'WH-2024',
      unit: 'meter',
      quantityReceived: 1500,
      quantityDelivered: 1500,
      status: DyeingJobStatus.READY_FOR_DELIVERY,
      trackingStatus: TrackingStatus.READY_FOR_DELIVERY,
      receivedDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
      readyForInvoiceAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    },
  ];

  const dyeingJobs = [];
  for (const jobData of dyeingJobsData) {
    let dyeingJob = await dyeingJobRepo.findOne({
      where: { jobNo: jobData.jobNo },
    });

    if (!dyeingJob) {
      dyeingJob = dyeingJobRepo.create({
        ...jobData,
        company,
      });
      await dyeingJobRepo.save(dyeingJob);
      console.log(`✅ Dyeing Job created: ${jobData.jobNo} (${jobData.status})`);
    }
    dyeingJobs.push(dyeingJob);
  }

  // 6. Create Process Stages for each Dyeing Job
  const stagesData = [
    // For Job 1 (FABRIC_RECEIVED)
    [
      {
        stageName: 'Fabric Inspection',
        sequence: 1,
        status: ProcessStageStatus.COMPLETED,
        inputQty: 1000,
        outputQty: 1000,
      },
    ],
    // For Job 2 (DYEING)
    [
      {
        stageName: 'Fabric Inspection',
        sequence: 1,
        status: ProcessStageStatus.COMPLETED,
        inputQty: 2000,
        outputQty: 2000,
      },
      {
        stageName: 'Dyeing',
        sequence: 2,
        status: ProcessStageStatus.IN_PROGRESS,
        inputQty: 2000,
        outputQty: 1950,
      },
    ],
    // For Job 3 (READY_FOR_DELIVERY)
    [
      {
        stageName: 'Fabric Inspection',
        sequence: 1,
        status: ProcessStageStatus.COMPLETED,
        inputQty: 1500,
        outputQty: 1500,
      },
      {
        stageName: 'Dyeing',
        sequence: 2,
        status: ProcessStageStatus.COMPLETED,
        inputQty: 1500,
        outputQty: 1500,
      },
      {
        stageName: 'Finishing',
        sequence: 3,
        status: ProcessStageStatus.COMPLETED,
        inputQty: 1500,
        outputQty: 1500,
      },
      {
        stageName: 'Quality Check',
        sequence: 4,
        status: ProcessStageStatus.COMPLETED,
        inputQty: 1500,
        outputQty: 1500,
      },
    ],
  ];

  for (let i = 0; i < dyeingJobs.length; i++) {
    const dyeingJob = dyeingJobs[i];
    const stages = stagesData[i];

    for (const stageData of stages) {
      const existingStage = await processStageRepo.findOne({
        where: {
          dyeingJob: { id: dyeingJob.id },
          stageName: stageData.stageName,
        },
      });

      if (!existingStage) {
        const processStage = processStageRepo.create({
          ...stageData,
          dyeingJob,
        });
        await processStageRepo.save(processStage);
      }
    }
    console.log(`✅ Process stages created for: ${dyeingJob.jobNo}`);
  }

  // 7. Create Invoices for completed jobs
  let invoice = await invoiceRepo.findOne({
    where: { invoiceNo: 'TEST-INV-001' },
  });

  if (!invoice) {
    const lastDyeingJob = dyeingJobs[2]; // The completed job
    invoice = invoiceRepo.create({
      invoiceNo: 'TEST-INV-001',
      buyerName: 'Fashion Express Ltd',
      buyerAddress: '123 Fashion Street, Mumbai, Maharashtra 400001',
      buyerGstin: '27AAFCU5055K1Z0',
      invoiceDate: new Date(),
      totalAmount: 225000,
      gstRate: 5,
      supplyType: 'INTRA_STATE',
      placeOfSupply: 'MAHARASHTRA',
      cgstAmount: 5625,
      sgstAmount: 5625,
      grandTotal: 236250,
      company,
      job: lastDyeingJob,
    });
    await invoiceRepo.save(invoice);
    console.log(`✅ Invoice created: TEST-INV-001`);

    // Create Invoice Items
    const invoiceItem = invoiceItemRepo.create({
      partyDcNo: 'DC-001',
      partyDcDate: new Date(),
      deliveryDcNo: 'DDC-001',
      colour: 'White',
      fabricWidth: '58 inches',
      quantity: 1500,
      rate: 150,
      amount: 225000,
      invoice,
      product: products[0],
      dyeingJob: lastDyeingJob,
    });
    await invoiceItemRepo.save(invoiceItem);
    console.log(`✅ Invoice Item created for: TEST-INV-001`);
  } else {
    console.log(`✅ Invoice already exists: TEST-INV-001`);
  }

  console.log('\n✨ Test data seeding completed successfully!');
  console.log('\n📋 Test Accounts:');
  console.log(`   Admin:  ${testAdminEmail} / ${testAdminPassword}`);
  console.log(`   User:   ${testUserEmail} / ${testUserPassword}`);
  console.log('\n📊 Test Data:');
  console.log(`   - 3 Dyeing Jobs (DJ-TEST-001, DJ-TEST-002, DJ-TEST-003)`);
  console.log(`   - 3 Products (Cotton, Polyester, Linen)`);
  console.log(`   - 1 Invoice (TEST-INV-001) with items`);
  console.log(`   - Multiple Process Stages for each job`);
}
