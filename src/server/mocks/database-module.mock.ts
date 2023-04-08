import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from 'server/config/config.module';
import { getTestDatabaseTypeOrmOptions } from './test-database';
import { DI_CONFIG } from 'server/config/constants';

@Module({
  imports: [
    ConfigModule.forRoot({ folder: './configs' }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getTestDatabaseTypeOrmOptions,
      inject: [DI_CONFIG],
    }),
  ],
})
export class DataBaseMockModule {}
