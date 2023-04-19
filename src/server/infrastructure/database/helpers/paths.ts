import path from 'path';

const entitiesNames = '*.entity{.ts,.js}';

export const entitiesPath = path.resolve(
  __dirname,
  '../../../',
  '**',
  entitiesNames,
);

const migrationsNames = '*{.ts,.js}';

export const migrationsDir = path.resolve(__dirname, '../../../', 'migrations');

export const migrationsPath = path.resolve(migrationsDir, migrationsNames);
