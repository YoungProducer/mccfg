import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { JWTModule } from './jwt/jwt.module';
import { RefreshModule } from './refresh/refresh.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefreshTokenEntity } from './entities/refresh-token.entity';
import { TokensController } from './tokens.controller';
import { TokensService } from './tokens.service';

@Module({
  imports: [
    UsersModule,
    JWTModule,
    RefreshModule,
    TypeOrmModule.forFeature([RefreshTokenEntity]),
  ],
  controllers: [TokensController],
  providers: [TokensService],
  exports: [TokensService, JWTModule, RefreshModule],
})
export class TokensModule {}
