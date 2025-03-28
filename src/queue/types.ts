export type ThrottleOptions = {
    maxJobs: number;
    duration: number;
};

export interface QueueConfig {
    prefix?: string;
    connection?: string;
    throttle?: ThrottleOptions;
    retries?: number;
    delay?: number;
}

export abstract class IMessageQueue {
    static get queue(): string {
        throw new Error('name is not implemented');
    }

    static get type(): string {
        throw new Error('type is not implemented');
    }

    static get config(): QueueConfig {
        throw new Error('config is not implemented');
    }
}

export class BullMQ extends IMessageQueue {
    static get type(): string {
        return 'bullmq';
    }

    static get config(): QueueConfig {
        return {
            retries: 3,
            delay: 1000,
        };
    }
}
