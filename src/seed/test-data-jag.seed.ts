import 'dotenv/config';
import { DataSource } from 'typeorm';
import { User } from '../users/user.entity';
import { Company } from '../companies/company.entity';
import { DyeingJob, DyeingJobStatus, TrackingStatus } from '../dyeing-jobs/dyeing-job.entity';
import { ProcessStage, ProcessStageStatus } from '../dyeing-jobs/process-stage.entity';
import { Product } from '../products/product.entity';
import { Invoice } from '../invoices/invoice.entity';
import { InvoiceItem } from '../invoices/invoice-item.entity';
import { GoodsReceiptNote } from '../dyeing-jobs/grn.entity';

const dataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [
    User,
    Company,
    DyeingJob,
    ProcessStage,
    Product,
    Invoice,
    InvoiceItem,
    GoodsReceiptNote,
  ],
  migrations: ['dist/migrations/*.js'],
  synchronize: false,
});

async function createTestData() {
  try {
    await dataSource.initialize();
    console.log('Connected to database');

    // Find or get the jag@gmail.com user's company
    const userRepo = dataSource.getRepository(User);
    const user = await userRepo.findOne({
      where: { email: 'jag@gmail.com' },
      relations: ['company'],
    });

    if (!user) {
      console.error('❌ User jag@gmail.com not found');
      process.exit(1);
    }

    if (!user.company) {
      console.error('❌ User jag@gmail.com has no company');
      process.exit(1);
    }

    const companyId = user.company.id;
    console.log(`✓ Found company: ${user.company.name} (${companyId})`);

    const jobRepo = dataSource.getRepository(DyeingJob);
    const stageRepo = dataSource.getRepository(ProcessStage);
    const productRepo = dataSource.getRepository(Product);
    const grnRepo = dataSource.getRepository(GoodsReceiptNote);

    // Create or get products
    const products = [];
    for (let i = 1; i <= 3; i++) {
      let product = await productRepo.findOne({
        where: {
          name: `Test Cotton Fabric ${i}`,
          company: { id: companyId },
        },
      });

      if (!product) {
        product = productRepo.create({
          name: `Test Cotton Fabric ${i}`,
          description: `High quality cotton fabric for testing - Type ${i}`,
          unit: 'METER',
          rate: 150 + i * 50,
          active: true,
          company: { id: companyId } as any,
        });
        product = await productRepo.save(product);
        console.log(`✓ Created product: ${product.name}`);
      } else {
        console.log(`✓ Product already exists: ${product.name}`);
      }
      products.push(product);
    }

    // Create 3 dyeing jobs with all stages
    const jobNos = ['DJ-TEST-001', 'DJ-TEST-002', 'DJ-TEST-003'];
    const jobDetails = [
      {
        jobNo: 'DJ-TEST-001',
        customerName: 'ABC Garments Pvt Ltd',
        fabricType: 'Cotton Jersey',
        colour: 'Navy Blue',
        shadeNo: 'NB-2024-001',
        unit: 'METER',
        quantityReceived: 500.5,
        receivedDate: new Date(2026, 8, 1), // Sept 1
      },
      {
        jobNo: 'DJ-TEST-002',
        customerName: 'XYZ Fashion House',
        fabricType: 'Cotton Twill',
        colour: 'Wine Red',
        shadeNo: 'WR-2024-045',
        unit: 'METER',
        quantityReceived: 750.25,
        receivedDate: new Date(2026, 8, 5), // Sept 5
      },
      {
        jobNo: 'DJ-TEST-003',
        customerName: 'Premium Textiles Ltd',
        fabricType: 'Cotton Poplin',
        colour: 'Forest Green',
        shadeNo: 'FG-2024-089',
        unit: 'METER',
        quantityReceived: 1000.0,
        receivedDate: new Date(2026, 8, 8), // Sept 8
      },
    ];

    const stages = [
      {
        name: 'Fabric Inspection',
        status: ProcessStageStatus.COMPLETED,
        description: 'Initial fabric quality inspection',
        completedDate: new Date(2026, 8, 2),
      },
      {
        name: 'Pre-treatment & Washing',
        status: ProcessStageStatus.COMPLETED,
        description: 'Pre-treatment and initial wash process',
        completedDate: new Date(2026, 8, 4),
      },
      {
        name: 'Dyeing Process',
        status: ProcessStageStatus.IN_PROGRESS,
        description: 'Main dyeing in the vat',
        completedDate: null,
      },
      {
        name: 'Post-dyeing Washing',
        status: ProcessStageStatus.PENDING,
        description: 'Washing after dyeing',
        completedDate: null,
      },
      {
        name: 'Final Quality Check',
        status: ProcessStageStatus.PENDING,
        description: 'Final QC inspection',
        completedDate: null,
      },
    ];

    for (let i = 0; i < jobDetails.length; i++) {
      const jobDetail = jobDetails[i];

      // Check if job already exists
      let job = await jobRepo.findOne({
        where: {
          jobNo: jobDetail.jobNo,
          company: { id: companyId },
        },
        relations: ['company'],
      });

      if (job) {
        console.log(`✓ Job already exists: ${job.jobNo}`);
      } else {
        job = jobRepo.create({
          ...jobDetail,
          status: DyeingJobStatus.IN_PROCESS,
          trackingStatus: TrackingStatus.IN_DYEING,
          quantityDelivered: 0,
          customerContact: '9876543210',
          partyDcNo: `DC-2024-${String(i + 1).padStart(3, '0')}`,
          expectedDeliveryDate: new Date(2026, 8, 25),
          processNotes: `Test job for ${jobDetail.customerName}. All stages in progress.`,
          company: { id: companyId } as any,
        });
        job = await jobRepo.save(job);
        console.log(`✓ Created dyeing job: ${job.jobNo}`);
      }

      // Create GRN for the job
      let grn = await grnRepo.findOne({
        where: {
          dyeingJob: { id: job.id },
        },
      });

      if (!grn) {
        grn = grnRepo.create({
          vehicleNo: `VEH-${String(i + 1).padStart(3, '0')}`,
          lotNumber: `LOT-${String(i + 1).padStart(3, '0')}`,
          rollCount: 5 + i,
          weight: (500 + i * 250),
          inspectionNotes: `Good quality fabrics received. All rolls checked.`,
          inspectedBy: user.name,
          dyeingJob: job,
          inspectionDate: new Date(),
        });
        grn = await grnRepo.save(grn);
        console.log(`✓ Created GRN for job: ${job.jobNo}`);
      }

      // Create process stages for each job
      const existingStages = await stageRepo.find({
        where: {
          dyeingJob: { id: job.id },
        },
      });

      if (existingStages.length === 0) {
        for (let s = 0; s < stages.length; s++) {
          const stageData = stages[s];
          const stage = stageRepo.create({
            ...stageData,
            sequenceNumber: s + 1,
            estimatedDuration: 1 + s,
            actualDuration: s < 2 ? 1 + s : null,
            startedAt: new Date(2026, 8, 2 + s),
            completedAt: stageData.completedDate,
            remarks: `${stageData.description} - Processing for ${jobDetail.customerName}`,
            dyeingJob: job,
          });
          await stageRepo.save(stage);
          console.log(`  ✓ Created stage: ${stageData.name} (${stageData.status})`);
        }
        console.log(`✓ All 5 process stages created for job: ${job.jobNo}\n`);
      } else {
        console.log(`✓ Job ${job.jobNo} already has ${existingStages.length} stages\n`);
      }
    }

    console.log('\n✅ Test data creation complete!');
    console.log('\nSummary:');
    console.log('- Created/Verified 3 dyeing jobs');
    console.log('- Each job has 5 process stages (Inspection, Pre-treatment, Dyeing, Post-wash, QC)');
    console.log('- Jobs include GRN, customer details, and tracking status');
    console.log('- Job statuses range from completed to in-progress to pending');

    process.exit(0);
  } catch (err) {
    console.error('❌ Error creating test data:', err);
    process.exit(1);
  }
}

createTestData();
