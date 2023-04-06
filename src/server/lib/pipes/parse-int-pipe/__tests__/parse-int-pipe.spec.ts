import { ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { ParseIntPipe } from '..';

describe('PIPE ParseIntPipe', () => {
  let target: ParseIntPipe;

  const metadata: ArgumentMetadata = {
    type: 'param',
    metatype: String,
    data: '',
  };

  beforeEach(() => {
    target = new ParseIntPipe();
  });

  it('should return valid number if string can be parsed', () => {
    const testValue = '16';

    expect(target.transform(testValue, {} as any)).toBe(16);
    expect(target.transform(testValue, metadata)).not.toBeInstanceOf(String);
  });

  it('should throw BadRequestException if value can not be parsed', () => {
    const testValue = 'aa';

    const call = () => target.transform(testValue, {} as any);

    expect(call).toThrow(BadRequestException);
    expect(call).toThrowError('Validation failed');
  });
});
