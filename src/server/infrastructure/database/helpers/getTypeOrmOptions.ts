import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { EnvConfig } from 'server/config/interfaces';
import { DataSource } from 'typeorm';

import { entitiesPath, migrationsPath } from './paths';

export const getTypeOrmOptions = (config: EnvConfig): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: config.DB_HOST,
  port: +config.DB_EXTERNAL_PORT,
  username: config.DB_USERNAME,
  password: config.DB_PASSWORD,
  database: config.DB_NAME,
  entities: [entitiesPath],
  migrations: [migrationsPath],
  migrationsTableName: 'migrations',
  synchronize: false,
});

export const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: +process.env.DB_EXTERNAL_PORT,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [entitiesPath],
  migrations: [migrationsPath],
  migrationsTableName: 'migrations',
  synchronize: false,
});
