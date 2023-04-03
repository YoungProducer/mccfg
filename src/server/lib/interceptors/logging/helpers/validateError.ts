/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { HttpException } from '@nestjs/common';

export const validateError = (error: any): boolean =>
  !(error instanceof HttpException);
