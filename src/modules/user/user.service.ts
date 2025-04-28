import { BaseService } from '@modules/base/base.service';
import { InjectRepository } from '@nestjs/typeorm';
import { ErrorTypes, throwException } from '@utils/exceptions';
import { EntityManager, Not, Repository } from 'typeorm';
import { User } from './user.entity';
import { tryCatch } from '@utils/try-catch';
export class UserService extends BaseService<User> {
    constructor(@InjectRepository(User) repository: Repository<User>) {
        super(repository);
    }

    findByEmail(email: string): Promise<User> {
        return this.runTransaction(async (manager: EntityManager) => {
            const txRepo = manager.withRepository(this.repository);
            const user = await txRepo.findOne({
                where: {
                    email: email.toLowerCase(),
                },
            });

            if (!user) {
                throwException(ErrorTypes.ENTITY_NOT_FOUND, { message: 'user not found' });
            }

            return user;
        });
    }

    protected isUnique(entity: User): void | Promise<void> {
        return this.runTransaction(async (manager: EntityManager) => {
            const txRepo = manager.withRepository(this.repository);
            const { email, id } = entity;

            const [error, userCount] = await tryCatch(
                txRepo.count({
                    where: {
                        email: email.toLowerCase(),
                        id: id ? Not(id) : undefined,
                    },
                }),
            );

            if (error) {
                throwException(ErrorTypes.DB_ERROR, { message: error.message });
            }

            if (userCount) {
                throwException(ErrorTypes.ENTITY_EXISTS, {
                    message: 'user with email already exists',
                });
            }

            return;
        });
    }
}
