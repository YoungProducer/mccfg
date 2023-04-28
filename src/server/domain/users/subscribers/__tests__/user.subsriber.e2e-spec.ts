import { NestApplication } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { StartedPostgreSqlContainer } from 'testcontainers';
import { UserSubscriber } from '../user.subscriber';
import { ConfigModule } from 'server/config/config.module';
import { createTestContainer } from 'server/test-utils/create-test-container';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { UserEntity } from '../../entities/user.entity';
import { ConfigEntity } from 'server/domain/config/entities/config.entity';
import { RefreshTokenEntity } from 'server/domain/tokens/entities/refresh-token.entity';
import { MCVersionEntity } from 'server/domain/mcversion/entities/mc-version.entity';
import { ModVersionEntity } from 'server/domain/mods/entities/mod-version.entity';
import { ModEntity } from 'server/domain/mods/entities/mod.entity';
import { ConfirmationTokenEntity } from '../../entities/confirmation-token.entity';
import { Repository } from 'typeorm';
import { resetRepos } from 'server/test-utils/clear-repos';
import { join } from 'path';
import { existsSync } from 'fs';
import { clearTestUploadsDir } from 'server/test-utils/clear-test-uploads-dir';

describe('SUBSCRIBER User', () => {
  jest.setTimeout(180_000);

  let app: NestApplication;
  let container: StartedPostgreSqlContainer;
  let usersRepo: Repository<UserEntity>;

  beforeAll(async () => {
    const { pgContainer, options } = await createTestContainer();

    container = pgContainer;

    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ folder: './configs' }),
        TypeOrmModule.forRoot(options),
        TypeOrmModule.forFeature([
          UserEntity,
          ConfigEntity,
          ModEntity,
          ModVersionEntity,
          MCVersionEntity,
          ConfirmationTokenEntity,
          RefreshTokenEntity,
        ]),
      ],
      providers: [UserSubscriber],
    }).compile();

    app = moduleRef.createNestApplication();

    usersRepo = moduleRef.get<Repository<UserEntity>>(
      getRepositoryToken(UserEntity),
    );

    await app.init();
  });

  afterAll(async () => {
    await resetRepos([usersRepo]);
    await app.close();
    await container.stop();

    await clearTestUploadsDir();
  });

  beforeEach(async () => {
    await resetRepos([usersRepo]);

    await clearTestUploadsDir();
  });

  it('should create a new folder when user created', async () => {
    const userToCreate = usersRepo.create({
      email: 'email',
      username: 'test-user',
      hash: 'hash',
      salt: 'salt',
    });

    await usersRepo.save(userToCreate);

    const folder = join(
      process.cwd(),
      'test-uploads',
      userToCreate.username,
      'configs',
    );

    expect(existsSync(folder)).toBeTruthy();
  });

  it('should delete a user folder when user deleted', async () => {
    const userToCreate = usersRepo.create({
      email: 'email',
      username: 'test-user',
      hash: 'hash',
      salt: 'salt',
    });

    const userEntity = await usersRepo.save(userToCreate);

    await usersRepo.remove(userEntity);

    const folder = join(process.cwd(), 'test-uploads', userToCreate.username);

    expect(existsSync(folder)).toBeFalsy();
  });
});
