import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MCVersionEntity } from 'server/domain/mcversion/entities/mc-version.entity';
import { MCVersionService } from 'server/domain/mcversion/mcversion.service';
import { ModVersionEntity } from 'server/domain/mods/entities/mod-version.entity';
import { ModEntity } from 'server/domain/mods/entities/mod.entity';
import { ModsService } from 'server/domain/mods/mods.service';
import { RefreshTokenEntity } from 'server/domain/tokens/entities/refresh-token.entity';
import { ConfirmationTokenEntity } from 'server/domain/users/entities/confirmation-token.entity';
import { UserEntity } from 'server/domain/users/entities/user.entity';
import { UsersService } from 'server/domain/users/users.service';
import { Repository } from 'typeorm';
import { ConfigsService } from '../config.service';
import { ConfigEntity } from '../entities/config.entity';
import { ConfigsController } from '../config.controller';
import { createMock } from '@golevelup/ts-jest';
import { Request } from 'express';
import { CreateConfigDto } from '../dto/create-config.dto';

describe('CONTROLLER Configs', () => {
  let configsController: ConfigsController;
  let configsService: ConfigsService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [ConfigsController],
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

    configsController = moduleRef.get<ConfigsController>(ConfigsController);
    configsService = moduleRef.get<ConfigsService>(ConfigsService);
  });

  it('should be defined', () => {
    expect(configsController).toBeDefined();
    expect(configsService).toBeDefined();
  });

  describe('API createConfig', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should populate an error if service throws it', () => {
      const error = Error;
      const errorMessage = 'error';

      const mockRequest = createMock<Request>();
      mockRequest['fileName'] = 'file.txt';

      const mockBody: CreateConfigDto = {
        dependenciesIds: [],
        ownerId: 1,
        primaryModId: 1,
        version: '1.0',
      };

      const mockFile = createMock<Express.Multer.File>();
      mockFile.originalname = 'originalName.txt';

      jest
        .spyOn(configsService, 'create')
        .mockRejectedValue(new error(errorMessage));

      const call = configsController.createConfig(
        mockRequest,
        mockBody,
        mockFile,
      );

      expect(call).rejects.toThrow(error);
      expect(call).rejects.toThrowError(errorMessage);
    });

    it('should successfuly create a new instance if there are no erros', async () => {
      const mockRequest = createMock<Request>();
      const fileName = 'file.txt';
      mockRequest['fileName'] = fileName;

      const mockBody: CreateConfigDto = {
        dependenciesIds: [],
        ownerId: 1,
        primaryModId: 1,
        version: '1.0',
      };

      const mockFile = createMock<Express.Multer.File>();
      const initialFileName = 'originalName.txt';
      mockFile.originalname = initialFileName;

      const createSpy = jest
        .spyOn(configsService, 'create')
        .mockImplementation((e: any) => e);

      await configsController.createConfig(mockRequest, mockBody, mockFile);

      expect(createSpy).toBeCalledTimes(1);
      expect(createSpy).toBeCalledWith({
        ...mockBody,
        fileName,
        initialFileName,
      });
    });
  });
});
