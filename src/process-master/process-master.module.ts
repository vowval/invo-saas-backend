import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProcessCategory } from './process-category.entity';
import { Process } from './process.entity';
import { ProcessMasterService } from './process-master.service';
import { ProcessMasterController } from './process-master.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ProcessCategory, Process])],
  providers: [ProcessMasterService],
  controllers: [ProcessMasterController],
  exports: [ProcessMasterService],
})
export class ProcessMasterModule {}
