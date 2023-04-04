import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '../config/config.module';
import { DataBaseModule } from '../infrastructure/database/database.module';
import { UsersModule } from '../domain/users/users.module';
import { RouterModule } from '@nestjs/core';

@Module({
  imports: [
    ConfigModule.forRoot({ folder: './configs' }),
    DataBaseModule,
    UsersModule,
    RouterModule.register([
      {
        path: 'api/v1',
        module: UsersModule,
      },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService],
  exports: [ConfigModule],
})
export class AppModule {}
