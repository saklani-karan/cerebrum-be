import { Injectable, Logger } from '@nestjs/common';
import { RedisCacheAdapter } from '@adapters/cache/redis';
import { Cache } from 'cache-manager';
import { IntegrationCredentials } from '@modules/integration-auth/integration-auth.entity';
import { CredentialsManagementStrategy, RetrieveTokenOptions } from './types';
import { ErrorTypes, throwException } from '@utils/exceptions';

@Injectable()
export class RefreshTokenManager implements CredentialsManagementStrategy {
    private readonly redisCacheAdapter: RedisCacheAdapter;
    private readonly logger: Logger;
    private readonly rotateLockDuration = 10;

    constructor(cacheManager: Cache) {
        this.redisCacheAdapter = new RedisCacheAdapter(cacheManager);
        this.logger = new Logger(this.constructor.name);
    }

    async retrieve(id: string, options?: RetrieveTokenOptions): Promise<IntegrationCredentials> {
        this.logger.log('retrieve: retrieving token', id);
        const cachedToken = await this.getTokenFromCache(id);

        this.logger.log('retrieve: cached token', cachedToken);

        if (cachedToken) {
            this.logger.log('retrieve: cached token found');
            if (!options?.forceRefresh) {
                this.logger.log('retrieve: returning cached token');
                return cachedToken;
            }
            this.logger.log('retrieve: force refreshing token');

            await this.redisCacheAdapter.del(id);
            this.logger.log('retrieve: cached token deleted');
        }

        this.logger.log('retrieve: rotating token');
        const newToken = await this.rotateToken(id, cachedToken, options?.refreshCb);

        this.logger.log('retrieve: new token', newToken);
        return newToken;
    }

    async initialize(id: string, credentials: IntegrationCredentials): Promise<void> {
        await this.redisCacheAdapter.set(id, credentials);
    }

    private async getTokenFromCache(id: string): Promise<IntegrationCredentials> {
        return this.redisCacheAdapter.get<IntegrationCredentials>(id);
    }

    private async setTokenToCache(identifier: string, token: IntegrationCredentials) {
        await this.redisCacheAdapter.set(
            identifier,
            token,
            token.expiresAt ? token.expiresAt.getTime() - Date.now() : 0,
        );
    }

    private async rotateToken(
        identifier: string,
        token: IntegrationCredentials,
        refreshTokenCb: (token: IntegrationCredentials) => Promise<IntegrationCredentials>,
    ): Promise<IntegrationCredentials> {
        this.logger.log('rotateToken: acquiring lock', identifier);
        const lock = await this.redisCacheAdapter.acquireLock(identifier, this.rotateLockDuration);
        this.logger.log('rotateToken: lock acquired', lock);

        if (!lock) {
            this.logger.log('rotateToken: waiting for lock');
            return this.waitForLock(identifier, this.rotateLockDuration);
        }

        this.logger.log('rotateToken: refreshing token');
        const newToken = await refreshTokenCb(token);

        this.logger.log('rotateToken: new token', newToken);
        await this.setTokenToCache(identifier, newToken);

        this.logger.log('rotateToken: token cached');
        await this.redisCacheAdapter.releaseLock(identifier);

        this.logger.log('rotateToken: lock released');
        return newToken;
    }

    private async waitForLock(
        identifier: string,
        waitDuration: number,
    ): Promise<IntegrationCredentials> {
        this.logger.log('waitForLock: waiting for lock', identifier);
        const waitDurationInMs = waitDuration * 1000;
        const maxRetries = 10;
        const retryDelay = waitDurationInMs / maxRetries;
        this.logger.log('waitForLock: retry delay', retryDelay);

        let retries = 0,
            key: IntegrationCredentials;

        while (retries < maxRetries) {
            this.logger.log('waitForLock: checking if key is cached', identifier);
            key = await this.redisCacheAdapter.get<IntegrationCredentials>(identifier);
            if (key) {
                this.logger.log('waitForLock: key found', key);
                return key;
            }

            await new Promise((resolve) => setTimeout(resolve, retryDelay));
            retries++;
        }

        this.logger.error('waitForLock: timeout', identifier);
        throwException(ErrorTypes.TIMEOUT, {
            message: 'Timeout waiting for key rotation',
        });
    }
}
