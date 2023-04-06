import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MCVersionService } from './mcversion.service';
import { MCVersionController } from './mcversion.controller';
import { MCVersionEntity } from './entities/mc-version.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MCVersionEntity])],
  controllers: [MCVersionController],
  providers: [MCVersionService],
  exports: [MCVersionService],
})
export class MCVersionModule {}
