import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UserEntity } from './entities/user.entity';
import { ConfigEntity } from '../config/entities/config.entity';
import { ModEntity } from '../mods/entities/mod.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, ConfigEntity, ModEntity])],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
