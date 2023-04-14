import { Module } from '@nestjs/common';
import { RefreshService } from './refresh.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'server/domain/users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RefreshModule, UserEntity])],
  providers: [RefreshService],
  exports: [RefreshService],
})
export class RefreshModule {}
