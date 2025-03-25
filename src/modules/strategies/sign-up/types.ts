import { User } from '@modules/user/user.entity';
import { Transactional } from '@utils/transaction';
import { IsEmail, IsString } from 'class-validator';

export class SignUpRequest {
  @IsEmail()
  email: string;
  @IsString()
  password: string;
}

export interface SignUpStrategyInterface extends Transactional {
  exec(request: SignUpRequest): Promise<User>;
}
