import { Test } from '@nestjs/testing';
import { MCVersionEntity } from '../entities/mc-version.entity';
import { MCVersionService } from '../mcversion.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConflictException } from '@nestjs/common';
import { mcVersionErrorMessages } from '../constants/error-messages';

describe('SERVICE MCVersion', () => {
  let mcVersionService: MCVersionService;
  let repo: Repository<MCVersionEntity>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        MCVersionService,
        {
          provide: getRepositoryToken(MCVersionEntity),
          useClass: Repository,
        },
      ],
    }).compile();

    mcVersionService = moduleRef.get<MCVersionService>(MCVersionService);
    repo = moduleRef.get<Repository<MCVersionEntity>>(
      getRepositoryToken(MCVersionEntity),
    );

    jest.spyOn(repo, 'create').mockImplementation((e: any) => e);
  });

  it('should be defined', () => {
    expect(mcVersionService).toBeDefined();
  });

  describe('METHOD create', () => {
    it(`should return a created entity if there are no errors`, async () => {
      const version = '1.0';

      const result: MCVersionEntity = {
        id: 1,
        version,
      };

      const findOneSpy = jest
        .spyOn(repo, 'findOne')
        .mockImplementation(async () => undefined);

      const saveSpy = jest
        .spyOn(repo, 'save')
        .mockImplementation(async () => result);

      expect(await mcVersionService.create(version)).toEqual(result);
      expect(findOneSpy).toBeCalledTimes(1);
      expect(saveSpy).toBeCalledTimes(1);
    });

    it(`should throw a "ConflictException" if given version already exist`, async () => {
      const version = '1.0';

      const result: MCVersionEntity = {
        id: 1,
        version,
      };

      const findOneSpy = jest
        .spyOn(repo, 'findOne')
        .mockImplementation(async () => result);

      const call = mcVersionService.create(version);

      expect(call).rejects.toThrow(ConflictException);
      expect(call).rejects.toThrowError(
        mcVersionErrorMessages.getVersionExistErr(version),
      );

      expect(findOneSpy).toBeCalledTimes(1);
    });
  });
});
