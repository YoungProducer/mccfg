import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import path from 'path';
import { EnvConfig } from 'server/config/interfaces';

export const getTestDatabaseTypeOrmOptions = (
  config: EnvConfig,
): TypeOrmModuleOptions => {
  const entitiesNames = '*.entity{.ts,.js}';
  const entitiesPath = path.resolve(__dirname, '../../', '**', entitiesNames);

  return {
    type: 'postgres',
    host: config.DB_HOST,
    port: +config.DB_PORT,
    username: config.DB_USERNAME,
    password: config.DB_PASSWORD,
    database: config.DB_NAME,
    entities: [entitiesPath],
    synchronize: true,
    autoLoadEntities: true,
  };
};
