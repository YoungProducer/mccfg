import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '../config/config.module';
import { DataBaseModule } from '../infrastructure/database/database.module';
import { UsersModule } from '../domain/users/users.module';
import { RouterModule } from '@nestjs/core';
import { MCVersionModule } from 'server/domain/mcversion/mcversion.module';
import { ModsModule } from 'server/domain/mods/mods.module';

@Module({
  imports: [
    ConfigModule.forRoot({ folder: './configs' }),
    DataBaseModule,
    UsersModule,
    MCVersionModule,
    ModsModule,
    RouterModule.register([
      {
        path: 'api/v1',
        module: UsersModule,
      },
      {
        path: 'api/v1',
        module: MCVersionModule,
      },
      {
        path: 'api/v1',
        module: ModsModule,
      },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService],
  exports: [ConfigModule],
})
export class AppModule {}
