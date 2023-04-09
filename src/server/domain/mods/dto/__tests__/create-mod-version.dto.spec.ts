import { plainToInstance } from 'class-transformer';
import { CreateModVersionDto } from '../create-mod-version.dto';
import { validate } from 'class-validator';

describe('DTO CreateModVersionDto', () => {
  it(`should accept "compatibleMCVersions" when its type is "string"`, async () => {
    const inputDto: CreateModVersionDto = {
      version: '1.0',
      compatibleMCVersions: '1.0',
    };

    const dtoInstance = plainToInstance(CreateModVersionDto, inputDto);

    const errors = await validate(dtoInstance);

    expect(errors.length).toBe(0);
  });

  it(`should accept "compatibleMCVersions" when its type is "array"`, async () => {
    const inputDto: CreateModVersionDto = {
      version: '1.0',
      compatibleMCVersions: ['1.0', '2.0'],
    };

    const dtoInstance = plainToInstance(CreateModVersionDto, inputDto);

    const errors = await validate(dtoInstance);

    expect(errors.length).toBe(0);
  });
});
