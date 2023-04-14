import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '../config/config.module';
import { DataBaseModule } from '../infrastructure/database/database.module';
import { UsersModule } from '../domain/users/users.module';
import { RouterModule } from '@nestjs/core';
import { MCVersionModule } from 'server/domain/mcversion/mcversion.module';
import { ModsModule } from 'server/domain/mods/mods.module';
import { AuthModule } from 'server/domain/auth/auth.module';
import { TokensModule } from 'server/domain/tokens/tokens.module';

@Module({
  imports: [
    ConfigModule.forRoot({ folder: './configs' }),
    DataBaseModule,
    UsersModule,
    MCVersionModule,
    ModsModule,
    AuthModule,
    TokensModule,
    RouterModule.register([
      {
        path: 'api/v1',
        children: [
          UsersModule,
          MCVersionModule,
          ModsModule,
          AuthModule,
          TokensModule,
        ],
      },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService],
  exports: [ConfigModule],
})
export class AppModule {}
