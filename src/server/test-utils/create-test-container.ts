import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import path from 'path';
import {
  StartedPostgreSqlContainer,
  PostgreSqlContainer,
  Wait,
} from 'testcontainers';

const exposedPort = 5432;
const database = 'mccfg_test';

export interface CreateTestContainerReturn {
  pgContainer: StartedPostgreSqlContainer;
  options: TypeOrmModuleOptions;
}

const getEntitiesPath = (): string => {
  const entitiesNames = '*.entity{.ts,.js}';
  const entitiesPath = path.resolve(__dirname, '../../', '**', entitiesNames);

  return entitiesPath;
};

const getTypeormOptions = (
  container: StartedPostgreSqlContainer,
): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: container.getHost(),
  port: container.getMappedPort(exposedPort),
  username: container.getUsername(),
  password: container.getPassword(),
  database,
  entities: [getEntitiesPath()],
  synchronize: true,
  autoLoadEntities: true,
});

export const createTestContainer =
  async (): Promise<CreateTestContainerReturn> => {
    const pgContainer = await new PostgreSqlContainer()
      .withWaitStrategy(Wait.forHealthCheck())
      .withDatabase(database)
      .withExposedPorts(exposedPort)
      .start();

    const options = getTypeormOptions(pgContainer);

    return { pgContainer, options };
  };
