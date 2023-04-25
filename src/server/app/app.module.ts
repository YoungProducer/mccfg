import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '../config/config.module';
import { DataBaseModule } from '../infrastructure/database/database.module';
import { UsersModule } from '../domain/users/users.module';
import { APP_GUARD, RouterModule } from '@nestjs/core';
import { MCVersionModule } from 'server/domain/mcversion/mcversion.module';
import { ModsModule } from 'server/domain/mods/mods.module';
import { AuthModule } from 'server/domain/auth/auth.module';
import { TokensModule } from 'server/domain/tokens/tokens.module';
import { JWTGuard } from 'server/domain/auth/guards/jwt.guard';
import { ConfigsModule } from 'server/domain/config/config.module';

@Module({
  imports: [
    ConfigModule.forRoot({ folder: './configs' }),
    DataBaseModule,
    UsersModule,
    MCVersionModule,
    ModsModule,
    AuthModule,
    TokensModule,
    ConfigsModule,
    RouterModule.register([
      {
        path: 'api/v1',
        children: [
          UsersModule,
          MCVersionModule,
          ModsModule,
          AuthModule,
          TokensModule,
          ConfigsModule,
        ],
      },
    ]),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JWTGuard,
    },
  ],
  exports: [ConfigModule],
})
export class AppModule {}
