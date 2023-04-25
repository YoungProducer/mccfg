import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { EnvConfig } from 'server/config/interfaces';

import { entitiesPath, migrationsPath, subscribersPath } from './paths';

export const getTypeOrmOptions = (config: EnvConfig): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: config.DB_HOST,
  port: +config.DB_EXTERNAL_PORT,
  username: config.DB_USERNAME,
  password: config.DB_PASSWORD,
  database: config.DB_NAME,
  entities: [entitiesPath],
  migrations: [migrationsPath],
  subscribers: [subscribersPath],
  migrationsTableName: 'migrations',
  synchronize: false,
});
