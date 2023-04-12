import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UserEntity } from './entities/user.entity';
import { ConfigEntity } from '../config/entities/config.entity';
import { ModEntity } from '../mods/entities/mod.entity';
import { ModVersionEntity } from '../mods/entities/mod-version.entity';
import { MCVersionEntity } from '../mcversion/entities/mc-version.entity';
import { ConfirmationTokenEntity } from './entities/confirmation-token.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      ConfigEntity,
      ModEntity,
      ModVersionEntity,
      MCVersionEntity,
      ConfirmationTokenEntity,
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
