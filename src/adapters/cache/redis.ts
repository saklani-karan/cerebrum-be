import IORedis from 'ioredis';
import { CacheAdapter } from './interface';
import { Cache } from 'cache-manager';

export class RedisCacheAdapter implements CacheAdapter {
    private redisClient: IORedis;

    constructor(private readonly cacheManager: Cache) {
        this.redisClient = (this.cacheManager.stores[0] as any).getClient();
    }

    async get<T>(key: string): Promise<T | null> {
        return this.cacheManager.get<T>(key);
    }

    async set<T>(key: string, value: T, ttl?: number) {
        await this.cacheManager.set<T>(key, value, ttl);
    }

    async del(key: string) {
        await this.cacheManager.del(key);
    }

    async acquireLock(key: string, ttl: number): Promise<boolean> {
        const lockKey = this.getLockKey(key);
        const result = await this.redisClient.set(lockKey, Date.now().toString(), 'PX', ttl, 'NX');

        return Boolean(result);
    }

    async releaseLock(key: string) {
        const lockKey = this.getLockKey(key);
        const script = `
            if redis.call("get", KEYS[1]) == ARGV[1] then
                return redis.call("del", KEYS[1])
            else
                return 0
            end
        `;

        await this.redisClient.eval(script, 1, lockKey);
    }

    private getLockKey(key: string): string {
        return `lock:${key}`;
    }
}
