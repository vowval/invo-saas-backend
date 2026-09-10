import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Patch,
  Req,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DeliveryService } from './delivery.service';

@Controller('api/delivery')
@UseGuards(JwtAuthGuard)
export class DeliveryController {
  constructor(private readonly deliveryService: DeliveryService) {}

  /**
   * POST /api/delivery
   * Create delivery record (after packing completion)
   */
  @Post()
  async createDelivery(@Body() body: any, @Req() req: any) {
    if (
      !body.jobId ||
      typeof body.deliveryQuantity !== 'number' ||
      typeof body.packageCount !== 'number'
    ) {
      throw new BadRequestException(
        'jobId, deliveryQuantity, and packageCount are required',
      );
    }

    return this.deliveryService.createDelivery({
      jobId: body.jobId,
      deliveryQuantity: body.deliveryQuantity,
      packageCount: body.packageCount,
      deliveryChallan: body.deliveryChallan,
      vehicleNumber: body.vehicleNumber,
      transporter: body.transporter,
      destination: body.destination,
      remarks: body.remarks,
      userId: req.user.id,
      supervisorOverride: body.supervisorOverride,
      overrideReason: body.overrideReason,
    });
  }

  /**
   * PATCH /api/delivery/:deliveryId/start
   * Start delivery dispatch
   */
  @Patch(':deliveryId/start')
  async startDelivery(
    @Param('deliveryId') deliveryId: string,
    @Req() req: any,
  ) {
    return this.deliveryService.startDelivery({
      deliveryId,
      userId: req.user.id,
    });
  }

  /**
   * POST /api/delivery/:deliveryId/package
   * Add package to delivery
   */
  @Post(':deliveryId/package')
  async addPackage(
    @Param('deliveryId') deliveryId: string,
    @Body() body: any,
    @Req() req: any,
  ) {
    if (
      typeof body.packageNumber !== 'number' ||
      typeof body.weight !== 'number'
    ) {
      throw new BadRequestException('packageNumber and weight are required');
    }

    return this.deliveryService.addPackage({
      deliveryId,
      packageNumber: body.packageNumber,
      weight: body.weight,
      rolls: body.rolls,
      remarks: body.remarks,
    });
  }

  /**
   * PATCH /api/delivery/:deliveryId/complete
   * Complete delivery - job status becomes DELIVERED
   * Auto-transitions to READY_FOR_INVOICE if conditions met
   */
  @Patch(':deliveryId/complete')
  async completeDelivery(
    @Param('deliveryId') deliveryId: string,
    @Req() req: any,
  ) {
    const delivery = await this.deliveryService.completeDelivery({
      deliveryId,
      userId: req.user.id,
    });

    // Auto-check and transition to READY_FOR_INVOICE
    await this.deliveryService.checkAndTransitionToReadyForInvoice(
      delivery.job.id,
    );

    return delivery;
  }

  /**
   * GET /api/delivery/:deliveryId
   * Get delivery details
   */
  @Get(':deliveryId')
  async getDelivery(@Param('deliveryId') deliveryId: string) {
    return this.deliveryService.getDelivery(deliveryId);
  }

  /**
   * GET /api/delivery/job/:jobId
   * Get delivery for a job
   */
  @Get('job/:jobId')
  async getDeliveryByJob(@Param('jobId') jobId: string) {
    return this.deliveryService.getDeliveryByJob(jobId);
  }
}
