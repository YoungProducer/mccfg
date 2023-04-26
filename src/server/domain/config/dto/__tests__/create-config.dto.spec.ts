import { plainToInstance } from 'class-transformer';
import { CreateConfigDto } from '../create-config.dto';
import { validate } from 'class-validator';

describe('DTO CreateConfigDto', () => {
  it('should accept "dependenciesIds" as array', async () => {
    const inputDto: CreateConfigDto = {
      version: '1.0',
      primaryModId: 1,
      dependenciesIds: [1, 2],
    };

    const dtoInstance = plainToInstance(CreateConfigDto, inputDto);

    const errors = await validate(dtoInstance);

    expect(errors).toHaveLength(0);
  });

  it('should have an error if one of element in "dependenciesIds" array is empty', async () => {
    const inputDto: CreateConfigDto = {
      version: '1.0',
      primaryModId: 1,
      dependenciesIds: [1, undefined],
    };

    const dtoInstance = plainToInstance(CreateConfigDto, inputDto);

    const errors = await validate(dtoInstance);

    expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    expect(errors[0].constraints).toHaveProperty('isInt');
  });

  it('should accept empty array for "dependenciesIds"', async () => {
    const inputDto: CreateConfigDto = {
      version: '1.0',
      primaryModId: 1,
      dependenciesIds: [],
    };

    const dtoInstance = plainToInstance(CreateConfigDto, inputDto);

    const errors = await validate(dtoInstance);

    expect(errors).toHaveLength(0);
  });
});
