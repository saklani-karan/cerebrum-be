import { BaseEntity } from '@modules/base/base.entity';
import { ClassConstructor, Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
} from 'class-validator';
import { FindManyOptions } from 'typeorm';
import { ErrorTypes, throwException } from './exceptions';
import { queryArrayStringSerializer } from './serializers';

export class ListEntityResponse<Entity extends BaseEntity> {
  rows: Entity[];

  total: number;

  limit: number;

  offset: number;
}

export class RequestQueryFields<Entity extends BaseEntity> {
  @IsString({ each: true })
  @Transform(({ value }) => queryArrayStringSerializer.deserialize(value))
  @IsOptional()
  expand?: string[];

  @IsString({ each: true })
  @Transform(({ value }) => queryArrayStringSerializer.deserialize(value))
  @IsOptional()
  fields?: (keyof Entity)[];

  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  offset?: number = 0;

  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  limit?: number = 10;

  @IsString()
  @IsOptional()
  order?: string;
}

export type FindConfig<Entity> = Omit<FindManyOptions<Entity>, 'where'>;

export type TransformConfig<Entity> = {
  allowedRelations?: string[];
  allowedFields?: (keyof Entity)[];
  defaultRelations?: string[];
  defaultFields?: (keyof Entity)[];
};

export type TransformQueryOrder = {
  [k: string]: TransformQueryOrderDirections;
};

export type TransformQueryOrderDirections = 'DESC' | 'ASC';

export type TransformedQuery<Entity extends BaseEntity, FilterQuery> = {
  relations: string[];
  select: (keyof Entity)[];
  where: FilterQuery;
  take: number;
  skip: number;
  order: TransformQueryOrder;
  config: FindManyOptions<Entity>;
};

export type ListingWhereQuery<
  Entity extends BaseEntity,
  Query extends RequestQueryFields<Entity>,
> = Omit<Query, 'order' | 'expand' | 'fields' | 'limit' | 'offset'>;

export function transformQuery<
  Query extends RequestQueryFields<Entity>,
  Entity extends BaseEntity,
>(
  queryValidator: ClassConstructor<Query>,
  query: Query,
  transformConfig?: TransformConfig<Entity>,
  config?: FindConfig<Entity>,
): TransformedQuery<Entity, ListingWhereQuery<Entity, Query>> {
  const { expand, fields, limit, offset, order, ...where } = query;
  const relations = validateAndRetrieveRelations(expand, transformConfig);
  const select =
    validateAndRetrieveFields<Entity>(fields, transformConfig) || [];
  const orderFields = validateAndRetrieveOrder(order);

  if (orderFields && Object.keys(orderFields)?.length && select?.length) {
    Object.keys(orderFields)?.forEach((orderKey) => {
      if (select.includes(orderKey as keyof Entity)) {
        return;
      }
      select.push(orderKey as keyof Entity);
    });
  }
  return {
    where: where,
    relations,
    select,
    take: limit,
    skip: offset,
    order: validateAndRetrieveOrder(order),
    config,
  };
}

function validateAndRetrieveOrder<Entity extends BaseEntity>(
  order: string,
): TransformQueryOrder {
  if (!order) {
    return;
  }
  const [order_, direction_, key] = /^(\+|-)?(.+)$/.exec(order);
  let direction: TransformQueryOrderDirections = 'ASC';
  if (direction_) {
    switch (direction_) {
      case '+':
        direction = 'ASC';
      case '-':
        direction = 'DESC';
    }
  }
  return {
    [key]: direction,
  };
}

function validateAndRetrieveRelations<Entity extends BaseEntity>(
  queryRelations?: string[],
  config?: TransformConfig<Entity>,
): string[] {
  if (!config) {
    return queryRelations;
  }
  const { allowedRelations, defaultRelations } = config;
  if (!queryRelations) {
    return defaultRelations;
  }
  if (!allowedRelations) {
    return queryRelations;
  }
  const allowedRelationsSet: Set<string> = new Set(allowedRelations);

  queryRelations.forEach((relation) => {
    if (!allowedRelationsSet.has(relation)) {
      throwException(ErrorTypes.INVALID_ARGUMENTS, {
        message: `expand relation ${relation} is not allowed`,
      });
    }
  });

  return queryRelations;
}

function validateAndRetrieveFields<Entity extends BaseEntity>(
  queryFields?: (keyof Entity)[],
  config?: TransformConfig<Entity>,
): (keyof Entity)[] {
  if (!queryFields) {
    return config?.defaultFields;
  }
  if (!queryFields.includes('id')) {
    queryFields.push('id');
  }

  if (!config?.allowedFields) {
    return queryFields;
  }
  const allowedFieldsSet: Set<keyof Entity> = new Set(config?.allowedFields);

  queryFields.forEach((field) => {
    if (!allowedFieldsSet.has(field)) {
      throwException(ErrorTypes.INVALID_ARGUMENTS, {
        message: `field ${field.toString()} is not allowed`,
      });
    }
  });

  return queryFields;
}
