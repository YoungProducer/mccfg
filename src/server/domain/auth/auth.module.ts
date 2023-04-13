import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfirmationTokenEntity } from '../users/entities/confirmation-token.entity';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [UsersModule, TypeOrmModule.forFeature([ConfirmationTokenEntity])],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
