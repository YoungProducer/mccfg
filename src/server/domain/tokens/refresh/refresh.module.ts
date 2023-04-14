import { Module } from '@nestjs/common';
import { RefreshService } from './refresh.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'server/domain/users/users.module';
import { RefreshTokenEntity } from '../entities/refresh-token.entity';

@Module({
  imports: [UsersModule, TypeOrmModule.forFeature([RefreshTokenEntity])],
  providers: [RefreshService],
  exports: [RefreshService],
})
export class RefreshModule {}
