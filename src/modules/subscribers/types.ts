import { Job } from 'bullmq';

export interface ISubscriber {
    process(job: Job): Promise<void>;
}
