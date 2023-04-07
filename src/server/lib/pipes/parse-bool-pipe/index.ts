import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';

@Injectable()
export class ParseBoolPipe implements PipeTransform<string, boolean> {
  transform(value: string, _metadata: ArgumentMetadata): boolean {
    if (!['true', 'false'].includes(value)) {
      throw new BadRequestException('Validation failed');
    }

    const val = value === 'true';
    return val;
  }
}
