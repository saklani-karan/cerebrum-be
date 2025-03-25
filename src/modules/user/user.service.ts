import { BaseService } from '@modules/base/base.service';
import { InjectRepository } from '@nestjs/typeorm';
import { ErrorTypes, throwException } from '@utils/exceptions';
import { EntityManager, Not, Repository } from 'typeorm';
import { FindOrCreateUser } from './types/find-or-create-user';
import { User } from './user.entity';

export class UserService extends BaseService<User> {
  constructor(@InjectRepository(User) repository: Repository<User>) {
    super(repository, 'user');
  }

  findOrCreate(request: FindOrCreateUser): Promise<User> {
    return this.runTransaction(async (manager: EntityManager) => {
      const txRepo = manager.withRepository(this.repository);
      const txService = this.withTransaction(manager);
      const { email, firstName, lastName, dpUrl } = request;

      let user: User;
      try {
        user = await txRepo.findOne({
          where: {
            email: email.toLowerCase(),
          },
        });
      } catch (err) {
        throwException(ErrorTypes.DB_ERROR, { message: err.message });
      }

      if (user) {
        return user;
      }

      return txService.create({
        email,
        firstName,
        lastName,
        dpUrl,
      });
    });
  }

  protected isUnique(entity: User): void | Promise<void> {
    return this.runTransaction(async (manager: EntityManager) => {
      const txRepo = manager.withRepository(this.repository);
      const { email, id } = entity;

      let userCount: number;
      try {
        userCount = await txRepo.count({
          where: {
            email: email.toLowerCase(),
            id: id ? Not(id) : undefined,
          },
        });
      } catch (err) {
        throwException(ErrorTypes.DB_ERROR, { message: err.message });
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
