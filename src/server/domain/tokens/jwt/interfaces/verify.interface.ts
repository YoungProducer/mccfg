import { Secret, VerifyOptions } from 'jsonwebtoken';

export type VerifyType = <R = any>(
  token: string,
  secret: Secret,
  options?: VerifyOptions,
) => Promise<R>;
