import { ParseBoolPipe } from '..';
import { ArgumentMetadata, BadRequestException } from '@nestjs/common';

describe('PIPE ParseBoolPipe', () => {
  let target: ParseBoolPipe;

  const metadata: ArgumentMetadata = {
    type: 'query',
    metatype: String,
    data: '',
  };

  beforeEach(() => {
    target = new ParseBoolPipe();
  });

  it(`should throw an error if input is not 'true' or 'false'`, () => {
    const testValue = 'aaa';

    const call = () => target.transform(testValue, {} as any);

    expect(call).toThrow(BadRequestException);
    expect(call).toThrow('Validation failed');
  });

  it('should return "true" as boolean if input is "true"', () => {
    const testValue = 'true';

    expect(target.transform(testValue, metadata)).not.toBeInstanceOf(String);
    expect(target.transform(testValue, {} as any)).toBe(true);
  });

  it('should return "false" as boolean if input "boolean"', () => {
    const testValue = 'false';

    expect(target.transform(testValue, metadata)).not.toBeInstanceOf(String);
    expect(target.transform(testValue, {} as any)).toBe(false);
  });
});
