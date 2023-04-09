import { Module } from '@nestjs/common';
import { ModsService } from './mods.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ModEntity } from './entities/mod.entity';
import { ModVersionEntity } from './entities/mod-version.entity';
import { MCVersionEntity } from '../mcversion/entities/mc-version.entity';
import { MCVersionModule } from '../mcversion/mcversion.module';
import { ConfigEntity } from '../config/entities/config.entity';
import { UserEntity } from '../users/entities/user.entity';
import { ModsController } from './mods.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ModEntity,
      ModVersionEntity,
      MCVersionEntity,
      ConfigEntity,
      UserEntity,
    ]),
    MCVersionModule,
  ],
  providers: [ModsService],
  controllers: [ModsController],
  exports: [ModsService],
})
export class ModsModule {}
