import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { getTypeOrmOptions } from './helpers/getTypeOrmOptions';
import { DI_CONFIG } from 'server/config/constants';
import { ConfigModule } from 'server/config/config.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getTypeOrmOptions,
      inject: [DI_CONFIG],
    }),
  ],
})
export class DataBaseModule {}
