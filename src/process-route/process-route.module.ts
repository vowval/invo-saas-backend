import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProcessRoute } from './process-route.entity';
import { ProcessRouteStep } from './process-route-step.entity';
import { ProcessRouteService } from './process-route.service';
import { ProcessRouteController } from './process-route.controller';
import { DyeingJob } from '../dyeing-jobs/dyeing-job.entity';
import { Process } from '../process-master/entities/process.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProcessRoute, ProcessRouteStep, DyeingJob, Process])],
  providers: [ProcessRouteService],
  controllers: [ProcessRouteController],
  exports: [ProcessRouteService],
})
export class ProcessRouteModule {}
