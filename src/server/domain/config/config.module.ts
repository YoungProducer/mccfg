import { Module } from '@nestjs/common';
import { ConfigsService } from './config.service';
import { ConfigsController } from './config.controller';
import { UsersModule } from '../users/users.module';
import { ModsModule } from '../mods/mods.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigEntity } from './entities/config.entity';

@Module({
  imports: [UsersModule, ModsModule, TypeOrmModule.forFeature([ConfigEntity])],
  providers: [ConfigsService],
  controllers: [ConfigsController],
})
export class ConfigsModule {}
