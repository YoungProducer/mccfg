import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { ParseBoolPipeConstructorParams } from './interfaces/parse-bool-pipe-constructor.interface';

@Injectable()
export class ParseBoolPipe implements PipeTransform<string, boolean> {
  optional: boolean;
  defaultValue: boolean;

  constructor(
    private params: ParseBoolPipeConstructorParams = {
      optional: false,
      defaultValue: false,
    },
  ) {
    this.optional = params.optional;
    this.defaultValue = params.defaultValue;
  }

  transform(value = '', _metadata: ArgumentMetadata): boolean {
    if (this.optional && !value) {
      return this.defaultValue;
    }

    if (!['true', 'false'].includes(value)) {
      throw new BadRequestException('Validation failed');
    }

    const val = value === 'true';
    return val;
  }
}
