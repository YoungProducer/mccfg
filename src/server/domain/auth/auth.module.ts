import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfirmationTokenEntity } from '../users/entities/confirmation-token.entity';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TokensModule } from '../tokens/tokens.module';

@Module({
  imports: [
    UsersModule,
    TokensModule,
    TypeOrmModule.forFeature([ConfirmationTokenEntity]),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
