import { Global, Injectable } from '@nestjs/common';
import { compare } from 'bcrypt';
import { createHash } from 'crypto';
import { SignPasswordStrategyInterface } from './types';

export const SIGN_PASSWORD_STRATEGY = 'sign_password_strategy';

@Injectable()
export class SignPasswordStrategyImpl implements SignPasswordStrategyInterface {
  async sign(password: string): Promise<string> {
    const hashedPassword = createHash('md5').update(password).digest('hex');

    return hashedPassword;
  }

  compare(password: string, hash: string): Promise<boolean> {
    return compare(password, hash);
  }
}
