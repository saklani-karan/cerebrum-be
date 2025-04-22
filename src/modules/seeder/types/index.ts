import { Logger } from '@nestjs/common';
import { Transactional } from '@utils/transaction';
import { tryCatch } from '@utils/try-catch';
import { EntityManager } from 'typeorm';

export abstract class AbstractSeederService extends Transactional {
    protected logger: Logger;

    constructor(manager: EntityManager) {
        super(manager);
        this.logger = new Logger(this.constructor.name);
    }

    abstract isSeedingRequired(): Promise<boolean>;

    abstract seed(): Promise<void>;

    async run() {
        return this.runTransaction(async (manager) => {
            this.logger.log('Running seeder');
            const isSeedingRequired = await this.isSeedingRequired();
            const txSeederScript = this.withTransaction(manager);

            if (!isSeedingRequired) {
                this.logger.log('Seeding is not required');
                return;
            }

            this.logger.log('Seeding is required');
            const [error, result] = await tryCatch(txSeederScript.seed());
            if (error) {
                this.logger.error('Seeding failed', error);
                throw error;
            }
            this.logger.log('Seeding completed');
        });
    }
}
