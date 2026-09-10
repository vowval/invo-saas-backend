import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { DyeingJob, DyeingJobStatus, TrackingStatus } from '../dyeing-jobs/dyeing-job.entity';
import { ProcessRoute, ProcessRouteStatus } from '../process-route/process-route.entity';
import { ProcessRouteStep, StepStatus } from '../process-route/process-route-step.entity';
import { ReprocessCycle } from '../reprocessing/reprocess-cycle.entity';
import { Packing } from '../packing/packing.entity';
import { Delivery } from '../delivery/delivery.entity';
import { Invoice } from '../invoices/invoice.entity';

/**
 * ProductionDashboardService
 *
 * Operational production dashboard showing real-time job state.
 * Every number is a direct query from job/process state.
 * No estimates, no cached data, no decorative metrics.
 */
@Injectable()
export class ProductionDashboardService {
  constructor(
    @InjectRepository(DyeingJob)
    private readonly jobRepo: Repository<DyeingJob>,
    @InjectRepository(ProcessRoute)
    private readonly routeRepo: Repository<ProcessRoute>,
    @InjectRepository(ProcessRouteStep)
    private readonly stepRepo: Repository<ProcessRouteStep>,
    @InjectRepository(ReprocessCycle)
    private readonly reprocessCycleRepo: Repository<ReprocessCycle>,
    @InjectRepository(Packing)
    private readonly packingRepo: Repository<Packing>,
    @InjectRepository(Delivery)
    private readonly deliveryRepo: Repository<Delivery>,
    @InjectRepository(Invoice)
    private readonly invoiceRepo: Repository<Invoice>,
  ) {}

  /**
   * GET /dashboard/overview
   * Status card counts: today's job distribution
   */
  async getDashboardOverview(companyId: string) {
    const now = new Date();

    const [
      received,
      inProduction,
      inQc,
      readyForPacking,
      readyForDelivery,
      readyForInvoice,
      invoicePending,
    ] = await Promise.all([
      this.jobRepo.count({
        where: { company: { id: companyId }, status: DyeingJobStatus.RECEIVED },
      }),
      this.jobRepo.count({
        where: { company: { id: companyId }, status: DyeingJobStatus.IN_PROCESS },
      }),
      this.jobRepo.count({
        where: { company: { id: companyId }, trackingStatus: TrackingStatus.QUALITY_CHECK },
      }),
      this.jobRepo.count({
        where: { company: { id: companyId }, trackingStatus: TrackingStatus.PACKING },
      }),
      this.jobRepo.count({
        where: { company: { id: companyId }, trackingStatus: TrackingStatus.DELIVERY },
      }),
      this.jobRepo.count({
        where: { company: { id: companyId }, status: DyeingJobStatus.READY_FOR_INVOICE },
      }),
      this.invoiceRepo.count({
        where: { company: { id: companyId } },
      }),
    ]);

    return {
      timestamp: now.toISOString(),
      todayDate: now.toLocaleDateString(),
      summary: {
        received,
        inProduction,
        inQc,
        readyForPacking,
        readyForDelivery,
        readyForInvoice,
        invoicePending,
      },
    };
  }

  /**
   * GET /dashboard/active-production
   * Jobs currently IN_PROGRESS with current process step
   */
  async getActiveProduction(companyId: string) {
    const jobs = await this.jobRepo
      .createQueryBuilder('job')
      .where('job.company_id = :companyId', { companyId })
      .andWhere('job.status = :status', { status: DyeingJobStatus.IN_PROCESS })
      .orderBy('job.created_at', 'ASC')
      .limit(100)
      .getMany();

    const activeJobs = await Promise.all(
      jobs.map(async (job) => {
        // Get current IN_PROGRESS step
        const currentStep = await this.stepRepo
          .createQueryBuilder('step')
          .leftJoinAndSelect('step.process', 'process')
          .leftJoinAndSelect('step.route', 'route')
          .where('route.job_id = :jobId', { jobId: job.id })
          .andWhere('step.status = :status', { status: StepStatus.IN_PROGRESS })
          .orderBy('step.sequence', 'ASC')
          .getOne();

        const packing = await this.packingRepo.findOne({
          where: { job: { id: job.id } },
          order: { createdAt: 'DESC' },
        });

        const ageMs = new Date().getTime() - job.createdAt.getTime();
        const ageDays = Math.floor(ageMs / (1000 * 60 * 60 * 24));

        return {
          jobNumber: job.jobNo,
          customer: job.customerName,
          currentProcess: currentStep?.process?.name || 'Setup',
          quantity: packing?.finishedQuantity || 0,
          unit: 'kg',
          age: `${ageDays} day${ageDays !== 1 ? 's' : ''}`,
        };
      }),
    );

    return {
      count: activeJobs.length,
      jobs: activeJobs,
    };
  }

  /**
   * GET /dashboard/pipeline
   * Visual pipeline with stage counts
   */
  async getPipeline(companyId: string) {
    const stages = [
      { name: 'RECEIVED', trackingStatus: TrackingStatus.FABRIC_RECEIVED },
      { name: 'INSPECTION', trackingStatus: TrackingStatus.FABRIC_INSPECTION },
      { name: 'PRODUCTION', trackingStatus: null, jobStatus: DyeingJobStatus.IN_PROCESS },
      { name: 'QC', trackingStatus: TrackingStatus.QUALITY_CHECK },
      { name: 'PACKING', trackingStatus: TrackingStatus.PACKING },
      { name: 'DELIVERY', trackingStatus: TrackingStatus.DELIVERY },
      { name: 'READY FOR INVOICE', trackingStatus: TrackingStatus.READY_FOR_INVOICE },
      { name: 'INVOICED', trackingStatus: TrackingStatus.GST_INVOICE },
    ];

    const pipeline = await Promise.all(
      stages.map(async (stage) => {
        let count: number;

        if (stage.jobStatus === DyeingJobStatus.IN_PROCESS) {
          count = await this.jobRepo.count({
            where: { company: { id: companyId }, status: DyeingJobStatus.IN_PROCESS },
          });
        } else if (stage.trackingStatus === TrackingStatus.READY_FOR_INVOICE) {
          count = await this.jobRepo.count({
            where: { company: { id: companyId }, status: DyeingJobStatus.READY_FOR_INVOICE },
          });
        } else {
          count = await this.jobRepo.count({
            where: { company: { id: companyId }, trackingStatus: stage.trackingStatus },
          });
        }

        return {
          stage: stage.name,
          count,
        };
      }),
    );

    return { pipeline };
  }

  /**
   * GET /dashboard/pipeline/:stage/jobs
   * Drill down: see all jobs in a specific stage
   */
  async getJobsByStage(companyId: string, stage: string) {
    let jobs: DyeingJob[];

    const stageMap = {
      RECEIVED: TrackingStatus.FABRIC_RECEIVED,
      INSPECTION: TrackingStatus.FABRIC_INSPECTION,
      PRODUCTION: null,
      QC: TrackingStatus.QUALITY_CHECK,
      PACKING: TrackingStatus.PACKING,
      DELIVERY: TrackingStatus.DELIVERY,
      'READY FOR INVOICE': TrackingStatus.READY_FOR_INVOICE,
      INVOICED: TrackingStatus.GST_INVOICE,
    };

    const trackingStatus = stageMap[stage];

    if (stage === 'PRODUCTION') {
      jobs = await this.jobRepo.find({
        where: { company: { id: companyId }, status: DyeingJobStatus.IN_PROCESS },
        order: { createdAt: 'DESC' },
      });
    } else if (stage === 'READY FOR INVOICE') {
      jobs = await this.jobRepo.find({
        where: { company: { id: companyId }, status: DyeingJobStatus.READY_FOR_INVOICE },
        order: { readyForInvoiceAt: 'DESC' },
      });
    } else {
      jobs = await this.jobRepo.find({
        where: { company: { id: companyId }, trackingStatus },
        order: { createdAt: 'DESC' },
      });
    }

    return {
      stage,
      count: jobs.length,
      jobs: jobs.map((job) => ({
        jobNumber: job.jobNo,
        customer: job.customerName,
        fabric: job.fabricType,
        colour: job.colour,
        createdAt: job.createdAt.toISOString(),
      })),
    };
  }

  /**
   * GET /dashboard/alerts/delayed
   * Jobs exceeding expected completion date
   */
  async getDelayedJobs(companyId: string) {
    const now = new Date();

    const steps = await this.stepRepo
      .createQueryBuilder('step')
      .leftJoinAndSelect('step.route', 'route')
      .leftJoinAndSelect('route.job', 'job')
      .leftJoinAndSelect('step.process', 'process')
      .where('job.company_id = :companyId', { companyId })
      .andWhere('step.status = :status', { status: StepStatus.IN_PROGRESS })
      .andWhere('step.expected_completion_date < :now', { now })
      .orderBy('step.expected_completion_date', 'ASC')
      .getMany();

    const delayed = steps.map((step) => {
      const delayMs = now.getTime() - step.expectedCompletionDate.getTime();
      const delayDays = Math.floor(delayMs / (1000 * 60 * 60 * 24));

      return {
        jobNumber: step.route.job.jobNo,
        customer: step.route.job.customerName,
        currentProcess: step.process?.name || 'Unknown',
        expectedDate: step.expectedCompletionDate.toISOString(),
        daysDelayed: delayDays,
      };
    });

    return {
      count: delayed.length,
      jobs: delayed,
    };
  }

  /**
   * GET /dashboard/alerts/on-hold
   * All routes currently ON_HOLD
   */
  async getJobsOnHold(companyId: string) {
    const routes = await this.routeRepo.find({
      where: { company: { id: companyId }, status: ProcessRouteStatus.ON_HOLD },
      relations: ['job'],
      order: { updatedAt: 'DESC' },
    });

    return {
      count: routes.length,
      jobs: routes.map((route) => ({
        jobNumber: route.job.jobNo,
        customer: route.job.customerName,
        status: route.status,
        holdSince: route.updatedAt.toISOString(),
      })),
    };
  }

  /**
   * GET /dashboard/alerts/reprocess
   * Jobs currently in reprocessing
   */
  async getJobsInReprocess(companyId: string) {
    const cycles = await this.reprocessCycleRepo
      .createQueryBuilder('cycle')
      .leftJoinAndSelect('cycle.reprocessRequest', 'request')
      .leftJoinAndSelect('request.job', 'job')
      .where('job.company_id = :companyId', { companyId })
      .andWhere('cycle.cycle_status IN (:...statuses)', { statuses: ['PENDING', 'IN_PROGRESS'] })
      .orderBy('cycle.createdAt', 'DESC')
      .getMany();

    return {
      count: cycles.length,
      jobs: cycles.map((cycle) => ({
        jobNumber: cycle.reprocessRequest.job.jobNo,
        customer: cycle.reprocessRequest.job.customerName,
        reason: cycle.reprocessRequest.failureReason,
        status: cycle.cycleStatus,
        startedAt: cycle.createdAt.toISOString(),
      })),
    };
  }

  /**
   * GET /dashboard/alerts/waiting-qc
   * Jobs queued for QC
   */
  async getJobsWaitingForQc(companyId: string) {
    const jobs = await this.jobRepo.find({
      where: { company: { id: companyId }, trackingStatus: TrackingStatus.QUALITY_CHECK },
      order: { createdAt: 'ASC' },
    });

    return {
      count: jobs.length,
      jobs: jobs.map((job) => ({
        jobNumber: job.jobNo,
        customer: job.customerName,
        fabric: job.fabricType,
        createdAt: job.createdAt.toISOString(),
      })),
    };
  }

  /**
   * GET /dashboard/alerts/waiting-delivery
   * Jobs ready to ship
   */
  async getJobsWaitingForDelivery(companyId: string) {
    const jobs = await this.jobRepo.find({
      where: { company: { id: companyId }, trackingStatus: TrackingStatus.DELIVERY },
      order: { createdAt: 'ASC' },
    });

    return {
      count: jobs.length,
      jobs: jobs.map((job) => ({
        jobNumber: job.jobNo,
        customer: job.customerName,
        fabric: job.fabricType,
        createdAt: job.createdAt.toISOString(),
      })),
    };
  }

  /**
   * GET /dashboard/alerts/waiting-invoice
   * Jobs ready for invoicing
   */
  async getJobsWaitingForInvoice(companyId: string) {
    const jobs = await this.jobRepo.find({
      where: {
        company: { id: companyId },
        status: DyeingJobStatus.READY_FOR_INVOICE,
        invoicedAt: IsNull(),
      },
      order: { readyForInvoiceAt: 'ASC' },
    });

    return {
      count: jobs.length,
      jobs: jobs.map((job) => {
        const daysPending = job.readyForInvoiceAt
          ? Math.floor(
              (new Date().getTime() - job.readyForInvoiceAt.getTime()) /
                (1000 * 60 * 60 * 24),
            )
          : 0;

        return {
          jobNumber: job.jobNo,
          customer: job.customerName,
          readyAt: job.readyForInvoiceAt?.toISOString(),
          daysPending,
        };
      }),
    };
  }

  /**
   * GET /dashboard/complete
   * Full dashboard: all metrics and alerts
   */
  async getCompleteDashboard(companyId: string) {
    const [
      overview,
      activeProduction,
      pipeline,
      delayed,
      onHold,
      inReprocess,
      waitingQc,
      waitingDelivery,
      waitingInvoice,
    ] = await Promise.all([
      this.getDashboardOverview(companyId),
      this.getActiveProduction(companyId),
      this.getPipeline(companyId),
      this.getDelayedJobs(companyId),
      this.getJobsOnHold(companyId),
      this.getJobsInReprocess(companyId),
      this.getJobsWaitingForQc(companyId),
      this.getJobsWaitingForDelivery(companyId),
      this.getJobsWaitingForInvoice(companyId),
    ]);

    return {
      timestamp: new Date().toISOString(),
      overview: overview.summary,
      activeProduction,
      pipeline: pipeline.pipeline,
      alerts: {
        delayed: delayed.count,
        onHold: onHold.count,
        inReprocess: inReprocess.count,
        waitingQc: waitingQc.count,
        waitingDelivery: waitingDelivery.count,
        waitingInvoice: waitingInvoice.count,
      },
      details: {
        delayed,
        onHold,
        inReprocess,
        waitingQc,
        waitingDelivery,
        waitingInvoice,
      },
    };
  }
}
