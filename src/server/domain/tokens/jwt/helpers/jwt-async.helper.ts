import { sign as signSync, verify as verifySync } from 'jsonwebtoken';

import { SignType } from '../interfaces/sign.interface';
import { VerifyType } from '../interfaces/verify.interface';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const pify = require('pify');

export const sign: SignType = pify(signSync);
export const verify = <VerifyType>pify(verifySync);
