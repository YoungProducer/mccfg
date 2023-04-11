import { Test } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ModsController } from '../mods.controller';
import { ModsService } from '../mods.service';
import { ModEntity } from '../entities/mod.entity';
import { ModVersionEntity } from '../entities/mod-version.entity';
import { MCVersionEntity } from 'server/domain/mcversion/entities/mc-version.entity';
import { CreateModDto } from '../dto/create-mod.dto';
import { CreateModVersionDto } from '../dto/create-mod-version.dto';
import { MCVersionService } from 'server/domain/mcversion/mcversion.service';
import { ModDto } from '../dto/mod.dto';
import {
  GetAllModVersionsResponseDto,
  GetModVersionResponseDto,
} from '../dto/mod-version.dto';

describe('CONTROLLER Mods', () => {
  let modsController: ModsController;
  let modsService: ModsService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [ModsController],
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

    modsController = moduleRef.get<ModsController>(ModsController);

    modsService = moduleRef.get<ModsService>(ModsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(modsController).toBeDefined();
    expect(modsService).toBeDefined();
  });

  describe('API createMod', () => {
    it('should return nothing if there are no errors', async () => {
      const createDto: CreateModDto = {
        name: 'name',
      };

      const createSpy = jest
        .spyOn(modsService, 'create')
        .mockResolvedValue(undefined);

      expect(await modsController.createMod(createDto)).toBeUndefined();
      expect(createSpy).toBeCalledTimes(1);
    });

    it('should throw an error if service method throws it', () => {
      const createDto: CreateModDto = {
        name: 'name',
      };

      const createSpy = jest
        .spyOn(modsService, 'create')
        .mockRejectedValue(new ConflictException('error'));

      const call = modsController.createMod(createDto);

      expect(call).rejects.toThrow(ConflictException);
      expect(call).rejects.toThrowError('error');
      expect(createSpy).toBeCalledTimes(1);
    });
  });

  describe('API createModVersion', () => {
    it('should return nothing if there are no errors', async () => {
      const createDto: CreateModVersionDto = {
        version: '1.0',
        compatibleMCVersions: ['1.0'],
      };

      const modId = 1;

      const createSpy = jest
        .spyOn(modsService, 'createModVersion')
        .mockResolvedValue(undefined);

      expect(
        await modsController.createModVersion(createDto, modId),
      ).toBeUndefined();
      expect(createSpy).toBeCalledTimes(1);
    });

    it('should throw an error if service method throws it', () => {
      const createDto: CreateModVersionDto = {
        version: '1.0',
        compatibleMCVersions: '1.0',
      };

      const createSpy = jest
        .spyOn(modsService, 'createModVersion')
        .mockRejectedValue(new ConflictException('error'));

      const call = modsController.createModVersion(createDto, 1);

      expect(call).rejects.toThrow(ConflictException);
      expect(call).rejects.toThrowError('error');
      expect(createSpy).toBeCalledTimes(1);
    });
  });

  describe('API getAllMods', () => {
    it('should return a list of mods without versions populated if "versions" is not provided', async () => {
      const expected: ModEntity[] = [
        {
          id: 1,
          name: 'name',
          versions: [],
        },
      ];

      const findSpy = jest
        .spyOn(modsService, 'getAll')
        .mockResolvedValue(expected);

      const result = await modsController.getAllMods();

      expect(result).toEqual(expected);
      expect(findSpy).toBeCalledWith({
        populate: {
          versions: false,
        },
      });
    });

    it('should return a list of mods with versions populated if "versions" set to true', async () => {
      const repoReturn: ModEntity = {
        id: 1,
        name: 'name',
        versions: [
          {
            id: 2,
            version: '1.0',
            compatibleMCVersions: [],
            configs: [],
            mod: null,
          },
        ],
      };

      const expected: ModDto = {
        ...repoReturn,
        versions: [
          {
            id: 2,
            version: '1.0',
            compatibleMCVersions: [],
          },
        ],
      };

      const findSpy = jest
        .spyOn(modsService, 'getAll')
        .mockResolvedValue([repoReturn]);

      const result = await modsController.getAllMods(true);

      expect(result).toEqual([expected]);
      expect(findSpy).toBeCalledWith({
        populate: {
          versions: true,
        },
      });
    });
  });

  describe('API getMod', () => {
    it('should return a mod without versions populated if "versions" param is not provided', async () => {
      const modId = 1;

      const expected: ModEntity = {
        id: modId,
        name: 'name',
        versions: [],
      };

      const findOneSpy = jest
        .spyOn(modsService, 'findMod')
        .mockResolvedValue(expected);

      const result = await modsController.getMod(modId);

      expect(result).toEqual(expected);
      expect(findOneSpy).toBeCalledWith(modId, {
        populate: {
          versions: false,
        },
      });
    });

    it('should return a mod with versions populated if "versions" param is set to true', async () => {
      const modId = 1;

      const returnedModVersion: ModVersionEntity = {
        id: 1,
        mod: null,
        version: '1.0',
        configs: [],
        compatibleMCVersions: [],
      };

      const returnedMod: ModEntity = {
        id: 10,
        name: 'name',
        versions: [returnedModVersion],
      };

      const expectedModVersion: GetModVersionResponseDto = {
        id: returnedModVersion.id,
        version: returnedModVersion.version,
        compatibleMCVersions: [],
      };

      const expectedMod: ModDto = {
        ...returnedMod,
        versions: [expectedModVersion],
      };

      const findOneSpy = jest
        .spyOn(modsService, 'findMod')
        .mockResolvedValue(returnedMod);

      const result = await modsController.getMod(modId, true);

      expect(result).toEqual(expectedMod);
      expect(findOneSpy).toBeCalledWith(modId, {
        populate: {
          versions: true,
        },
      });
    });
  });

  describe('METHOD getModVersions', () => {
    it('should match the dto type', async () => {
      const mockVersion: ModVersionEntity = {
        id: 1,
        version: '1.0',
        mod: null,
        compatibleMCVersions: [],
        configs: [],
      };

      const getAllVersionsSpy = jest
        .spyOn(modsService, 'getAllModVersions')
        .mockResolvedValue([mockVersion]);

      const expectedVersion: GetAllModVersionsResponseDto = {
        id: 1,
        version: '1.0',
      };

      const modId = 1;

      const res = await modsController.getAllModVersions(modId);

      expect(res).toEqual([expectedVersion]);
      expect(getAllVersionsSpy).toBeCalledWith(modId);
    });
  });

  describe('METHOD getModVersion', () => {
    it('should match the dto type', async () => {
      const versionId = 1;

      const mockVersion: ModVersionEntity = {
        id: versionId,
        version: '1.0',
        mod: null,
        compatibleMCVersions: [],
        configs: [],
      };

      const findModVersionSpy = jest
        .spyOn(modsService, 'findModVersion')
        .mockResolvedValue(mockVersion);

      const expectedVersion: GetModVersionResponseDto = {
        id: versionId,
        version: mockVersion.version,
        compatibleMCVersions: [],
      };

      const res = await modsController.getModVersion(versionId);

      expect(res).toEqual(expectedVersion);
      expect(findModVersionSpy).toBeCalledWith(versionId);
    });
  });
});
