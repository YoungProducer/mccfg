import { Secret, SignOptions } from 'jsonwebtoken';

export type SignType = (
  // eslint-disable-next-line @typescript-eslint/ban-types
  payload: string | Buffer | object,
  secret: Secret,
  options?: SignOptions,
) => Promise<string>;
