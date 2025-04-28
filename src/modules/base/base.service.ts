import { DeepPartial, EntityManager, FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Injectable, Logger, Scope } from '@nestjs/common';
import { ErrorTypes, throwException } from '@utils/exceptions';
import { ListEntityResponse, RequestQueryFields, TransformedQuery } from '@utils/transform-query';
import { Transactional } from '@utils/transaction';
import { Request } from 'express';
import { User } from '@modules/user/user.entity';
import { tryCatch } from '@utils/try-catch';
@Injectable()
export class BaseService<Entity extends BaseEntity = BaseEntity> extends Transactional {
    protected logger: Logger;
    protected defaultRelations: string[] = [];
    protected defaultFields: (keyof Entity)[];
    protected dependencies: any[] = [];
    protected isTransactional_ = false;
    protected request?: Request = null;

    protected constructor(protected readonly repository: Repository<Entity>) {
        super(repository.manager);
        this.logger = new Logger(this.constructor.name);
    }

    findAll(options?: FindManyOptions<Entity>): Promise<Entity[]>;
    async findAll(options?: FindManyOptions): Promise<Entity[]> {
        this.logger.log('findAll: request received');
        return this.runTransaction(async (transactionManager: EntityManager) => {
            const repository: Repository<Entity> = transactionManager.withRepository(
                this.repository,
            );

            const [error, entities] = await tryCatch(repository.find(options));

            if (error) {
                this.logger.error(
                    `findAll: error on find on repository ${JSON.stringify({
                        message: error.message,
                    })}`,
                );
                throwException(error);
            }

            return entities;
        });
    }

    findOne(options?: FindOneOptions<Entity>): Promise<Entity>;
    async findOne(options?: FindOneOptions): Promise<Entity> {
        this.logger.log('findOne: request received');
        return this.runTransaction(async (transactionManager: EntityManager) => {
            const repository: Repository<Entity> = transactionManager.withRepository(
                this.repository,
            );
            const [error, entity] = await tryCatch(repository.findOne(options));

            if (error) {
                this.logger.error(
                    `findOne: error on findOne on repository ${JSON.stringify({
                        message: error.message,
                    })}`,
                );
                throwException(error);
            }
            return entity;
        });
    }

    list<Query extends RequestQueryFields<Entity>>(
        query_: TransformedQuery<
            Entity,
            Omit<Query, 'order' | 'expand' | 'fields' | 'limit' | 'offset'>
        >,
    ): Promise<ListEntityResponse<Entity>> {
        return this.runTransaction(async (manager: EntityManager) => {
            const repository: Repository<Entity> = manager.withRepository(this.repository);

            let entities: Entity[], total: number;
            let query: FindManyOptions<Entity> = {};
            if (query_.where) {
                Object.assign(query, { where: query_.where });
            }
            if (query_.select) {
                const select: any = {};
                query_.select.forEach((key) => {
                    select[key] = true;
                });
                Object.assign(query, {
                    select,
                });
            }
            if (query_.order) {
                Object.assign(query, { order: query_.order });
            }
            if (query_.relations) {
                Object.assign(query, { relations: query_.relations });
            }
            if (query_.skip) {
                Object.assign(query, { skip: query_.skip });
            }
            if (query_.take) {
                Object.assign(query, { take: query_.take });
            }
            if (query_.config) {
                query = {
                    ...query,
                    ...query_.config,
                };
            }

            try {
                [entities, total] = await Promise.all([
                    repository.find(query),
                    repository.count({ where: query.where }),
                ]);
            } catch (err) {
                throwException(ErrorTypes.DB_ERROR, { message: err.message });
            }

            return {
                limit: query.take,
                offset: query.skip,
                total,
                rows: entities,
            };
        });
    }

    get<T = Entity>(id: any, options?: Omit<FindOneOptions<Entity>, 'where'>): Promise<T>;
    get(id: any, options: Omit<FindOneOptions<Entity>, 'where'>, ...args: any[]): Promise<any>;
    async get(id: any, options?: Omit<FindOneOptions<Entity>, 'where'>): Promise<Entity> {
        return this.runTransaction(async (transactionManager: EntityManager) => {
            const repository: Repository<Entity> = transactionManager.withRepository(
                this.repository,
            );
            this.logger.log(`get: received request with id=${id}`);
            if (!id?.length) {
                throwException(ErrorTypes.INVALID_ARGUMENTS, { message: 'ID is required' });
            }

            let findOneQuery: FindOneOptions<Entity> = {
                where: { id },
                relations: this.defaultRelations as string[],
                select: this.defaultFields,
            };
            if (options) {
                findOneQuery = {
                    ...findOneQuery,
                    ...options,
                };
            }

            const [error, entity] = await tryCatch(repository.findOne(findOneQuery));

            if (error) {
                this.logger.error(
                    `an error occured while fetching entity from DB: ${JSON.stringify({
                        message: error.message,
                    })}`,
                );
                throwException(error as Error);
            }

            if (!entity || !entity?.id === id) {
                this.logger.error(`get: no entity found for id=${id}`);
                throwException(ErrorTypes.ENTITY_NOT_FOUND, {
                    message: `entity not found for id=${id}`,
                });
            }
            this.logger.log(`get: entity found for id=${id}`);
            return entity;
        });
    }

    create<TInput = DeepPartial<Entity>, TOutput = Entity>(
        entity: TInput,
        ...args: any[]
    ): Promise<TOutput>;
    create(entity: any, ...args: any[]): Promise<any>;
    async create(entity: DeepPartial<Entity> | Entity): Promise<Entity> {
        return this.runTransaction(async (transactionManager) => {
            this.logger.log(`create: received request for creation`, entity, this.repository);

            const repository: Repository<Entity> = transactionManager.withRepository(
                this.repository,
            );
            const txService = this.withTransaction(transactionManager);

            const entityDao: Entity = repository.create(entity);

            await txService.isUnique(entityDao);

            const [error, savedEntity] = await tryCatch(repository.save(entityDao));
            if (error) {
                this.logger.error(
                    `create: error creating entity, ${JSON.stringify({
                        message: error.message,
                    })}`,
                );
                throwException(error as Error);
            }

            return savedEntity;
        });
    }

    remove(id: any, ...args: any[]): Promise<Entity>;
    async remove(id: any): Promise<Entity> {
        this.logger.log(`remove: received request with id=${id}`);
        return this.runTransaction(async (transactionManager) => {
            const repository: Repository<Entity> = transactionManager.withRepository(
                this.repository,
            );
            const txService = this.withTransaction(transactionManager);

            const entity = await txService.get(id);

            const [error, removedEntity] = await tryCatch(repository.remove(entity));

            if (error) {
                this.logger.error(
                    `remove: error while removing entity: ${JSON.stringify({
                        message: error.message,
                    })}`,
                );
                throwException(error as Error);
            }

            return removedEntity;
        });
    }

    update(id: any, update: any): Promise<Entity>;
    update(id: any, update: any, ...args: any[]): Promise<Entity>;
    async update(id: any, update: DeepPartial<Entity>): Promise<Entity> {
        return this.runTransaction(async (transactionManager) => {
            const repository: Repository<Entity> = transactionManager.withRepository(
                this.repository,
            );

            const txService = this.withTransaction(transactionManager);

            const entity = await txService.get(id);

            const entityDao: Entity = repository.create({
                ...entity,
                ...update,
            });

            await txService.isUnique(entityDao);

            const [error, updatedResult] = await tryCatch(repository.save(entityDao));

            if (error) {
                this.logger.error(
                    `update: error while updating entity: ${JSON.stringify({
                        message: error.message,
                    })}`,
                );
                throwException(error as Error);
            }

            return updatedResult;
        });
    }

    /**
     * Checks for uniqueness on the entity. Runs before create and update
     * @param {Entity} entity
     * @returns {void}
     */
    protected isUnique(entity: Entity): Promise<void> | void {
        return;
    }

    protected resolveUserFromRequest(): User {
        if (!this.request) {
            return null;
        }

        return this.request.user as User;
    }
}
