import { ModsService } from 'server/domain/mods/mods.service';
import { ConfigsService } from '../config.service';
import { Repository } from 'typeorm';
import { ConfigEntity } from '../entities/config.entity';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateConfigPayload } from '../interfaces/create-config.interface';
import { UsersService } from 'server/domain/users/users.service';
import { NotFoundException } from '@nestjs/common';
import { configServiceErrorMessages } from '../constants/error-messages';
import { UserEntity } from 'server/domain/users/entities/user.entity';
import _difference from 'lodash/difference';
import { ModVersionEntity } from 'server/domain/mods/entities/mod-version.entity';
import { MCVersionService } from 'server/domain/mcversion/mcversion.service';
import { ModEntity } from 'server/domain/mods/entities/mod.entity';
import { MCVersionEntity } from 'server/domain/mcversion/entities/mc-version.entity';
import { ConfirmationTokenEntity } from 'server/domain/users/entities/confirmation-token.entity';
import { RefreshTokenEntity } from 'server/domain/tokens/entities/refresh-token.entity';
import { FindConfigOptionsInterface } from '../interfaces/find-config.interface';
import { ConfigModule } from 'server/config/config.module';

describe('SERVICE Config', () => {
  let configsService: ConfigsService;
  let modsService: ModsService;
  let usersService: UsersService;
  let configsRepository: Repository<ConfigEntity>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ folder: './configs' })],
      providers: [
        ConfigsService,
        ModsService,
        UsersService,
        MCVersionService,
        {
          provide: getRepositoryToken(ConfigEntity),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(ModEntity),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(ModVersionEntity),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(MCVersionEntity),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(UserEntity),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(ConfirmationTokenEntity),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(RefreshTokenEntity),
          useClass: Repository,
        },
      ],
    }).compile();

    configsService = moduleRef.get<ConfigsService>(ConfigsService);
    modsService = moduleRef.get<ModsService>(ModsService);
    usersService = moduleRef.get<UsersService>(UsersService);

    configsRepository = moduleRef.get<Repository<ConfigEntity>>(
      getRepositoryToken(ConfigEntity),
    );
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(configsService).toBeDefined();
    expect(modsService).toBeDefined();
    expect(usersService).toBeDefined();
  });

  describe('METHOD create', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should return NotFoundException if "ownerId" is invalid', () => {
      const ownerId = 1;

      const payload = <CreateConfigPayload>{
        ownerId,
      };

      jest.spyOn(usersService, 'findOneById').mockResolvedValue(undefined);

      const call = configsService.create(payload);

      expect(call).rejects.toThrow(NotFoundException);
      expect(call).rejects.toThrowError(
        configServiceErrorMessages.userNotFoundErr(ownerId),
      );
    });

    it('should return NotFoundException if "primaryModId" is invalud', () => {
      const primaryModId = 1;

      const payload = <CreateConfigPayload>{
        primaryModId: 1,
      };

      jest.spyOn(usersService, 'findOneById').mockResolvedValue(<UserEntity>{});

      jest.spyOn(modsService, 'findModVersion').mockResolvedValue(undefined);

      const call = configsService.create(payload);

      expect(call).rejects.toThrow(NotFoundException);
      expect(call).rejects.toThrowError(
        configServiceErrorMessages.primaryModNotFoundErr(primaryModId),
      );
    });

    it('should return NotFoundException if at least of "dependeciesIds" is invalid', () => {
      const actualDepId = 1;

      const dependencies = [1, 2, 3, 4];
      const actualDeps = <ModVersionEntity>{
        id: actualDepId,
      };
      const diff = _difference(dependencies, [actualDepId]);

      const payload = <CreateConfigPayload>{
        dependenciesIds: dependencies,
      };

      jest.spyOn(usersService, 'findOneById').mockResolvedValue(<UserEntity>{});

      jest
        .spyOn(modsService, 'findModVersion')
        .mockResolvedValue(<ModVersionEntity>{});

      jest
        .spyOn(modsService, 'findAllModVersionsById')
        .mockResolvedValue([actualDeps]);

      const call = configsService.create(payload);

      expect(call).rejects.toThrow(NotFoundException);
      expect(call).rejects.toThrowError(
        configServiceErrorMessages.dependenciesNotFoundErr(diff.join(', ')),
      );
    });

    it('should create a new config instance', async () => {
      const actualDepId = 1;

      const actualDeps = <ModVersionEntity>{
        id: actualDepId,
      };

      const payload = <CreateConfigPayload>{
        dependenciesIds: [actualDepId],
      };

      const mockUserEntity = <UserEntity>{
        id: 1,
        email: 'email',
        username: 'username',
      };

      const mockModVersionEntity = <ModVersionEntity>{
        id: 1,
        version: '1.0',
      };

      jest.spyOn(usersService, 'findOneById').mockResolvedValue(mockUserEntity);

      jest
        .spyOn(modsService, 'findModVersion')
        .mockResolvedValue(mockModVersionEntity);

      jest
        .spyOn(modsService, 'findAllModVersionsById')
        .mockResolvedValue([actualDeps]);

      jest.spyOn(configsRepository, 'create').mockImplementation((e: any) => e);

      const saveSpy = jest
        .spyOn(configsRepository, 'save')
        .mockImplementationOnce((e: any) => e);

      await configsService.create(payload);

      expect(saveSpy).toBeCalledTimes(1);
    });
  });

  describe('METHOD findOneById', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should return a config', async () => {
      const entity: ConfigEntity = {
        dependencies: [],
        fileName: '',
        id: 1,
        initialFileName: '',
        owner: null,
        primaryMod: null,
        version: '1.0',
      };

      jest.spyOn(configsRepository, 'findOne').mockResolvedValue(entity);

      const res = await configsService.findOneById(1);

      expect(res).toEqual(entity);
    });

    it('should be called with "relations" options if specified', async () => {
      const configId = 1;

      const entity: ConfigEntity = {
        dependencies: [],
        fileName: '',
        id: configId,
        initialFileName: '',
        owner: null,
        primaryMod: null,
        version: '1.0',
      };

      const findOneSpy = jest
        .spyOn(configsRepository, 'findOne')
        .mockResolvedValue(entity);

      const options: FindConfigOptionsInterface = {
        populate: {
          dependencies: true,
          owner: true,
        },
      };

      await configsService.findOneById(configId, options);

      expect(findOneSpy).toBeCalledWith({
        where: {
          id: configId,
        },
        relations: options.populate,
      });
    });
  });

  describe('METHOD getAll', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should return an array of configs as a result', async () => {
      const entity: ConfigEntity = {
        dependencies: [],
        fileName: '',
        id: 1,
        initialFileName: '',
        owner: null,
        primaryMod: null,
        version: '1.0',
      };

      jest.spyOn(configsRepository, 'find').mockResolvedValue([entity]);

      const res = await configsService.getAll();

      expect(res).toEqual([entity]);
    });
  });
});
