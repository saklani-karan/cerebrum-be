import { Logger } from '@nestjs/common';
import { readdirSync, statSync } from 'fs';
import { extname, join } from 'path';
import { ISubscriber } from './types';

export const registerSubscribers = () => {
    const logger = new Logger('registerSubscribers');
    const subscribers: any[] = [];
    const directoryPath = __dirname;

    // Read all files in the current directory
    const files = readdirSync(directoryPath);
    files.forEach((file) => {
        const filePath = join(directoryPath, file);

        if (
            !(
                statSync(filePath).isFile() &&
                ['.js', '.ts'].includes(extname(file)) &&
                (file.endsWith('.subscriber.ts') || file.endsWith('.subscriber.js'))
            ) ||
            file.endsWith('.map') ||
            file.endsWith('.d.ts')
        ) {
            return;
        }

        let subscriber: ISubscriber;
        try {
            const module = require(filePath);
            if (module?.default?.prototype) {
                subscriber = module.default;
            }
        } catch (error) {
            logger.error(`failed to import ${file}:`, error);
            return;
        }

        subscribers.push(subscriber);
    });
    return subscribers;
};
