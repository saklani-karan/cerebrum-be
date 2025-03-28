import { User } from '@modules/user/user.entity';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import UserQueue from '@queue/user.queue';
import { ISubscriber } from './types';
import { Logger } from '@nestjs/common';

@Processor(UserQueue.queue)
export default class UserCreatedSubscriber extends WorkerHost implements ISubscriber {
    private readonly logger = new Logger(UserCreatedSubscriber.name);

    async process(job: Job<User>): Promise<void> {
        this.logger.log(`Processing job ${job.id}`);
        this.logger.log(job.data);

        return;
    }
}
