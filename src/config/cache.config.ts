import { ConfigService } from '@nestjs/config';
import { CacheModuleOptions } from '@nestjs/cache-manager';
import { IoRedisStore } from 'cache-manager-ioredis';

export const cacheConfig = (configService: ConfigService): CacheModuleOptions => ({
    store: IoRedisStore as any,
    host: configService.get('REDIS_HOST'),
    port: configService.get('REDIS_PORT'),
    password: configService.get('REDIS_PASSWORD') || undefined,
    db: configService.get('REDIS_DB'),
    ttl: 300,
});
