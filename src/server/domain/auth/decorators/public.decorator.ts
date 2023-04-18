import { SetMetadata } from '@nestjs/common';

export const publicDecoratorToken = 'isPublic';

export const Public = (value = true) =>
  SetMetadata(publicDecoratorToken, value);
