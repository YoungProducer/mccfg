import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ModEntity } from '../entities/mod.entity';
import { ModsService } from '../mods.service';
import { ModVersionEntity } from '../entities/mod-version.entity';
import { MCVersionEntity } from 'server/domain/mcversion/entities/mc-version.entity';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { getCreateQueryBuilderMock } from 'server/mocks/create-query-builder.mock';
import { MCVersionService } from 'server/domain/mcversion/mcversion.service';
import { FindModOptionsInterface } from '../interfaces/find-mod.inteface';
import { modErrorMessages } from '../constants/error-messages';

describe('SERVICE Mods', () => {
  let modsService: ModsService;
  let modsRepository: Repository<ModEntity>;
  let mcVersionsRepository: Repository<MCVersionEntity>;
  let modVersionsRepository: Repository<ModVersionEntity>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        ModsService,
        MCVersionService,
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
      ],
    }).compile();

    modsService = moduleRef.get<ModsService>(ModsService);

    modsRepository = moduleRef.get<Repository<ModEntity>>(
      getRepositoryToken(ModEntity),
    );

    mcVersionsRepository = moduleRef.get<Repository<MCVersionEntity>>(
      getRepositoryToken(MCVersionEntity),
    );

    modVersionsRepository = moduleRef.get<Repository<ModVersionEntity>>(
      getRepositoryToken(ModVersionEntity),
    );

    jest.spyOn(modsRepository, 'create').mockImplementation((e: any) => e);

    jest.spyOn(modsRepository, 'save').mockImplementation((e: any) => e);

    jest
      .spyOn(modVersionsRepository, 'create')
      .mockImplementation((e: any) => e);

    jest.spyOn(modVersionsRepository, 'save').mockImplementation((e: any) => e);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(modsService).toBeDefined();
    expect(modsRepository).toBeDefined();
    expect(mcVersionsRepository).toBeDefined();
  });

  describe('METHOD create', () => {
    it('should return void if there are no errors', async () => {
      jest.spyOn(modsRepository, 'findOne').mockImplementation(() => undefined);

      const res = await modsService.create({ name: 'name' });

      expect(res).toBeUndefined();
    });

    it('should return a conflict error if mod with given name already exist', async () => {
      const name = 'name';

      const entity: ModEntity = {
        id: 1,
        name,
        versions: [],
      };

      jest
        .spyOn(modsRepository, 'findOne')
        .mockImplementation(async () => entity);

      const call = modsService.create({ name });

      expect(call).rejects.toThrow(ConflictException);
      expect(call).rejects.toThrowError(
        modErrorMessages.getModNameExistErr(name),
      );
    });
  });

  describe('METHOD createModVersion', () => {
    it('should throw NotFoundException if mod with given id does not exist', async () => {
      jest.spyOn(modsRepository, 'findOne').mockImplementation(() => undefined);

      jest
        .spyOn(mcVersionsRepository, 'findOne')
        .mockImplementation(async () => {
          return {
            id: 1,
            version: '1.0',
          };
        });

      jest.spyOn(modVersionsRepository, 'findOne').mockResolvedValue(undefined);

      const modId = 1;

      const call = modsService.createModVersion({
        modId,
        version: '1.0',
        compatibleMCVersion: '1',
      });

      expect(call).rejects.toThrow(NotFoundException);
      expect(call).rejects.toThrowError(
        modErrorMessages.getModIdNotExistErr(modId),
      );
    });

    describe(`WHEN typeof compatibleMCVersions is string`, () => {
      it(`should throw NotFoundException if minecraft version doesn't exist`, () => {
        jest
          .spyOn(mcVersionsRepository, 'findOne')
          .mockImplementation(() => undefined);

        jest
          .spyOn(modVersionsRepository, 'findOne')
          .mockResolvedValue(undefined);

        const version = '1';
        const call = modsService.createModVersion({
          modId: 1,
          version,
          compatibleMCVersion: '1',
        });

        expect(call).rejects.toThrow(NotFoundException);
        expect(call).rejects.toThrowError(
          modErrorMessages.getMCVersionNotExistErr(version),
        );
      });
    });

    describe('WHEN typeof compatibleMCVersions is array of strings', () => {
      it(`should throw NotFoundException if at least one of given minecraft versions doesn't exist`, () => {
        const versions = ['1.0', '2.0'];
        const returnedVersions = [
          {
            version: '1.0',
          },
        ];

        jest
          .spyOn(mcVersionsRepository, 'createQueryBuilder')
          .mockImplementation(() =>
            getCreateQueryBuilderMock(returnedVersions),
          );

        jest
          .spyOn(modVersionsRepository, 'findOne')
          .mockResolvedValue(undefined);

        const call = modsService.createModVersion({
          modId: 1,
          version: '1.0',
          compatibleMCVersion: versions,
        });

        const expectedErrorMessage =
          modErrorMessages.getMultipleMCVersionsNotExistErr('2.0');

        expect(call).rejects.toThrow(NotFoundException);
        expect(call).rejects.toThrowError(expectedErrorMessage);
      });

      it(`should return nothing if there are no errors`, async () => {
        const version = '1.0';
        const returnedVersions = [
          {
            version,
          },
        ];

        jest.spyOn(mcVersionsRepository, 'findOne').mockResolvedValue({
          id: 1,
          version: '1.0',
        });

        jest.spyOn(modsRepository, 'findOne').mockResolvedValue({
          id: 1,
          name: '',
          versions: [],
        });

        jest
          .spyOn(modsRepository, 'createQueryBuilder')
          .mockImplementation(() =>
            getCreateQueryBuilderMock(returnedVersions),
          );

        jest
          .spyOn(modVersionsRepository, 'findOne')
          .mockResolvedValue(undefined);

        expect(
          await modsService.createModVersion({
            modId: 1,
            version: '2.0',
            compatibleMCVersion: version,
          }),
        ).toBeUndefined();
      });
    });

    it(`should return nothing if there are no errors`, async () => {
      const versions = ['1.0'];
      const returnedVersions = [
        {
          version: '1.0',
        },
      ];

      jest.spyOn(modsRepository, 'findOne').mockResolvedValue({
        id: 1,
        name: '',
        versions: [],
      });

      jest
        .spyOn(modsRepository, 'createQueryBuilder')
        .mockImplementation(() => getCreateQueryBuilderMock(returnedVersions));

      jest.spyOn(modVersionsRepository, 'findOne').mockResolvedValue(undefined);

      expect(
        await modsService.createModVersion({
          modId: 1,
          version: '1.0',
          compatibleMCVersion: versions,
        }),
      ).toBeUndefined();
    });
  });

  describe('METHOD getAll', () => {
    it('should return an array of mods and do not populate versions if options are not provided', async () => {
      const repoResponse: ModEntity[] = [
        {
          id: 1,
          name: 'name',
          versions: [],
        },
      ];

      const expected: ModEntity[] = [
        {
          id: 1,
          name: 'name',
          versions: [],
        },
      ];

      const findSpy = jest
        .spyOn(modsRepository, 'find')
        .mockResolvedValue(repoResponse);

      const result = await modsService.getAll();

      expect(result).toEqual(expected);
      expect(findSpy).toBeCalledWith({
        relations: undefined,
      });
    });

    it('should return an array of mods and populate versions if such options specified', async () => {
      const repoRes: ModEntity[] = [
        {
          id: 1,
          name: 'name',
          versions: [
            {
              id: 2,
              version: '1.0',
              compatibleMCVersions: [],
              mod: null,
              configs: [],
            },
          ],
        },
      ];

      const findSpy = jest
        .spyOn(modsRepository, 'find')
        .mockResolvedValue(repoRes);

      const options: FindModOptionsInterface = {
        populate: {
          versions: true,
        },
      };

      const result = await modsService.getAll(options);

      expect(result).toEqual(repoRes);
      expect(findSpy).toBeCalledWith({
        relations: options.populate,
      });
    });
  });

  describe('METHOD getAllVersions', () => {
    it('should return an array of mod versions', async () => {
      const versions: ModVersionEntity[] = [
        {
          id: 1,
          version: '1.0',
          mod: null,
          compatibleMCVersions: [],
          configs: [],
        },
      ];

      const modRes: ModEntity = {
        id: 2,
        name: 'name',
        versions,
      };

      const modId = 10;

      const findOneSpy = jest
        .spyOn(modsRepository, 'findOne')
        .mockResolvedValue(modRes);

      const result = await modsService.getAllModVersions(modId);

      expect(result).toEqual(versions);
      expect(findOneSpy).toBeCalledWith({
        where: {
          id: modId,
        },
        relations: {
          versions: true,
        },
      });
    });
  });
});
