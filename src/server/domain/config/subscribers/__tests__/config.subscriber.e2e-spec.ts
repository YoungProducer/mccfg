import { NestApplication } from '@nestjs/core';
import { StartedPostgreSqlContainer } from 'testcontainers';
import { ObjectLiteral, Repository } from 'typeorm';
import { ConfigEntity } from '../../entities/config.entity';
import { createTestContainer } from 'server/test-utils/create-test-container';
import { Test } from '@nestjs/testing';
import { ConfigSubscriber } from '../config.subscriber';
import { ConfigModule } from 'server/config/config.module';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { MCVersionEntity } from 'server/domain/mcversion/entities/mc-version.entity';
import { ModVersionEntity } from 'server/domain/mods/entities/mod-version.entity';
import { ModEntity } from 'server/domain/mods/entities/mod.entity';
import { RefreshTokenEntity } from 'server/domain/tokens/entities/refresh-token.entity';
import { ConfirmationTokenEntity } from 'server/domain/users/entities/confirmation-token.entity';
import { UserEntity } from 'server/domain/users/entities/user.entity';
import { resetRepos } from 'server/test-utils/clear-repos';
import { clearTestUploadsDir } from 'server/test-utils/clear-test-uploads-dir';
import { join } from 'node:path';
import { writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { safeMkdir } from 'server/utils/safe-mkdir';

describe('SUBSCRIBER Config', () => {
  jest.setTimeout(180_000);

  let app: NestApplication;
  let container: StartedPostgreSqlContainer;
  let configsRepo: Repository<ConfigEntity>;
  let usersRepo: Repository<UserEntity>;
  let repos: Repository<ObjectLiteral>[];

  beforeAll(async () => {
    const { options, pgContainer } = await createTestContainer();

    container = pgContainer;

    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(),
        TypeOrmModule.forRoot(options),
        TypeOrmModule.forFeature([
          ConfigEntity,
          UserEntity,
          ConfigEntity,
          ModEntity,
          ModVersionEntity,
          MCVersionEntity,
          ConfirmationTokenEntity,
          RefreshTokenEntity,
        ]),
      ],
      providers: [ConfigSubscriber],
    }).compile();

    app = moduleRef.createNestApplication();

    configsRepo = moduleRef.get<Repository<ConfigEntity>>(
      getRepositoryToken(ConfigEntity),
    );

    usersRepo = moduleRef.get<Repository<UserEntity>>(
      getRepositoryToken(UserEntity),
    );

    repos = [configsRepo, usersRepo];

    await app.init();
  });

  afterAll(async () => {
    await resetRepos(repos);
    await app.close();
    await container.stop();
    await clearTestUploadsDir();
  });

  beforeEach(async () => {
    await resetRepos(repos);
    await clearTestUploadsDir();
  });

  it('should delete config file after config entity has been deleted', async () => {
    const userToCreate = usersRepo.create({
      email: 'email',
      username: 'config-username',
      hash: 'hash',
      salt: 'salt',
    });

    const userEntity = await usersRepo.save(userToCreate);

    const fullDir = join(
      process.cwd(),
      'test-uploads',
      userEntity.username,
      'configs',
    );

    await safeMkdir(fullDir);

    const fullPath = join(fullDir, 'file.txt');

    await writeFile(fullPath, 'content');

    expect(existsSync(fullPath)).toBeTruthy();

    const configToCreate = configsRepo.create({
      fileName: 'file.txt',
      version: '1.0',
      initialFileName: 'initial',
      dependencies: [],
      primaryMod: null,
      owner: userEntity,
      fullPath,
    });

    const configEntity = await configsRepo.save(configToCreate);

    const foundConfig = await configsRepo.findOne({
      where: {
        id: configEntity.id,
      },
    });

    await configsRepo.remove(foundConfig);

    expect(existsSync(fullPath)).toBeFalsy();
  });
});
