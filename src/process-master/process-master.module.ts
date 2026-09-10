import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProcessCategory } from './entities/process-category.entity';
import { Process } from './entities/process.entity';
import { ProcessParameter } from './entities/process-parameter.entity';
import { ProcessMasterService } from './process-master.service';
import { ProcessMasterController } from './process-master.controller';
import { ProcessParameterService } from './process-parameter.service';
import { ProcessParameterController } from './process-parameter.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ProcessCategory, Process, ProcessParameter])],
  providers: [ProcessMasterService, ProcessParameterService],
  controllers: [ProcessMasterController, ProcessParameterController],
  exports: [ProcessMasterService, ProcessParameterService],
})
export class ProcessMasterModule {}
