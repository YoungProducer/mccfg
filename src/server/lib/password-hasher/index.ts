import { randomStringGenerator } from '@nestjs/common/utils/random-string-generator.util';
import { compare, hash } from 'bcryptjs';

import { hashRounds } from './constants';

/**
 * @param password - password to hash;
 *
 * @returns {Promise<[string, string]>} - returns tuple of password hash and salt.
 */
export const hashPassword = async (
  password: string,
): Promise<[string, string]> => {
  const salt = randomStringGenerator();
  const passwordHash = await hash(password + salt, hashRounds);

  return [passwordHash, salt];
};

interface ComparePasswordParam {
  providedPass: string;
  storedPass: string;
  salt: string;
}

export const comparePasswords = async ({
  providedPass,
  storedPass,
  salt,
}: ComparePasswordParam): Promise<boolean> =>
  await compare(providedPass + salt, storedPass);
