import path from 'path';

const entitiesNames = '*.entity{.ts,.js}';
const subscribersNames = '*.subscriber{.ts,.js}';

export const entitiesPath = path.resolve(
  __dirname,
  '../../../',
  '**',
  entitiesNames,
);

export const subscribersPath = path.resolve(
  __dirname,
  '../../../',
  '**',
  subscribersNames,
);

const migrationsNames = '*{.ts,.js}';

export const migrationsDir = path.resolve(__dirname, '../../../', 'migrations');

export const migrationsPath = path.resolve(migrationsDir, migrationsNames);
