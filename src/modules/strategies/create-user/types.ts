import { User } from '@modules/user/user.entity';
import { Transactional } from '@utils/transaction';

export type CreateUserRequest = {
    email: string;
    name?: string;
    dpUrl?: string;
};

export interface CreateUserStrategyInterface extends Transactional {
    exec(request: CreateUserRequest): Promise<User>;
}
