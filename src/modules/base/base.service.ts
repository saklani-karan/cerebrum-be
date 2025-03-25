import { DeepPartial, EntityManager, FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Injectable, Logger, Scope } from '@nestjs/common';
import { ErrorTypes, throwException } from '@utils/exceptions';
import { ListEntityResponse, RequestQueryFields, TransformedQuery } from '@utils/transform-query';
import { Transactional } from '@utils/transaction';
import { Request } from 'express';
import { User } from '@modules/user/user.entity';

@Injectable()
export class BaseService<Entity extends BaseEntity = BaseEntity> extends Transactional {
    protected logger: Logger;
    protected defaultRelations: string[] = [];
    protected defaultFields: (keyof Entity)[];
    protected dependencies: any[] = [];
    protected isTransactional_ = false;
    protected request?: Request = null;

    protected constructor(
        protected readonly repository: Repository<Entity>,
        protected readonly serviceName: string,
    ) {
        super(repository.manager);
        this.logger = new Logger(`${serviceName}`);
    }

    findAll(options?: FindManyOptions<Entity>): Promise<Entity[]>;
    async findAll(options?: FindManyOptions): Promise<Entity[]> {
        this.logger.log('findAll: request received');
        return this.runTransaction(async (transactionManager: EntityManager) => {
            const repository: Repository<Entity> = transactionManager.withRepository(
                this.repository,
            );
            let entities: Entity[] = [];
            try {
                entities = await repository.find(options);
            } catch (err) {
                this.logger.error(
                    `findAll: error on find on repository ${JSON.stringify({
                        message: err.message,
                    })}`,
                );
                throwException(err);
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
            let entity: Entity;
            try {
                entity = await repository.findOne(options);
            } catch (err) {
                this.logger.error(
                    `findOne: error on findOne on repository ${JSON.stringify({
                        message: err.message,
                    })}`,
                );
                throwException(err);
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
            let entity: Entity;
            try {
                entity = await repository.findOne(findOneQuery);
            } catch (err) {
                this.logger.error(
                    `an error occured while fetching entity from DB: ${JSON.stringify({
                        message: err.message,
                    })}`,
                );
                throwException(err as Error);
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
            const repository: Repository<Entity> = transactionManager.withRepository(
                this.repository,
            );
            this.logger.log(`create: received request for creation`, entity, this.repository);
            const entityDao: Entity = repository.create(entity);
            await this.isUnique(entityDao);
            let savedEntity: Entity;
            try {
                savedEntity = await repository.save(entityDao);
            } catch (err) {
                this.logger.error(
                    `create: error creating entity, ${JSON.stringify({
                        message: err.message,
                    })}`,
                );
                throwException(err as Error);
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
            let entity: Entity;
            try {
                entity = await this.get(id);
            } catch (err) {
                this.logger.error(
                    `error findOneBy: ${JSON.stringify({
                        message: err.message,
                    })}`,
                );
                throwException(err);
            }
            try {
                await repository.remove(entity);
            } catch (err) {
                this.logger.error(
                    `remove: error while removing entity: ${JSON.stringify({
                        message: err.message,
                    })} `,
                );
                throwException(err as Error);
            }

            return entity;
        });
    }

    update(id: any, update: any): Promise<Entity>;
    update(id: any, update: any, ...args: any[]): Promise<Entity>;
    async update(id: any, update: DeepPartial<Entity>): Promise<Entity> {
        return this.runTransaction(async (transactionManager) => {
            const repository: Repository<Entity> = transactionManager.withRepository(
                this.repository,
            );
            let entity: Entity;
            try {
                entity = await this.withTransaction(transactionManager).get(id);
            } catch (err) {
                this.logger.error(
                    `error findOneBy: ${JSON.stringify({
                        message: err.message,
                    })}`,
                );
                throwException(err);
            }

            const entityDao: Entity = repository.create({
                ...entity,
                ...update,
            });
            await this.isUnique(entityDao);

            let updatedResult: Entity;
            try {
                updatedResult = await repository.save(entityDao);
            } catch (err) {
                this.logger.error(
                    `error update: ${JSON.stringify({
                        message: err.message,
                    })}`,
                );
                throwException(err);
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
