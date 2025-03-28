import { ConfigService } from '@nestjs/config';
import { BullRootModuleOptions } from '@nestjs/bullmq';

export const bullMqConfig = async (
    configService: ConfigService,
): Promise<BullRootModuleOptions> => ({
    connection: {
        host: configService.get('REDIS_HOST'),
        port: parseInt(configService.get('REDIS_PORT')),
        password: configService.get('REDIS_PASSWORD'),
    },
    defaultJobOptions: {
        attempts: parseInt(configService.get('REDIS_ATTEMPTS')),
        backoff: {
            type: 'exponential',
            delay: parseInt(configService.get('REDIS_BACKOFF_DELAY')),
        },
        removeOnComplete: true,
        removeOnFail: false,
    },
});
