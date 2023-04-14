import { Module } from '@nestjs/common';
import { RefreshService } from './refresh.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'server/domain/users/users.module';

@Module({
  imports: [UsersModule, TypeOrmModule.forFeature([RefreshModule])],
  providers: [RefreshService],
  exports: [RefreshService],
})
export class RefreshModule {}
