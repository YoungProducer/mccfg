import { Test } from '@nestjs/testing';
import { MCVersionController } from '../mcversion.controller';
import { MCVersionService } from '../mcversion.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MCVersionEntity } from '../entities/mc-version.entity';
import { Repository } from 'typeorm';
import { CreateVersionDto } from '../dto/create-version.dto';

describe('CONTROLLER MCVersion', () => {
  let mcversionController: MCVersionController;
  let mcversionService: MCVersionService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [MCVersionController],
      providers: [
        MCVersionService,
        {
          provide: getRepositoryToken(MCVersionEntity),
          useClass: Repository,
        },
      ],
    }).compile();

    mcversionService = moduleRef.get<MCVersionService>(MCVersionService);
    mcversionController =
      moduleRef.get<MCVersionController>(MCVersionController);
  });

  it('should be defined', () => {
    expect(mcversionController).toBeDefined();
    expect(mcversionService).toBeDefined();
  });

  describe('API create', () => {
    it('should return void if there are no errors', async () => {
      const version = '1.0';

      const entity: MCVersionEntity = {
        id: 1,
        version,
      };

      const dto: CreateVersionDto = {
        version,
      };

      const createSpy = jest
        .spyOn(mcversionService, 'create')
        .mockImplementation(async () => entity);

      expect(await mcversionController.createVersion(dto)).toBeUndefined();
      expect(createSpy).toBeCalledTimes(1);
    });
  });

  describe('API getAll', () => {
    it('should return an array of versions', async () => {
      const entity: MCVersionEntity = {
        id: 1,
        version: '1.0',
      };

      const findAllSpy = jest
        .spyOn(mcversionService, 'findAll')
        .mockImplementation(async () => [entity]);

      const res = await mcversionController.getAll();

      expect(res).toEqual([entity]);
      expect(findAllSpy).toBeCalledTimes(1);
    });
  });
});
