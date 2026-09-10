import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Packing } from './packing.entity';
import { PackingRoll } from './packing-roll.entity';
import { PackingAudit } from './packing-audit.entity';
import { DyeingJob } from '../dyeing-jobs/dyeing-job.entity';
import { User } from '../users/user.entity';
import { PackingService } from './packing.service';
import { PackingController } from './packing.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Packing, PackingRoll, PackingAudit, DyeingJob, User]),
  ],
  controllers: [PackingController],
  providers: [PackingService],
  exports: [PackingService],
})
export class PackingModule {}
