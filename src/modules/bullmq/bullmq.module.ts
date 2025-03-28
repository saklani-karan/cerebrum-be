// bull-mq.module.ts
import { Module, DynamicModule, Provider, Type, Logger } from '@nestjs/common';
import {
    BullModule,
    BullRootModuleOptions,
    RegisterQueueOptions,
    SharedBullConfigurationFactory,
} from '@nestjs/bullmq';
import { readdirSync, statSync } from 'fs';
import { join } from 'path';
import { extname } from 'path';
import { BullMQ, QueueConfig } from '@queue/types';

// Define interfaces for async configuration
export interface BullMQModuleOptions extends BullRootModuleOptions {}

export interface BullMQModuleOptionsFactory extends SharedBullConfigurationFactory {
    createSharedConfiguration(): Promise<BullMQModuleOptions> | BullMQModuleOptions;
}

export interface BullMQModuleAsyncOptions {
    imports?: any[];
    useExisting?: Type<BullMQModuleOptionsFactory>;
    useClass?: Type<BullMQModuleOptionsFactory>;
    useFactory?: (...args: any[]) => Promise<BullMQModuleOptions> | BullMQModuleOptions;
    inject?: any[];
}

@Module({})
export class BullMQModule {
    static forRoot(options: BullMQModuleOptions): DynamicModule {
        return {
            module: BullMQModule,
            imports: [
                BullModule.forRoot(options),
                BullModule.registerQueue(...BullMQModule.registerQueues()),
            ],
            providers: [],
            exports: [BullModule],
            global: true,
        };
    }

    static forRootAsync(options: BullMQModuleAsyncOptions): DynamicModule {
        return {
            module: BullMQModule,
            imports: [
                BullModule.forRootAsync(this.createAsyncOptionsProvider(options)),
                BullModule.registerQueue(...BullMQModule.registerQueues()),
                ...(options.imports || []),
            ],
            providers: [...this.createAsyncProviders(options)],
            exports: [BullModule],
            global: true,
        };
    }

    private static createAsyncOptionsProvider(options: BullMQModuleAsyncOptions) {
        // Pass the async options directly to BullModule.forRootAsync
        return {
            imports: options.imports || [],
            inject: options.inject || [],
            useFactory: options.useFactory,
            useClass: options.useClass,
            useExisting: options.useExisting,
        };
    }

    private static createAsyncProviders(options: BullMQModuleAsyncOptions): Provider[] {
        if (options.useExisting || options.useFactory) {
            return [];
        }

        return [
            {
                provide: options.useClass,
                useClass: options.useClass,
            },
        ];
    }

    private static registerQueues = (): RegisterQueueOptions[] => {
        const logger = new Logger('BullMQModule');
        const queueOptions: RegisterQueueOptions[] = [];
        const directoryPath = join(__dirname, '../../queue');

        // Read all files in the current directory
        const files = readdirSync(directoryPath);
        files.forEach((file) => {
            const filePath = join(directoryPath, file);

            if (
                !(
                    statSync(filePath).isFile() &&
                    ['.js', '.ts'].includes(extname(file)) &&
                    (file.endsWith('.queue.ts') || file.endsWith('.queue.js'))
                ) ||
                file.endsWith('.map') ||
                file.endsWith('.d.ts')
            ) {
                return;
            }

            let queueClass: any,
                identifier: string,
                queueConfig: QueueConfig,
                queueOption: RegisterQueueOptions;
            try {
                const module = require(filePath);
                if (module?.default?.prototype instanceof BullMQ) {
                    queueClass = module.default;
                }
            } catch (error) {
                logger.error(`Failed to import ${file}:`, error);
                return;
            }

            try {
                identifier = queueClass.queue;
            } catch (err) {
                logger.error(`Failed to get function identifier ${queueClass}:`, err);
                return;
            }

            try {
                queueConfig = queueClass.config;
            } catch (err) {
                logger.error(`Failed to get additional options ${queueClass}:`, err);
                return;
            }

            queueOption = {
                name: identifier,
                defaultJobOptions: {
                    attempts: queueConfig.retries,
                    delay: queueConfig.delay,
                },
            };

            queueOptions.push(queueOption);

            logger.log(`Registered queue ${identifier}`);
        });

        return queueOptions;
    };
}
